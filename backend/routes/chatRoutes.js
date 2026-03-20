const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { protect, admin } = require("../middleware/authMiddleware");

// Lấy danh sách admin (user cần biết để mở chat)
router.get("/admins", protect, chatController.getAdmins);

// Lấy lịch sử chat giữa mình và đối phương
router.get("/conversation/:userId", protect, chatController.getConversation);

// Admin: Lấy danh sách tất cả conversation
router.get("/admin/conversations", protect, admin, chatController.getAdminConversations);

// Admin: Xoá lịch sử chat (kết thúc trò chuyện)
router.delete("/admin/conversation/:userId", protect, admin, chatController.endConversation);

// Đánh dấu tin nhắn đã đọc
router.put("/mark-read/:userId", protect, chatController.markAsRead);

module.exports = router;
