const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

// Import middleware kiểm tra đăng nhập (đường dẫn có thể là middleware hoặc middlewares tùy dự án của bạn)
const { protect, admin } = require("../middleware/authMiddleware"); 

// ==========================================
// CÁC ROUTES CHO ĐÁNH GIÁ (REVIEW)
// ==========================================

// 1. Tạo đánh giá mới (Bắt buộc phải đăng nhập mới được gọi)
router.post("/", protect, reviewController.createOrUpdateReview);

// PUBLIC: Lấy top reviews cho trang chủ
router.get("/top", reviewController.getTopReviews);

// ADMIN routes (phải đặt TRƯỚC /:productId để tránh bị match nhầm)
router.get("/admin/all", protect, admin, reviewController.getAllReviewsAdmin);
router.put("/admin/:id/toggle-status", protect, admin, reviewController.toggleReviewStatus);
router.delete("/admin/:id", protect, admin, reviewController.deleteReview);
router.put("/admin/:id/reply", protect, admin, reviewController.replyReview);
router.post("/admin/sync-stats", protect, admin, reviewController.syncAllReviewStats);

// Routes có params (đặt SAU các route tĩnh)
router.get("/check-eligibility/:productId", protect, reviewController.checkEligibility);

// 2. Lấy danh sách đánh giá của một sản phẩm cụ thể (đặt CUỐI CÙNG)
router.get("/:productId", reviewController.getProductReviews);

module.exports = router;