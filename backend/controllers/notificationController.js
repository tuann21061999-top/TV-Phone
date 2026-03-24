const Notification = require("../models/Notification");

const notificationController = {
  // 1. Lấy danh sách thông báo của 1 user (kèm theo các thông báo hệ thống tòan cục)
  getNotifications: async (req, res) => {
    try {
      const userId = req.user.id;
      // Tìm thông báo riêng biệt của user OR thông báo không có userId (global)
      const notifications = await Notification.find({
        $or: [{ userId }, { userId: { $exists: false } }, { userId: null }]
      }).sort({ createdAt: -1 }).limit(50);

      const unreadCount = notifications.filter(n => !n.isRead && String(n.userId) === String(userId)).length;
      
      res.status(200).json({
        notifications,
        unreadCount
      });
    } catch (error) {
      console.error("Lỗi lấy thông báo:", error);
      res.status(500).json({ message: "Lỗi server" });
    }
  },

  // 2. Đánh dấu đã đọc 1 thông báo
  markAsRead: async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await Notification.findByIdAndUpdate(
        id,
        { isRead: true },
        { new: true }
      );
      if (!notification) return res.status(404).json({ message: "Không tìm thấy" });
      res.status(200).json(notification);
    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc:", error);
      res.status(500).json({ message: "Lỗi server" });
    }
  },

  // 3. Đánh dấu đã đọc tất cả
  markAllAsRead: async (req, res) => {
    try {
      const userId = req.user.id;
      await Notification.updateMany({ userId, isRead: false }, { isRead: true });
      res.status(200).json({ message: "Đã đọc tất cả" });
    } catch (error) {
      console.error("Lỗi đánh dấu tất cả đã đọc:", error);
      res.status(500).json({ message: "Lỗi server" });
    }
  }
};

module.exports = notificationController;
