const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
    toggleFavorite,
    getUserFavorites,
    getAdminFavoriteStats,
} = require("../controllers/favoriteController");

// Toggle yêu thích (like/unlike)
router.post("/toggle", protect, toggleFavorite);

// Lấy danh sách yêu thích của user hiện tại
router.get("/", protect, getUserFavorites);

// Admin: Thống kê top sản phẩm được yêu thích nhất
router.get("/admin/stats", protect, admin, getAdminFavoriteStats);

module.exports = router;
