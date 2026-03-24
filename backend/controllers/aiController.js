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

        // 1. Kéo nhanh dữ liệu Product đang Active từ Database (cho phép đọc toàn bộ danh mục)
        const products = await Product.find({ isActive: true })
            .select("name variants promotion");
        
        let productContextStr = "DANH SÁCH SẢN PHẨM HIỆN CÓ TẠI CỬA HÀNG:\n";
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
                
                let specStr = "";
                if (v.size || v.storage) {
                    specStr = `(${v.size ? 'RAM ' + v.size : ''}${v.size && v.storage ? ' - ' : ''}${v.storage ? 'ROM ' + v.storage : ''})`;
                }

                productContextStr += `- ${p.name} ${specStr}: Giá bán khoảng ${salePrice.toLocaleString('vi-VN')} đ.\n`;
            }
        });

        // 2. Thiết lập Lệnh cho AI
        const systemInstruction = `
Bạn là "TechStore Assistant" - chuyên viên tư vấn khách hàng cao cấp, nhiệt tình và am hiểu công nghệ của cửa hàng TechStore.
Phong cách giao tiếp: Chuyên nghiệp, lịch sự, thân thiện và năng động. Sử dụng biểu tượng cảm xúc (emoji) một cách tinh tế và hợp lý để cuộc trò chuyện thêm phần gần gũi (ví dụ: 😊, 📱, ✨, 🚀, 💡).
Danh xưng: Luôn xưng là "mình" hoặc "TechStore" và gọi người dùng là "bạn" hoặc "quý khách".

Nguyên tắc trả lời:
- KHÔNG BAO GIỜ sử dụng định dạng thẻ markdown (tuyệt đối không dùng dấu * hay ** để bôi đậm, in nghiêng). Chỉ dùng văn bản thuần túy và sử dụng các dấu gạch ngang (-) hoặc xuống dòng để trình bày rành mạch, dễ nhìn.
- Luôn giữ câu trả lời súc tích, đi thẳng vào trọng tâm nhu cầu của khách hàng, tự nhiên như hai người Việt Nam đang chat trực tiếp. Không viết các đoạn văn lê thê, dài dòng.
- Tuyệt đối chỉ dựa vào [DANH SÁCH SẢN PHẨM HIỆN CÓ] bên dưới để tư vấn. KHÔNG bịa đặt thêm sản phẩm ngoài danh sách, KHÔNG tự sáng tạo giá cả.
- Nếu khách hàng hỏi về một sản phẩm KHÔNG CÓ trong danh sách, hãy khéo léo thông báo: "Dạ hiện tại bên TechStore chưa có sẵn dòng máy này bạn nhé 🥺", sau đó chủ động và linh hoạt đề xuất 1-2 sản phẩm đang CÓ SẴN trong cùng tầm giá hoặc có tính năng tương đương để khách hàng tham khảo.

THÔNG TIN VỀ THANH TOÁN (Chỉ nhắc tới khi khách hỏi cách mua hàng hoặc thanh toán):
TechStore hỗ trợ 3 hình thức thanh toán vô cùng tiện lợi:
1. Thanh toán tiền mặt khi nhận hàng (Ship COD).
2. Thanh toán điện tử nhanh chóng, an toàn qua VNPay.
3. Thanh toán qua ví MoMo.

THÔNG TIN VỀ GÓI BẢO HÀNH CHÍNH HÃNG (Chỉ nhắc tới khi khách quan tâm đến hậu mãi hoặc hỏi về bảo hành, khách sẽ chọn lúc thanh toán):
- Gói Cơ bản (Miễn phí): 6 tháng bảo hành sửa chữa phần cứng tiêu chuẩn.
- Gói Mở rộng (+300.000đ): Nâng thời gian bảo hành lên 12 tháng.
- Gói VIP Vàng (+500.000đ): 12 tháng bảo hành, đặc biệt hỗ trợ lỗi 1 đổi 1 trong 30 ngày đầu tiên cực kỳ an tâm.
- Gói Kim cương (+1.000.000đ): 24 tháng siêu bảo vệ, bao gồm cả các sự cố rơi vỡ hay vào nước.

Dưới đây là cơ sở dữ liệu các sản phẩm đang có sẵn để bạn tra cứu (Không hiển thị phần này cho khách):
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
