const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Favorite = require("../models/Favorite");
const ViewHistory = require("../models/ViewHistory");
const Recommendation = require("../models/Recommendation");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatWithAI = async (req, res) => {
    try {
        const { message, history } = req.body; 

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: "Thiếu GEMINI_API_KEY trong file .env" });
        }

        // 1. Kéo nhanh dữ liệu Product đang Active từ Database (giới hạn 50 mẫu hot)
        const products = await Product.find({ isActive: true })
            .select("name variants promotion")
            .limit(50);
        
        let productContextStr = "DANH SÁCH SẢN PHẨM ĐIỆN THOẠI HIỆN CÓ TẠI CỬA HÀNG:\n";
        products.forEach(p => {
            if (p.variants && p.variants.length > 0) {
                const v = p.variants[0];
                const price = v.price || 0;
                let salePrice = price;
                
                if (p.promotion?.discountPercent) {
                    salePrice = price * (1 - p.promotion.discountPercent / 100);
                } else if (v.discountType === "fixed") {
                     salePrice -= v.discountValue;
                } else if (v.discountType === "percentage") {
                     salePrice = price * (1 - v.discountValue / 100);
                }
                
                productContextStr += `- ${p.name} (RAM ${v.size || "8GB"} - ROM ${v.storage}): Giá bán khoảng ${salePrice.toLocaleString('vi-VN')} đ.\n`;
            }
        });

        // 2. Thiết lập Lệnh cho AI
        const systemInstruction = `
Bạn là "TechStore Assistant" - chuyên gia tư vấn bán hàng nhiệt tình, chuyên nghiệp của cửa hàng TechStore.
Luôn xưng hô là "mình" hoặc "TechStore" và gọi người dùng là "bạn" hoặc "quý khách".
KHÔNG BAO GIỜ sử dụng bất kỳ ký tự định dạng markdown nào (tuyệt đối không dùng dấu * hoặc **). Chỉ xuống dòng bình thường.
Nhiệm vụ của bạn là tư vấn nhiệt tình, gợi ý sản phẩm dựa trên danh sách sản phẩm cửa hàng đang có.
Nếu khách hỏi về một máy không có trong danh sách, hãy khéo léo báo "Hiện tại cửa hàng mình chưa kinh doanh dòng máy này", sau đó linh hoạt gợi ý một sản phẩm ĐANG CÓ SẴN TRONG DANH SÁCH với phân khúc tương đối tương đồng.
Tuyệt đối không bịa đặt giá cả hay sản phẩm ngoài danh sách.
Nói chuyện ngắn gọn, tự nhiên như người Việt Nam chat, không dùng format dài dòng. Dùng emoji nếu phù hợp.

THÔNG TIN VỀ THANH TOÁN:
Cửa hàng hỗ trợ 3 hình thức thanh toán khi mua hàng:
1. Thanh toán khi nhận hàng (COD).
2. Thanh toán qua VNPay.
3. Thanh toán qua MoMo.

THÔNG TIN VỀ GÓI BẢO HÀNH CHÍNH HÃNG (chọn lúc thanh toán):
- Bảo hành cơ bản: 6 tháng (miễn phí, sửa chữa phần cứng tiêu chuẩn).
- Bảo hành mở rộng: 12 tháng (+300.000đ, gia hạn thêm 6 tháng).
- Bảo hành Vàng: 12 tháng (+500.000đ, lỗi 1 đổi 1 trong 30 ngày đầu).
- Bảo hành Kim cương: 24 tháng (+1.000.000đ, bao gồm cả rơi vỡ, vào nước).

${productContextStr}
        `;

        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction
        });

        const formattedHistory = (history || []).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        const chat = model.startChat({
            history: formattedHistory,
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        res.status(200).json({ reply: responseText });

    } catch (error) {
        console.error("Lỗi AI Controller:", error);
        res.status(500).json({ message: "Hệ thống AI đang bận hoặc thiết lập Lỗi Key: " + error.message });
    }
};

