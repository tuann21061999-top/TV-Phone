const Favorite = require("../models/Favorite");
const Product = require("../models/Product");

// POST /api/favorites/toggle
// Toggle yêu thích: nếu đã like thì unlike, ngược lại thì like
const toggleFavorite = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user._id;

        if (!productId) {
            return res.status(400).json({ message: "Thiếu productId!" });
        }

        // Kiểm tra sản phẩm có tồn tại không
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
        }

        // Kiểm tra đã yêu thích chưa
        const existing = await Favorite.findOne({ userId, productId });

        if (existing) {
            // Đã có → Xóa (unlike)
            await Favorite.deleteOne({ _id: existing._id });
            return res.json({ isFavorited: false, message: "Đã bỏ yêu thích." });
        } else {
            // Chưa có → Thêm (like)
            await Favorite.create({ userId, productId });
            return res.json({ isFavorited: true, message: "Đã thêm vào yêu thích!" });
        }
    } catch (error) {
        console.error("Toggle Favorite Error:", error);
        res.status(500).json({ message: "Lỗi server khi toggle yêu thích." });
    }
};

// GET /api/favorites
// Lấy danh sách sản phẩm yêu thích của user hiện tại
const getUserFavorites = async (req, res) => {
    try {
        const userId = req.user._id;

        const favorites = await Favorite.find({ userId })
            .populate({
                path: "productId",
                select: "name slug colorImages variants highlights averageRating isFeatured productType",
            })
            .sort({ createdAt: -1 });

        // Lọc bỏ các favorite mà product đã bị xóa
        const products = favorites
            .filter((fav) => fav.productId !== null)
            .map((fav) => fav.productId);

        res.json(products);
    } catch (error) {
        console.error("Get User Favorites Error:", error);
        res.status(500).json({ message: "Lỗi server khi lấy danh sách yêu thích." });
    }
};

// GET /api/favorites/admin/stats
// Thống kê Admin: Top 10 sản phẩm được yêu thích nhiều nhất
const getAdminFavoriteStats = async (req, res) => {
    try {
        const stats = await Favorite.aggregate([
            {
                $group: {
                    _id: "$productId",
                    favoriteCount: { $sum: 1 },
                },
            },
            { $sort: { favoriteCount: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },
            {
                $project: {
                    _id: 0,
                    productId: "$_id",
                    productName: "$product.name",
                    productImage: {
                        $arrayElemAt: ["$product.colorImages.imageUrl", 0],
                    },
                    favoriteCount: 1,
                },
            },
        ]);

        res.json(stats);
    } catch (error) {
        console.error("Admin Favorite Stats Error:", error);
        res.status(500).json({ message: "Lỗi server khi lấy thống kê yêu thích." });
    }
};

module.exports = { toggleFavorite, getUserFavorites, getAdminFavoriteStats };
