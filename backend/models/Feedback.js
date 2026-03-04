const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true }, 
    message: { type: String, required: true },
    
    // Tùy chọn: Gắn với user nếu họ đã đăng nhập lúc gửi
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
    
    // Quản lý trạng thái cho Admin
    status: {
      type: String,
      enum: ["new", "read", "resolved"], // Mới gửi, Đã xem, Đã giải quyết
      default: "new",
    },
    
    // Ghi chú nội bộ của Admin (Khách hàng không thấy phần này)
    adminNote: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);