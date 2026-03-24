const Product = require("../models/Product");
const PromotionModel = require("../models/Promotion");

const promotionController = {
    /* =====================================================
       ADMIN: Lấy danh sách SẢN PHẨM (không phải variant) để quản lý
       GET /api/promotions/admin/promotions
    ===================================================== */
    getAllPromotions: async (req, res) => {
        try {
            const products = await Product.find()
                .populate("categoryId", "name")
                .select("-description -specs");

            const promotionList = [];

            products.forEach((product) => {
                const now = new Date();
                // Lấy thông tin discount từ variant đầu tiên (vì tất cả variants cùng chung 1 discount)
                const firstVariant = product.variants[0];
                const isActivePromo = firstVariant?.promotionEnd && new Date(firstVariant.promotionEnd) > now;

                // Giá gốc thấp nhất
                const lowestPrice = product.variants.length > 0
                    ? Math.min(...product.variants.map(v => v.price))
                    : 0;

                // Giá sau giảm thấp nhất (nếu đang giảm)
                const lowestDiscountPrice = isActivePromo
                    ? Math.min(...product.variants.filter(v => v.discountPrice != null).map(v => v.discountPrice))
                    : null;

                // WAC trung bình
                const avgImportPrice = product.variants.length > 0
                    ? Math.round(product.variants.reduce((sum, v) => sum + (v.importPrice || 0), 0) / product.variants.length)
                    : 0;

                const totalStock = product.variants.reduce((sum, v) => sum + v.quantity, 0);

                promotionList.push({
                    productId: product._id,
                    productName: product.name,
                    productType: product.productType,
                    productImage: product.colorImages[0]?.imageUrl,
                    category: product.categoryId?.name,
                    variantCount: product.variants.length,
                    totalStock,
                    lowestPrice,
                    lowestDiscountPrice,
                    avgImportPrice,

                    // Common discount settings (mọi variant dùng chung)
                    discountType: firstVariant?.discountType || "none",
                    discountValue: firstVariant?.discountValue || 0,
                    promotionEnd: firstVariant?.promotionEnd || null,
                    isShockDeal: firstVariant?.isShockDeal || false,
                    isActivePromo: !!isActivePromo
                });
            });

            res.status(200).json(promotionList);
        } catch (error) {
            console.error("Lỗi get promotions:", error);
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    },

    /* =====================================================
       ADMIN: Cập nhật Giảm giá cho toàn bộ các phiên bản của Sản phẩm
       PUT /api/promotions/admin/promotions/:productId
    ===================================================== */
    updateDiscount: async (req, res) => {
        try {
            const { productId } = req.params;
            const { discountType, discountValue, promotionEnd, isShockDeal, quantityLimit } = req.body;

            if (!["fixed", "percentage", "none"].includes(discountType)) {
                return res.status(400).json({ message: "Loại giảm giá không hợp lệ" });
            }

            if (discountType !== "none" && (!discountValue || !promotionEnd)) {
                return res.status(400).json({ message: "Phải nhập giá trị giảm và thời hạn kết thúc" });
            }

            if (discountType !== "none" && new Date(promotionEnd) <= new Date()) {
                return res.status(400).json({ message: "Thời gian kết thúc phải ở tương lai" });
            }

            const product = await Product.findById(productId);
            if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

            let isLoss = false;
            let lowestOriginalPrice = Infinity;
            let lowestDiscountedPrice = Infinity;

            // Xoay vòng cập nhật TẤT CẢ variants của sản phẩm
            product.variants.forEach(variant => {
                let updatedDiscountPrice = null;
                if (discountType === "fixed") {
                    if (discountValue < variant.price) {
                        updatedDiscountPrice = variant.price - discountValue;
                    }
                } else if (discountType === "percentage") {
                    if (discountValue > 0 && discountValue <= 99) {
                        updatedDiscountPrice = Math.round(variant.price - (variant.price * discountValue) / 100);
                    }
                }

                if (discountType === "none" || updatedDiscountPrice === null) {
                    variant.discountType = "none";
                    variant.discountValue = 0;
                    variant.promotionEnd = null;
                    variant.isShockDeal = false;
                    variant.discountPrice = null;
                } else {
                    variant.discountType = discountType;
                    variant.discountValue = discountValue || 0;
                    variant.promotionEnd = promotionEnd || null;
                    variant.isShockDeal = isShockDeal || false;
                    variant.discountPrice = updatedDiscountPrice;

                    if (updatedDiscountPrice < (variant.importPrice || 0)) {
                        isLoss = true;
                    }

                    if (variant.price < lowestOriginalPrice) lowestOriginalPrice = variant.price;
                    if (updatedDiscountPrice < lowestDiscountedPrice) lowestDiscountedPrice = updatedDiscountPrice;
                }
            });

            await product.save();

            // Lưu vào collection Promotions (upsert based on productId)
            await PromotionModel.findOneAndUpdate(
                { productId: product._id },
                {
                    productId: product._id,
                    productName: product.name,
                    productImage: product.colorImages[0]?.imageUrl,
                    discountType,
                    discountValue: discountValue || 0,
                    promotionEnd: promotionEnd || null,
                    isShockDeal: isShockDeal || false,
                    quantityLimit: quantityLimit || 0,
                    isActive: discountType !== "none",
                    originalPrice: lowestOriginalPrice === Infinity ? 0 : lowestOriginalPrice,
                    discountedPrice: lowestDiscountedPrice === Infinity ? null : lowestDiscountedPrice,
                    createdBy: req.user?.id || null,
                },
                { upsert: true, new: true }
            );

            // Gửi thông báo giảm giá cho những người đã yêu thích
            if (discountType !== "none" && lowestDiscountedPrice !== Infinity) {
                try {
                    const favorites = await Favorite.find({ productId: product._id });
                    if (favorites.length > 0) {
                        const notifications = favorites.map(f => ({
                            userId: f.userId,
                            title: "💸 Sản Phẩm Yêu Thích Ở Mức Giá Hời!",
                            message: `${product.name} đang giảm giá sâu. Tới xem ngay!`,
                            type: "promotion",
                            link: `/product/${product.slug || product._id}`
                        }));
                        await Notification.insertMany(notifications);
                    }
                } catch (err) {
                    console.error("Lỗi gửi thông báo giảm giá:", err);
                }
            }

            res.status(200).json({
                message: "Đã áp dụng khuyến mãi cho toàn bộ phiên bản của sản phẩm!",
                warning: isLoss ? "Cảnh báo: Có phiên bản đang có giá bán mới thấp hơn giá nhập (Lỗ)!" : null
            });

        } catch (error) {
            console.error("Lỗi update discount:", error);
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    },

    /* =====================================================
       ADMIN: Hủy Khuyến mãi cho toàn bộ sản phẩm
       PUT /api/promotions/admin/promotions/:productId/reset
    ===================================================== */
    resetDiscount: async (req, res) => {
        try {
            const { productId } = req.params;

            const product = await Product.findById(productId);
            if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

            product.variants.forEach(variant => {
                variant.discountType = "none";
                variant.discountValue = 0;
                variant.promotionEnd = null;
                variant.isShockDeal = false;
                variant.discountPrice = null;
            });

            await product.save();

            // Cập nhật trạng thái trong collection Promotions
            await PromotionModel.findOneAndUpdate(
                { productId: product._id },
                { isActive: false, discountType: "none", discountValue: 0, promotionEnd: null, discountedPrice: null },
                { new: true }
            );

            res.status(200).json({ message: "Đã hủy khuyến mãi cho toàn bộ thiết bị này!" });
        } catch (error) {
            console.error("Lỗi reset discount:", error);
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    },

    /* =====================================================
       PUBLIC: Lấy danh sách sản phẩm khuyến mãi
       GET /api/promotions/public/promotions?type=all|shock
    ===================================================== */
    getPublicPromotions: async (req, res) => {
        try {
            const { type } = req.query;
            const now = new Date();

            const query = {
                "variants": {
                    $elemMatch: {
                        promotionEnd: { $gt: now },
                        discountPrice: { $ne: null }
                    }
                }
            };

            if (type === "shock") {
                query["variants"].$elemMatch.isShockDeal = true;
            }

            const products = await Product.find(query).select("name slug brand colorImages variants condition productType");

            const filteredProducts = products.map(p => {
                const doc = p.toObject();
                doc.variants = doc.variants.filter(v =>
                    v.promotionEnd &&
                    new Date(v.promotionEnd) > now &&
                    v.discountPrice != null &&
                    (type !== "shock" || v.isShockDeal === true)
                );
                return doc;
            }).filter(p => p.variants.length > 0);

            res.status(200).json(filteredProducts);
        } catch (error) {
            console.error("Lỗi get public promotions:", error);
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    },

    /* =====================================================
       PUBLIC: Lấy sản phẩm khuyến mãi khủng nhất (cho Banner Home)
       GET /api/promotions/public/best
    ===================================================== */
    getBestPromotion: async (req, res) => {
        try {
            const now = new Date();
            const activePromos = await PromotionModel.find({
                isActive: true,
                promotionEnd: { $gt: now },
                discountedPrice: { $ne: null }
            }).lean();

            if (!activePromos || activePromos.length === 0) {
                return res.status(200).json(null);
            }

            // Tìm sản phẩm có phần trăm giảm cao nhất
            let bestPromo = activePromos[0];
            let maxPercent = 0;

            activePromos.forEach(p => {
                const percent = p.originalPrice > 0 ? ((p.originalPrice - p.discountedPrice) / p.originalPrice) * 100 : 0;
                const bestPercent = bestPromo.originalPrice > 0 ? ((bestPromo.originalPrice - bestPromo.discountedPrice) / bestPromo.originalPrice) * 100 : 0;
                
                if (percent > bestPercent) {
                    bestPromo = p;
                }
            });

            // Chèn thêm slug để UI điều hướng đúng
            const product = await Product.findById(bestPromo.productId).select("slug");
            if (product) {
                bestPromo.slug = product.slug;
            }

            res.status(200).json(bestPromo);
        } catch (error) {
            console.error("Lỗi get best promotion:", error);
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }
};

module.exports = promotionController;
