const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Favorite = require("../models/Favorite");
const ViewHistory = require("../models/ViewHistory");
const Promotion = require("../models/Promotion"); // 👈 NHỚ THÊM DÒNG NÀY ĐỂ KÉO DB KHUYẾN MÃI

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatWithAI = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: "Thiếu GEMINI_API_KEY trong file .env" });
        }

        const now = new Date();

        // 1. Kéo dữ liệu Product đang Active
        const products = await Product.find({ isActive: true })
            .select("name slug condition variants promotion highlights");

        // 2. Kéo dữ liệu KHUYẾN MÃI KHỦNG (Flash Sale / Giới hạn số lượng)
        const activePromos = await Promotion.find({
            isActive: true,
            promotionEnd: { $gt: now }
        }).lean();

        // Tạo một Map để AI tra cứu nhanh xem máy nào đang có deal giới hạn
        const promoMap = {};
        activePromos.forEach(promo => {
            promoMap[promo.productId.toString()] = promo;
        });

        let productContextStr = "DANH SÁCH SẢN PHẨM, TÍNH NĂNG VÀ KHUYẾN MÃI HIỆN CÓ:\n";

        products.forEach(p => {
            if (p.variants && p.variants.length > 0) {
                const productLink = `/product/${p.slug || p._id}`;
                const highlightsStr = p.highlights && p.highlights.length > 0
                    ? `Điểm nổi bật: ${p.highlights.join(" | ")}.`
                    : "";

                // 👉 XỬ LÝ DEAL GIỚI HẠN (SỐ LƯỢNG / THỜI GIAN)
                const promoData = promoMap[p._id.toString()];
                let flashSaleText = "";

                if (promoData) {
                    let remainingPromo = 0;
                    if (promoData.quantityLimit > 0) {
                        remainingPromo = promoData.quantityLimit - (promoData.soldQuantity || 0);
                    }

                    // Nếu không giới hạn số lượng (limit = 0) hoặc vẫn còn suất mua
                    if (promoData.quantityLimit === 0 || remainingPromo > 0) {
                        const endDate = new Date(promoData.promotionEnd).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

                        flashSaleText = `\n🔥 DEAL SỐC CÓ GIỚI HẠN: Máy này đang nằm trong chương trình ưu đãi đặc biệt!`;
                        if (promoData.quantityLimit > 0) {
                            flashSaleText += ` Chỉ áp dụng cho ${promoData.quantityLimit} suất (🚨 HIỆN TẠI CHỈ CÒN ĐÚNG ${remainingPromo} SUẤT TRỐNG).`;
                        }
                        flashSaleText += ` Thời gian kết thúc: ${endDate}.`;
                    }
                }

                // Gắn thẳng Flash sale text vào ngữ cảnh cho AI đọc
                productContextStr += `\n📱 Tên máy: ${p.name}\n🔗 Link đặt hàng: ${productLink}\n✨ ${highlightsStr}${flashSaleText}\n`;

                let globalDiscountPercent = 0;
                if (p.promotion?.discountPercent &&
                    (!p.promotion.startDate || new Date(p.promotion.startDate) <= now) &&
                    (!p.promotion.endDate || new Date(p.promotion.endDate) > now)) {
                    globalDiscountPercent = p.promotion.discountPercent;
                }

                const uniqueConfigs = {};

                p.variants.forEach(v => {
                    if (!v.isActive) return;

                    let configKey = "";
                    if (v.size || v.storage) {
                        configKey = `${v.size ? 'RAM ' + v.size : ''}${v.size && v.storage ? ' - ' : ''}${v.storage ? 'ROM ' + v.storage : ''}`;
                    } else {
                        configKey = "Bản Tiêu Chuẩn";
                    }

                    let basePrice = v.price || 0;
                    let finalPrice = basePrice;
                    let promoDetail = "";

                    if (v.discountPrice != null && v.promotionEnd && new Date(v.promotionEnd) > now) {
                        finalPrice = v.discountPrice;
                        if (v.discountType === "percentage") {
                            promoDetail = `Đang giảm sốc ${v.discountValue}% (Giá gốc: ${basePrice.toLocaleString('vi-VN')}đ)`;
                        } else if (v.discountType === "fixed") {
                            promoDetail = `Đang giảm trực tiếp ${v.discountValue.toLocaleString('vi-VN')}đ (Giá gốc: ${basePrice.toLocaleString('vi-VN')}đ)`;
                        }
                    } else if (globalDiscountPercent > 0) {
                        finalPrice = basePrice * (1 - globalDiscountPercent / 100);
                        promoDetail = `Được áp dụng mức giảm chung ${globalDiscountPercent}% của hãng (Giá gốc: ${basePrice.toLocaleString('vi-VN')}đ)`;
                    }

                    if (!uniqueConfigs[configKey] || finalPrice < uniqueConfigs[configKey].finalPrice) {
                        uniqueConfigs[configKey] = {
                            configName: configKey,
                            finalPrice: finalPrice,
                            promoDetail: promoDetail,
                            conditionText: p.condition === "new" ? "Mới nguyên seal" : (v.condition ? `Cũ ${v.condition}` : "Đã qua sử dụng"),
                            stock: v.quantity || 0
                        };
                    }
                });

                Object.values(uniqueConfigs).forEach(cfg => {
                    productContextStr += `   + Phân loại [${cfg.configName}] - Tình trạng [${cfg.conditionText}]: Giá chỉ ${cfg.finalPrice.toLocaleString('vi-VN')}đ. (Tồn kho: ${cfg.stock} chiếc)`;
                    if (cfg.promoDetail) {
                        productContextStr += ` 🎁 KHUYẾN MÃI: ${cfg.promoDetail}\n`;
                    } else {
                        productContextStr += `\n`;
                    }
                });
            }
        });

        // 3. NÂNG CẤP PROMPT: Huấn luyện kỹ năng chốt sale (Bơm thêm FOMO Deal Sốc)
        const systemInstruction = `
Bạn là "TechStore Assistant" - Siêu sao tư vấn bán hàng của TechStore.
Phong cách: Chuyên nghiệp, nhiệt tình, khéo léo chốt đơn, dùng biểu tượng cảm xúc (emoji) tự nhiên (🔥, 🎁, 👇, 📱, ✨). Xưng "mình/TechStore" và gọi khách là "bạn/quý khách".

KỸ NĂNG CHỐT SALE VÀ TƯ VẤN (BẮT BUỘC ÁP DỤNG):
1. Phân tích nhu cầu: Dựa vào "Điểm nổi bật" của sản phẩm để tư vấn đúng tâm lý khách.
2. TẠO SỰ KHAN HIẾM ĐỈNH CAO (FOMO): Nếu sản phẩm có dòng "🔥 DEAL SỐC CÓ GIỚI HẠN", BẮT BUỘC phải nhấn mạnh sự khẩn cấp! Ví dụ: "Trời ơi, mẫu này đang có Flash Sale cực hời mà chỉ còn ĐÚNG 14 SUẤT trống thôi, thời gian lại sắp hết nữa, bạn chốt lẹ kẻo lỡ nha!! 🏃‍♂️💨".
3. Tồn kho ít: Nếu tồn kho dưới 5 chiếc, hãy giục khách: "Mẫu này kho bên mình chỉ còn đúng vài chiếc cuối cùng thôi ạ!".
4. Luôn đưa Link sản phẩm: HÃY LUÔN kèm theo Link đặt hàng để khách bấm vào mua ngay. (VD: "Mời bạn xem chi tiết và đặt chốt đơn tại đây nha: [Link đặt hàng]"). 
5. Call To Action (Kêu gọi hành động): Không bao giờ kết thúc câu trả lời bằng dấu chấm lửng lơ. Luôn hỏi ngược lại: "Bạn ưng màu nào để mình giữ slot khuyến mãi cho bạn?", "Bạn muốn mình check ưu đãi trả góp không?".
6. Upsell/Cross-sell: Khách chốt máy, hãy nhẹ nhàng gợi ý mua thêm sạc/tai nghe cho tiện.

Nguyên tắc trả lời:
- Văn bản rành mạch, dùng gạch đầu dòng (-). 
- TUYỆT ĐỐI KHÔNG BAO GIỜ sử dụng dấu sao (*) hay (**) trong câu trả lời để in đậm hay tạo danh sách. Chỉ dùng chữ in hoa để nhấn mạnh nếu cần.
- Khi đưa link sản phẩm cho khách, BẮT BUỘC phải bọc trong thẻ HTML <a> để khách có thể bấm được. 
  Ví dụ mẫu: <a href="/product/honor-win-rt" style="color: #2563eb; font-weight: bold; text-decoration: none;">Bấm vào đây để xem chi tiết và đặt hàng</a>
- Trình bày rành mạch bằng cách xuống dòng hoặc dùng gạch ngang (-).

THÔNG TIN THANH TOÁN & BẢO HÀNH:
- Thanh toán: Ship COD, VNPay, MoMo.
- Bảo hành: Gói Cơ bản (Miễn phí 6T), Mở rộng (+300K/12T), VIP Vàng (+500K/1 đổi 1), Kim cương (+1.000.000đ/rơi vỡ, vào nước).

CƠ SỞ DỮ LIỆU KHO HÀNG THỰC TẾ ĐANG CÓ:
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
        let responseText = result.response.text();

        // Diệt tận gốc mọi dấu * còn sót lại
        responseText = responseText.replace(/\*/g, "");

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
        
        // Tính tần suất xuất hiện của từng tag
        let tagFrequencies = {};
        interactProducts.forEach(p => {
            if (p.tags) {
                p.tags.forEach(t => {
                    const tagStr = t.toString();
                    tagFrequencies[tagStr] = (tagFrequencies[tagStr] || 0) + 1;
                });
            }
        });

        const uniqueTags = Object.keys(tagFrequencies);

        // Lấy CÁC sản phẩm CHƯA MUA có chứa ÍT NHẤT 1 Tag mà user thích
        const candidates = await Product.find({
            isActive: true,
            _id: { $nin: combinedProductIds }, // không đề xuất lại máy đã mua/tim
            tags: { $in: uniqueTags }          // phải có chung tag
        }).select('name slug variants colorImages promotion averageRating totalSold tags'); // Kéo cả trường tags để tính score

        // Tính điểm "Độ phù hợp" (matchScore) cho từng sản phẩm
        let suggestedProducts = candidates.map(p => {
            let matchScore = 0;
            if (p.tags) {
                p.tags.forEach(t => {
                    const tagStr = t.toString();
                    if (tagFrequencies[tagStr]) {
                        matchScore += tagFrequencies[tagStr]; // Gợi ý chuẩn xác hơn nhờ cộng dồn điểm theo tần suất
                    }
                });
            }
            return { product: p, matchScore };
        });

        // Sắp xếp: Ưu tiên điểm matchScore cao nhất, nếu bằng thì xét đến totalSold
        suggestedProducts.sort((a, b) => {
            if (b.matchScore !== a.matchScore) {
                return b.matchScore - a.matchScore;
            }
            return (b.product.totalSold || 0) - (a.product.totalSold || 0);
        });

        // Lấy tối đa 8 sản phẩm đầu tiên và gỡ bỏ lớp wrapper
        suggestedProducts = suggestedProducts.slice(0, 8).map(item => item.product);

        // Nếu số lượng máy có tag đó quá ít (dưới 8 máy), bù thêm bằng hàng bán chạy
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

/* ================================================================
   GỢI Ý PHỤ KIỆN TƯƠNG THÍCH THEO LỊCH SỬ MUA HÀNG
================================================================ */
exports.getAccessoryRecommendations = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : null;
        let finalProducts = [];
        
        // Cần tìm type là 'accessory'
        const accessoryTypeCondition = { productType: 'accessory', isActive: true };

        // Fallback chung cho khách vãng lai hoặc người chưa mua gì
        const fallbackToTopAccessories = async () => {
            const bestSellers = await Product.find(accessoryTypeCondition)
                .sort({ totalSold: -1, averageRating: -1 })
                .limit(8)
                .select('name slug variants colorImages promotion averageRating totalSold');

            return bestSellers.map(p => ({
                product: p,
                reason: "Phụ kiện hot gợi ý cho bạn"
            }));
        };

        if (!userId) {
            const recommendations = await fallbackToTopAccessories();
            return res.status(200).json({ recommendations });
        }

        // Lấy lịch sử Mua hàng
        const recentOrders = await Order.find({ userId: userId, status: { $nin: ['cancelled', 'returned'] } })
            .sort({ createdAt: -1 }).limit(10);
            
        const orderProductIds = recentOrders.flatMap(o => o.items.map(i => i.productId)).filter(Boolean);

        if (orderProductIds.length === 0) {
            const recommendations = await fallbackToTopAccessories();
            return res.status(200).json({ recommendations });
        }

        const suggestedProducts = await Product.find({
            ...accessoryTypeCondition,
            compatibleWith: { $in: orderProductIds }
        })
            .sort({ totalSold: -1 })
            .limit(8)
            .select('name slug variants colorImages promotion averageRating totalSold compatibleWith');

        finalProducts = [...suggestedProducts];

        // Nếu số lượng máy có tag đó quá ít (dưới 8 máy), bù thêm bằng hàng bán chạy
        if (finalProducts.length < 8) {
            const existingIds = finalProducts.map(fp => fp._id.toString());
            const extraProducts = await Product.find({
                ...accessoryTypeCondition,
                _id: { $nin: existingIds }
            })
                .sort({ totalSold: -1 })
                .limit(8 - finalProducts.length)
                .select('name slug variants colorImages promotion averageRating totalSold');

            finalProducts = [...finalProducts, ...extraProducts];
        }

        const orderProductIdsStr = orderProductIds.map(id => id.toString());

        const recommendations = finalProducts.map(p => {
            // Kiểm tra mức độ tương thích để hiển thị nhãn lý do thích hợp
            const pObj = p.toObject ? p.toObject() : p;
            let isCompatible = false;
            
            if (pObj.compatibleWith && Array.isArray(pObj.compatibleWith)) {
                isCompatible = pObj.compatibleWith.some(id => orderProductIdsStr.includes(id.toString()));
            }

            return {
                product: p,
                reason: isCompatible ? "Phù hợp với thiết bị bạn đang dùng" : "Phụ kiện hot gợi ý cho bạn"
            };
        });

        res.status(200).json({ recommendations });

    } catch (error) {
        console.error("Lỗi AI Accessory Recommendation:", error);
        res.status(500).json({ message: "Lấy gợi ý phụ kiện thất bại", error: error.message });
    }
};
