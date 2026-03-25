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

      const formattedNotifs = notifications.map(n => {
        const notifObj = n.toObject();
        if (!notifObj.userId) {
          notifObj.isRead = Array.isArray(notifObj.readBy) && notifObj.readBy.some(id => String(id) === String(userId));
        }
        return notifObj;
      });

      const unreadCount = formattedNotifs.filter(n => !n.isRead).length;
      
      res.status(200).json({
        notifications: formattedNotifs,
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
      const notification = await Notification.findById(id);
      if (!notification) return res.status(404).json({ message: "Không tìm thấy" });

      if (notification.userId) {
        notification.isRead = true;
      } else {
        if (!notification.readBy) notification.readBy = [];
        if (!notification.readBy.includes(req.user.id)) {
          notification.readBy.push(req.user.id);
        }
      }
      
      await notification.save();
      const updatedObj = notification.toObject();
      updatedObj.isRead = true; // For frontend
      
      res.status(200).json(updatedObj);
    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc:", error);
      res.status(500).json({ message: "Lỗi server" });
    }
  },

  // 3. Đánh dấu đã đọc tất cả
  markAllAsRead: async (req, res) => {
    try {
      const userId = req.user.id;
      // 1. Đánh dấu thông báo cá nhân
      await Notification.updateMany({ userId, isRead: false }, { isRead: true });
      
      // 2. Đánh dấu thông báo toàn cục: PUSH userId vào mảng readBy
      const globalUnread = await Notification.find({
        $or: [{ userId: { $exists: false } }, { userId: null }],
        readBy: { $ne: userId }
      });
      
      if (globalUnread.length > 0) {
        for (const notif of globalUnread) {
          notif.readBy.push(userId);
          await notif.save();
        }
      }
      
      res.status(200).json({ message: "Đã đọc tất cả" });
    } catch (error) {
      console.error("Lỗi đánh dấu tất cả đã đọc:", error);
      res.status(500).json({ message: "Lỗi server" });
    }
  }
};

module.exports = notificationController;
