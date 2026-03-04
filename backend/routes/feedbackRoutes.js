const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");
const { protect, admin } = require("../middleware/authMiddleware"); 

// ==========================================
// PUBLIC ROUTES
// ==========================================

// POST /api/feedbacks -> Khách hàng gửi form (Có thể cho phép khách vãng lai, không cần protect)
router.post("/", feedbackController.submitFeedback);
// Thêm route này vào phần PUBLIC ROUTES (hoặc USER ROUTES)
router.get("/mine", protect, feedbackController.getMyFeedbacks);

// ==========================================
// ADMIN ROUTES
// ==========================================

// GET /api/feedbacks/admin -> Xem tất cả
router.get("/admin", protect, admin, feedbackController.getAllFeedback);

// PUT /api/feedbacks/admin/:id -> Cập nhật trạng thái / ghi chú
router.put("/admin/:id", protect, admin, feedbackController.updateFeedback);

// DELETE /api/feedbacks/admin/:id -> Xóa phản hồi
router.delete("/admin/:id", protect, admin, feedbackController.deleteFeedback);

module.exports = router;