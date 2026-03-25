const News = require("../models/News");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// @desc    Upload ảnh cho bài viết News lên Cloudinary (folder: tv-phone-news)
// @route   POST /api/news/upload-image
// @access  Private/Admin
const uploadNewsImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Không có file ảnh nào được gửi lên" });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "tv-phone-news",
        });

        // Xóa file tạm sau khi upload
        fs.unlinkSync(req.file.path);

        res.json({ imageUrl: result.secure_url });
    } catch (error) {
        console.error("UPLOAD NEWS IMAGE ERROR:", error);
        res.status(500).json({ message: "Lỗi upload ảnh", error: error.message });
    }
};

// @desc    Lấy tất cả bài viết (Public - Chỉ lấy bài isActive: true)
// @route   GET /api/news
// @access  Public
const getAllNews = async (req, res) => {
    try {
        const news = await News.find({ isActive: true })
            .populate("relatedProduct", "name slug")
            .sort({ createdAt: -1 });
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: "Lỗi tải bài viết", error: error.message });
    }
};

// @desc    Lấy tất cả bài viết cho Admin (Bao gồm cả bài ẩn)
// @route   GET /api/news/admin/all
// @access  Private/Admin
const getAdminNews = async (req, res) => {
    try {
        const news = await News.find()
            .populate("relatedProduct", "name slug")
            .sort({ createdAt: -1 });
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: "Lỗi tải danh sách bài viết", error: error.message });
    }
};

// @desc    Lấy chi tiết 1 bài viết theo slug + bài viết liên quan
// @route   GET /api/news/:slug
// @access  Public
const getNewsBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const news = await News.findOneAndUpdate(
            { slug },
            { $inc: { views: 1 } },
            { returnDocument: 'after' }
        ).populate("relatedProduct", "name slug colorImages variants highlights productType");

        if (!news) {
            return res.status(404).json({ message: "Không tìm thấy bài viết" });
        }

        if (!news.isActive && (!req.user || req.user.role !== "admin")) {
            return res.status(404).json({ message: "Bài viết này đã bị ẩn" });
        }

        // Tìm bài viết liên quan
        let relatedArticles = [];

        // Ưu tiên 1: Cùng sản phẩm liên kết
        if (news.relatedProduct) {
            relatedArticles = await News.find({
                _id: { $ne: news._id },
                isActive: true,
                relatedProduct: news.relatedProduct._id || news.relatedProduct,
            })
                .select("title slug thumbnail category shortDescription createdAt")
                .sort({ createdAt: -1 })
                .limit(4);
        }

        // Nếu chưa đủ 4 bài → bổ sung từ cùng danh mục
        if (relatedArticles.length < 4) {
            const existingIds = [news._id, ...relatedArticles.map((a) => a._id)];
            const more = await News.find({
                _id: { $nin: existingIds },
                isActive: true,
                category: news.category,
            })
                .select("title slug thumbnail category shortDescription createdAt")
                .sort({ createdAt: -1 })
                .limit(4 - relatedArticles.length);
            relatedArticles = [...relatedArticles, ...more];
        }

        res.json({ article: news, relatedArticles });
    } catch (error) {
        res.status(500).json({ message: "Lỗi tải bài viết", error: error.message });
    }
};

// @desc    Tạo bài viết mới
// @route   POST /api/news
// @access  Private/Admin
const createNews = async (req, res) => {
    try {
        console.log("=== CREATE NEWS BODY ===", JSON.stringify(req.body, null, 2));
        const newDoc = await News.create(req.body);
        res.status(201).json(newDoc);
    } catch (error) {
        console.error("CREATE NEWS ERROR:", error);
        res.status(400).json({ message: error.message || "Không thể tạo bài viết", error: error.message });
    }
};

// @desc    Cập nhật bài viết
// @route   PUT /api/news/:id
// @access  Private/Admin
const updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const newsDoc = await News.findById(id);
        if (!newsDoc) return res.status(404).json({ message: "Không tìm thấy bài viết" });

        Object.keys(req.body).forEach((key) => {
            newsDoc[key] = req.body[key];
        });

        await newsDoc.save();
        res.json(newsDoc);
    } catch (error) {
        res.status(400).json({ message: "Không thể cập nhật bài viết", error: error.message });
    }
};

// @desc    Xóa bài viết
// @route   DELETE /api/news/:id
// @access  Private/Admin
const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        const news = await News.findByIdAndDelete(id);
        if (!news) {
            return res.status(404).json({ message: "Không tìm thấy bài viết" });
        }
        res.json({ message: "Đã xóa bài viết thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa bài viết", error: error.message });
    }
};

// @desc    Bật / Tắt trạng thái bài viết
// @route   PATCH /api/news/:id/toggle
// @access  Private/Admin
const toggleNewsStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const news = await News.findById(id);
        if (!news) {
            return res.status(404).json({ message: "Không tìm thấy bài viết" });
        }
        news.isActive = !news.isActive;
        await news.save();
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi đổi trạng thái bài viết", error: error.message });
    }
};

module.exports = {
    uploadNewsImage,
    getAllNews,
    getAdminNews,
    getNewsBySlug,
    createNews,
    updateNews,
    deleteNews,
    toggleNewsStatus,
};
