const Feedback = require("../models/Feedback");

const feedbackController = {
  // ==========================================
  // DÀNH CHO KHÁCH HÀNG (PUBLIC)
  // ==========================================
  
  // Khách hàng gửi phản hồi mới
  submitFeedback: async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      const userId = req.user ? req.user._id : null; // Lấy userId nếu dùng token đăng nhập (tùy chọn)

      if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
      }

      const newFeedback = new Feedback({
        name,
        email,
        subject,
        message,
        userId
      });

      await newFeedback.save();
      res.status(201).json({ message: "Gửi phản hồi thành công. Chúng tôi sẽ sớm liên hệ lại!" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server khi gửi phản hồi", error: error.message });
    }
  },
  // Lấy lịch sử phản hồi của user đang đăng nhập
  getMyFeedbacks: async (req, res) => {
    try {
      // Tìm các feedback có userId khớp với user đang đăng nhập
      const feedbacks = await Feedback.find({ userId: req.user._id }).sort({ createdAt: -1 });
      res.status(200).json(feedbacks);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy lịch sử phản hồi", error: error.message });
    }
  },
  // ==========================================
  // DÀNH CHO ADMIN
  // ==========================================

  // Lấy danh sách tất cả phản hồi (Sắp xếp mới nhất lên đầu)
  getAllFeedback: async (req, res) => {
    try {
      const feedbacks = await Feedback.find()
        .populate("userId", "name email") // Lấy thêm info user nếu có
        .sort({ createdAt: -1 });
      res.status(200).json(feedbacks);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách phản hồi", error: error.message });
    }
  },

  // Cập nhật trạng thái hoặc ghi chú nội bộ
  updateFeedback: async (req, res) => {
    try {
      const { status, adminNote } = req.body;
      const feedback = await Feedback.findById(req.params.id);

      if (!feedback) {
        return res.status(404).json({ message: "Không tìm thấy phản hồi này" });
      }

      if (status) feedback.status = status;
      if (adminNote !== undefined) feedback.adminNote = adminNote;

      const updatedFeedback = await feedback.save();
      res.status(200).json({ message: "Cập nhật thành công", feedback: updatedFeedback });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi cập nhật phản hồi", error: error.message });
    }
  },

  // Xóa phản hồi
  deleteFeedback: async (req, res) => {
    try {
      const deletedFeedback = await Feedback.findByIdAndDelete(req.params.id);
      if (!deletedFeedback) {
        return res.status(404).json({ message: "Không tìm thấy phản hồi để xóa" });
      }
      res.status(200).json({ message: "Đã xóa phản hồi thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi xóa phản hồi", error: error.message });
    }
  }
};

module.exports = feedbackController;