/* ================================================================
   KỊCH BẢN 1: Khách chưa đăng nhập / Không có lịch sử
   → Dùng Mongoose sort lấy Best Sellers (KHÔNG dùng AI → tối ưu tốc độ)

   KỊCH BẢN 3 & 4: Khách ĐÃ đăng nhập có Orders hoặc Favorites
   → Trích xuất Tags & Brands → Gọi Gemini AI phân tích → 8 sản phẩm
================================================================ */
exports.getPersonalizedRecommendations = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : null;

        // ================================================================
        // KỊCH BẢN 1: Guest / Khách mới / Không có lịch sử
        // → Mongoose sort by totalSold
        // ================================================================
        if (!userId) {
            const bestSellers = await Product.find({ isActive: true })
                .sort({ totalSold: -1, averageRating: -1 })
                .limit(8)
                .select('name slug variants colorImages promotion averageRating totalSold');

            const recommendations = bestSellers.map(p => ({
                product: p,
                reason: "Sản phẩm đang được mua nhiều nhất"
            }));
            return res.status(200).json({ recommendations });
        }

        // ================================================================
        // KỊCH BẢN 2: Khách ĐÃ đăng nhập có Lịch sử Mua hoặc Yêu thích
        // ================================================================

        // Lấy lịch sử Mua hàng
        const recentOrders = await Order.find({ userId: userId, status: { $nin: ['cancelled', 'returned'] } })
            .sort({ createdAt: -1 }).limit(10);
        const orderProductIds = recentOrders.flatMap(o => o.items.map(i => i.productId)).filter(Boolean);

        // Lấy lịch sử yêu thích
        const favorites = await Favorite.find({ userId: userId });
        const favoriteProductIds = favorites.map(f => f.productId).filter(Boolean);

        const combinedProductIds = [...new Set([...orderProductIds.map(id => id.toString()), ...favoriteProductIds.map(id => id.toString())])];

        // Nếu KHÔNG có dữ liệu mua/tim nào → Fallback Kịch bản 1 (Best Sellers)
        if (combinedProductIds.length === 0) {
            const bestSellers = await Product.find({ isActive: true })
                .sort({ totalSold: -1, averageRating: -1 })
                .limit(8)
                .select('name slug variants colorImages promotion averageRating totalSold');

            const recommendations = bestSellers.map(p => ({
                product: p,
                reason: "Sản phẩm hot nhất TechStore"
            }));
            return res.status(200).json({ recommendations });
        }

        // Có dữ liệu: Lấy ra các tags từ những sản phẩm đó
        const interactProducts = await Product.find({ _id: { $in: combinedProductIds } }).select('tags');
        let collectedTags = [];
        interactProducts.forEach(p => {
            if (p.tags) {
                p.tags.forEach(t => collectedTags.push(t.toString()));
            }
        });

        // Xóa trùng lặp tag
        collectedTags = [...new Set(collectedTags)];

        // Query các sản phẩm CHƯA MUA nhưng có chứa các Tag mà user thích
        const suggestedProducts = await Product.find({
            isActive: true,
            _id: { $nin: combinedProductIds }, // không đề xuất lại máy đã mua/tim
            tags: { $in: collectedTags }      // phải có chung tag
        })
        .sort({ totalSold: -1 })
        .limit(8)
        .select('name slug variants colorImages promotion averageRating totalSold');

        // Nếu số lượng máy có tag đó quá ít (dưới 4 máy), bù thêm bằng hàng bán chạy
        let finalProducts = [...suggestedProducts];
        if (finalProducts.length < 8) {
             const existingIds = [...combinedProductIds, ...finalProducts.map(fp => fp._id.toString())];
             const extraProducts = await Product.find({
                 isActive: true,
                 _id: { $nin: existingIds }
             })
             .sort({ totalSold: -1 })
             .limit(8 - finalProducts.length)
             .select('name slug variants colorImages promotion averageRating totalSold');
             
             finalProducts = [...finalProducts, ...extraProducts];
        }

        const recommendations = finalProducts.map(p => ({
            product: p,
            reason: p.totalSold > 0 ? "Phù hợp với sở thích của bạn" : "Gợi ý dành riêng cho bạn"
        }));

        res.status(200).json({ recommendations });

    } catch (error) {
        console.error("Lỗi AI Recommendation:", error);
        res.status(500).json({ message: "Lấy gợi ý AI thất bại", error: error.message });
    }
};
