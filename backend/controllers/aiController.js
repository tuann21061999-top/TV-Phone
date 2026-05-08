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

        // NÂNG CẤP PROMPT: Tập trung vào sự CỰC KỲ NGẮN GỌN, đi thẳng vào trọng tâm
        const systemInstruction = `
Bạn là "V&T Nexis Assistant" - Trợ lý tư vấn của V&T Nexis.
Phong cách: Trả lời CỰC KỲ NGẮN GỌN, đi thẳng vào trọng tâm, KHÔNG vòng vo, KHÔNG dùng nhiều emoji, KHÔNG spam giục khách hàng chốt đơn, không nói các câu marketing thừa thãi.

KỸ NÁNG CHỐT SALE VÀ TƯ VẤN:
1. Nếu khách hàng có nhu cầu mua máy hoặc hỏi thông tin, HÃY SỬ DỤNG CÔNG CỤ search_products để tìm kiếm sản phẩm.
2. LƯU Ý TỐI QUAN TRỌNG: TUYỆT ĐỐI KHÔNG dùng kiến thức cá nhân để phán xét một sản phẩm có tồn tại hay chưa. Bạn BẮT BUỘC phải dùng công cụ search_products để tìm trong Database trước khi kết luận!
3. NẾU KHÁCH YÊU CẦU THÊM VÀO GIỎ HÀNG:
   - Bạn BẮT BUỘC phải hỏi khách muốn lấy phiên bản nào (màu gì, bộ nhớ bao nhiêu) nếu chưa rõ.
   - Khi đã có đủ thông tin, sử dụng công cụ add_to_cart để thêm vào giỏ.
4. TUYỆT ĐỐI KHÔNG BAO GIỜ sử dụng dấu sao (*) hay (**) trong câu trả lời.
5. Luôn hỏi lại khách một câu hỏi NGẮN GỌN ở cuối (vd: "Bạn ưng phiên bản nào?").

QUY TẮC TRÌNH BÀY KHI GIỚI THIỆU SẢN PHẨM (BẮT BUỘC TUÂN THỦ FORMAT NÀY):
- Nêu Tên sản phẩm và mức giảm giá.
- Nổi bật: Liệt kê tối đa 3-4 điểm nổi bật bằng gạch đầu dòng (-).
- Các phiên bản còn hàng: Liệt kê theo định dạng "[RAM]/[ROM] - [Giá]đ (còn [Số lượng])".
- Xem chi tiết: Cung cấp link đặt hàng bọc trong thẻ HTML <a>.

Ví dụ mẫu BẮT BUỘC bạn phải bắt chước theo:
Vivo iQOO Z10 Turbo Plus hiện đang giảm 20%.

Nổi bật:
- AMOLED 144Hz
- Camera 50MP
- Pin 8000mAh, sạc nhanh 90W

Các phiên bản còn hàng:
- 12GB/256GB - 7.160.000đ (còn 5)
- 16GB/256GB - 8.040.000đ (còn 4)

Xem chi tiết sản phẩm: <a href="/product/vivo-iqoo-z10" style="color: #2563eb; font-weight: bold; text-decoration: none;">Tại đây</a>

THÔNG TIN THANH TOÁN & BẢO HÀNH (Chỉ nhắc khi khách hỏi):
- Thanh toán: Ship COD, VNPay, MoMo.
- Bảo hành: Cơ bản (Miễn phí 6T), Mở rộng (+300K/12T), VIP Vàng (+500K/1 đổi 1).
        `;

        // Khai báo Tool tìm kiếm sản phẩm cho Gemini
        const searchProductsTool = {
            functionDeclarations: [
                {
                    name: "search_products",
                    description: "Công cụ mạnh mẽ để tìm kiếm sản phẩm trong kho hàng. LUÔN gọi công cụ này khi khách hỏi về sản phẩm, cấu hình, giá cả.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            keyword: {
                                type: "STRING",
                                description: "Tên sản phẩm cụ thể hoặc tính năng đặc biệt (vd: 'iphone 15', 'samsung', 'chơi game'). TUYỆT ĐỐI KHÔNG điền các từ phân loại chung chung như 'sản phẩm', 'rẻ nhất', 'điện thoại', 'phụ kiện', 'điện tử' vào trường này."
                            },
                            productType: {
                                type: "STRING",
                                description: "BẮT BUỘC ĐỂ TRỐNG nếu khách nói 'sản phẩm' chung. Điền 'device' (điện thoại/máy), 'accessory' (phụ kiện/ốp/tai nghe), 'electronic' (sản phẩm điện tử/đồ điện tử/tablet/laptop)."
                            },
                            brand: {
                                type: "STRING",
                                description: "Thương hiệu (Apple, Samsung, Vivo...). Trống nếu không rõ."
                            },
                            priceMax: {
                                type: "NUMBER",
                                description: "Mức giá tối đa khách có thể trả (ví dụ: khách nói 'dưới 10 triệu' -> 10000000)."
                            },
                            ram: {
                                type: "STRING",
                                description: "Dung lượng RAM khách yêu cầu (vd: '8GB', '12GB')."
                            },
                            rom: {
                                type: "STRING",
                                description: "Dung lượng bộ nhớ lưu trữ ROM (vd: '128GB', '256GB')."
                            },
                            hasPromotion: {
                                type: "BOOLEAN",
                                description: "True nếu khách hỏi tìm máy đang giảm giá, sale, khuyến mãi, deal sốc."
                            },
                            sortMode: {
                                type: "STRING",
                                description: "Chọn 'price_desc' (nếu khách hỏi đắt nhất, cao cấp nhất), 'price_asc' (rẻ nhất), 'best_seller' (bán chạy nhất). Trống nếu không yêu cầu."
                            }
                        }
                    }
                }
            ]
        };

        const addToCartTool = {
            functionDeclarations: [
                {
                    name: "add_to_cart",
                    description: "Thêm sản phẩm vào giỏ. BẠN BẮT BUỘC PHẢI BIẾT CHÍNH XÁC productId và variantId. NẾU BẠN CHƯA BIẾT 2 ID NÀY, BẠN PHẢI GỌI CÔNG CỤ search_products TRƯỚC ĐỂ LẤY ID TỪ KHO HÀNG!",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            productId: { type: "STRING", description: "ID của sản phẩm (productId lấy từ search_products)" },
                            variantId: { type: "STRING", description: "ID của phiên bản sản phẩm (variantId lấy từ search_products)" },
                            quantity: { type: "NUMBER", description: "Số lượng (mặc định 1)" }
                        },
                        required: ["productId", "variantId"]
                    }
                }
            ]
        };

        const model = genAI.getGenerativeModel({
            model: "gemini-3.1-flash-lite",
            systemInstruction,
            tools: [searchProductsTool, addToCartTool]
        });

        const formattedHistory = (history || []).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        const chat = model.startChat({
            history: formattedHistory,
        });

        // 1. Gửi tin nhắn đầu tiên cho mô hình
        let result = await chat.sendMessage(message);
        let response = result.response;

        // 2. Kiểm tra xem mô hình có muốn gọi hàm (Tool Calling) không
        let calls = typeof response.functionCalls === 'function' ? response.functionCalls() : response.functionCalls;
        let loopCount = 0;
        
        while (calls && calls.length > 0 && loopCount < 5) {
            loopCount++;
            const call = calls[0];
            
            if (call.name === "search_products") {
                const args = call.args;
                console.log("AI kích hoạt tìm kiếm RAG với:", args);

                // --- BẮT ĐẦU LOGIC RAG ---
                const conditions = [{ isActive: true }];

                if (args.keyword && args.keyword.trim() !== "") {
                    // Tách từ khóa để bắt buộc phải có đủ các từ
                    const terms = args.keyword.trim().split(/\s+/);
                    const keywordConditions = terms.map(term => ({
                        $or: [
                            { name: new RegExp(term, "i") },
                            { highlights: new RegExp(term, "i") }
                        ]
                    }));
                    conditions.push({ $and: keywordConditions });
                }

                if (args.productType) {
                    conditions.push({ productType: args.productType });
                }
                if (args.brand) {
                    conditions.push({ brand: new RegExp(args.brand, "i") });
                }

                // Xử lý các query phức tạp nằm trong mảng `variants`
                const variantFilters = {};
                if (args.priceMax) {
                    variantFilters.price = { $lte: args.priceMax };
                }
                if (args.ram) {
                    variantFilters.size = new RegExp(args.ram, "i");
                }
                if (args.rom) {
                    variantFilters.storage = new RegExp(args.rom, "i");
                }

                if (Object.keys(variantFilters).length > 0) {
                    conditions.push({ variants: { $elemMatch: variantFilters } });
                }

                if (args.hasPromotion) {
                    // Lấy danh sách ID các máy đang có deal Flash Sale
                    const activePromos = await Promotion.find({
                        isActive: true,
                        promotionEnd: { $gt: now }
                    }).lean();
                    const promoProductIds = activePromos.map(p => p.productId);

                    // Tìm máy có Deal Flash Sale, hoặc được giảm giá trực tiếp ở máy / phân loại
                    conditions.push({
                        $or: [
                            { _id: { $in: promoProductIds } },
                            { "promotion.discountPercent": { $gt: 0 } },
                            { "variants.discountValue": { $gt: 0 } }
                        ]
                    });
                }

                // Nếu không có điều kiện nào ngoài isActive (ví dụ khách chỉ nói "xem tất cả") thì nên giới hạn lại
                const finalQuery = conditions.length > 1 ? { $and: conditions } : { isActive: true };

                let sortOptions = {};
                if (args.sortMode === "price_desc") {
                    sortOptions = { "variants.price": -1 };
                } else if (args.sortMode === "price_asc") {
                    sortOptions = { "variants.price": 1 };
                } else if (args.sortMode === "best_seller") {
                    sortOptions = { totalSold: -1 };
                }

                // Giới hạn chỉ tìm top 5 sản phẩm để tối ưu token
                const products = await Product.find(finalQuery)
                .sort(sortOptions)
                .limit(5)
                .select("name slug condition variants promotion highlights totalSold");

                let productContextStr = "";

                if (products.length === 0) {
                    productContextStr = "Không tìm thấy sản phẩm nào phù hợp với từ khóa này. Hãy xin lỗi khách và gợi ý họ tìm từ khóa khác.";
                } else {
                    productContextStr = "KẾT QUẢ TÌM KIẾM TỪ KHO HÀNG (Sử dụng thông tin này để trả lời khách):\n";
                    
                    const activePromos = await Promotion.find({
                        isActive: true,
                        promotionEnd: { $gt: now },
                        productId: { $in: products.map(p => p._id) }
                    }).lean();

                    const promoMap = {};
                    activePromos.forEach(promo => {
                        promoMap[promo.productId.toString()] = promo;
                    });

                    products.forEach(p => {
                        if (p.variants && p.variants.length > 0) {
                            const productLink = `/product/${p.slug || p._id}`;
                            const highlightsStr = p.highlights && p.highlights.length > 0
                                ? `Điểm nổi bật: ${p.highlights.join(" | ")}.`
                                : "";

                            const promoData = promoMap[p._id.toString()];
                            let flashSaleText = "";

                            if (promoData) {
                                let remainingPromo = 0;
                                if (promoData.quantityLimit > 0) {
                                    remainingPromo = promoData.quantityLimit - (promoData.soldQuantity || 0);
                                }
                                if (promoData.quantityLimit === 0 || remainingPromo > 0) {
                                    const endDate = new Date(promoData.promotionEnd).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
                                    flashSaleText = `\n🔥 DEAL SỐC CÓ GIỚI HẠN! Chỉ áp dụng cho ${promoData.quantityLimit} suất (CÒN LẠI ${remainingPromo} SUẤT). Kết thúc: ${endDate}.`;
                                }
                            }

                            productContextStr += `\n📱 Tên máy: ${p.name} (productId: ${p._id.toString()})\n🔗 Link đặt hàng: ${productLink}\n✨ ${highlightsStr}${flashSaleText}\n`;

                            let globalDiscountPercent = 0;
                            if (p.promotion?.discountPercent &&
                                (!p.promotion.startDate || new Date(p.promotion.startDate) <= now) &&
                                (!p.promotion.endDate || new Date(p.promotion.endDate) > now)) {
                                globalDiscountPercent = p.promotion.discountPercent;
                            }

                            const uniqueConfigs = {};
                            p.variants.forEach(v => {
                                if (!v.isActive) return;
                                let configKey = (v.size || v.storage) ? `${v.size ? 'RAM ' + v.size : ''}${v.size && v.storage ? ' - ' : ''}${v.storage ? 'ROM ' + v.storage : ''}` : "Bản Tiêu Chuẩn";
                                
                                let basePrice = v.price || 0;
                                let finalPrice = basePrice;
                                let promoDetail = "";

                                if (v.discountPrice != null && v.promotionEnd && new Date(v.promotionEnd) > now) {
                                    finalPrice = v.discountPrice;
                                    promoDetail = v.discountType === "percentage" ? `Đang giảm sốc ${v.discountValue}%` : `Đang giảm ${v.discountValue.toLocaleString('vi-VN')}đ`;
                                } else if (globalDiscountPercent > 0) {
                                    finalPrice = basePrice * (1 - globalDiscountPercent / 100);
                                    promoDetail = `Giảm chung ${globalDiscountPercent}%`;
                                }

                                if (!uniqueConfigs[configKey] || finalPrice < uniqueConfigs[configKey].finalPrice) {
                                    uniqueConfigs[configKey] = {
                                        variantId: v._id.toString(),
                                        configName: configKey,
                                        finalPrice: finalPrice,
                                        promoDetail: promoDetail,
                                        conditionText: p.condition === "new" ? "Mới nguyên seal" : (v.condition ? `Cũ ${v.condition}` : "Đã qua sử dụng"),
                                        stock: v.quantity || 0
                                    };
                                }
                            });

                            Object.values(uniqueConfigs).forEach(cfg => {
                                productContextStr += `   + Phân loại [${cfg.configName}] (variantId: ${cfg.variantId}) - Tình trạng [${cfg.conditionText}]: Giá chỉ ${cfg.finalPrice.toLocaleString('vi-VN')}đ. (Tồn kho: ${cfg.stock}). 🎁 KHUYẾN MÃI: ${cfg.promoDetail}\n`;
                            });
                        }
                    });
                }
                
                // 3. Gửi kết quả tìm kiếm lại cho mô hình để nó phân tích và chốt sale
                result = await chat.sendMessage([{
                    functionResponse: {
                        name: "search_products",
                        response: { content: productContextStr }
                    }
                }]);
                response = result.response;
            } else if (call.name === "add_to_cart") {
                const args = call.args;
                console.log("AI kích hoạt Thêm vào giỏ hàng:", args);

                let cartResultStr = "";
                if (!req.user) {
                    cartResultStr = "LỖI: Khách hàng chưa đăng nhập. Bạn HÃY THÔNG BÁO CHO KHÁCH RẰNG: 'Bạn vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ hàng nhé!'.";
                } else {
                    try {
                        const Cart = require("../models/Cart");
                        let cart = await Cart.findOne({ userId: req.user.id });
                        if (!cart) {
                            cart = new Cart({ userId: req.user.id, items: [] });
                        }
                        
                        const product = await Product.findById(args.productId);
                        if (!product) {
                            cartResultStr = "LỖI: Không tìm thấy sản phẩm.";
                        } else {
                            const variant = product.variants.id(args.variantId);
                            if (!variant) {
                                cartResultStr = "LỖI: Không tìm thấy phiên bản này.";
                            } else if (variant.quantity < (args.quantity || 1)) {
                                cartResultStr = "LỖI: Số lượng trong kho không đủ.";
                            } else {
                                const colorData = product.colorImages.find(c => c.colorName === variant.colorName);
                                const image = colorData ? colorData.imageUrl : (product.colorImages[0] ? product.colorImages[0].imageUrl : "");
                                
                                const itemIndex = cart.items.findIndex(
                                    (item) => item.variantId.toString() === args.variantId && item.condition === "new"
                                );
                                
                                const activePrice = (variant.discountPrice != null && variant.promotionEnd && variant.promotionEnd > now) ? variant.discountPrice : variant.price;

                                if (itemIndex > -1) {
                                    cart.items[itemIndex].quantity += (args.quantity || 1);
                                    cart.items[itemIndex].price = activePrice;
                                } else {
                                    cart.items.push({
                                        productId: args.productId,
                                        variantId: args.variantId,
                                        sku: variant.sku,
                                        name: product.name,
                                        image: image,
                                        color: variant.colorName,
                                        storage: variant.storage,
                                        condition: "new",
                                        price: activePrice,
                                        quantity: args.quantity || 1
                                    });
                                }
                                await cart.save();
                                cartResultStr = `THÀNH CÔNG: Đã thêm ${args.quantity || 1} sản phẩm ${product.name} (bản ${variant.storage || variant.size || ''}) vào giỏ hàng. HÃY THÔNG BÁO CHO KHÁCH HÀNG RẰNG ĐÃ THÊM THÀNH CÔNG VÀ HỎI HỌ CÓ CẦN GÌ NỮA KHÔNG! BẠN BẮT BUỘC PHẢI TRẢ LỜI BẰNG VĂN BẢN (KHÔNG ĐƯỢC TRẢ VỀ CHUỖI TRỐNG)!`;
                            }
                        }
                    } catch (err) {
                        cartResultStr = "LỖI: " + err.message + ". HÃY BÁO LỖI CHO KHÁCH HÀNG!";
                    }
                }

                result = await chat.sendMessage([{
                    functionResponse: {
                        name: "add_to_cart",
                        response: { content: cartResultStr }
                    }
                }]);
                response = result.response;
                response = result.response;
            }
            calls = typeof response.functionCalls === 'function' ? response.functionCalls() : response.functionCalls;
        }

        // 4. Lấy kết quả text cuối cùng
        let responseText = response.text();

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
                .select('name slug variants colorImages promotion averageRating reviewsCount totalSold');

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
                .select('name slug variants colorImages promotion averageRating reviewsCount totalSold');

            const recommendations = bestSellers.map(p => ({
                product: p,
                reason: "Sản phẩm hot nhất V&T Nexis"
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
        }).select('name slug variants colorImages promotion averageRating reviewsCount totalSold tags'); // Kéo cả trường tags để tính score

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
                .select('name slug variants colorImages promotion averageRating reviewsCount totalSold');

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
