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

// 2. Lấy danh sách đánh giá của một sản phẩm cụ thể (Ai cũng xem được, không cần đăng nhập)
router.get("/:productId", reviewController.getProductReviews);

router.get("/admin/all", protect, admin, reviewController.getAllReviewsAdmin);
router.put("/admin/:id/toggle-status", protect, admin, reviewController.toggleReviewStatus);
router.get("/check-eligibility/:productId", protect, reviewController.checkEligibility);
router.delete("/admin/:id", protect, admin, reviewController.deleteReview);
router.put("/admin/:id/reply", protect, admin, reviewController.replyReview);

module.exports = router;