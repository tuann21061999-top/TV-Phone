const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    username: { type: String, required: true }, // Lưu tên để hiển thị nhanh
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
    images: [{ type: String }],
    // Thêm 2 dòng này vào trong reviewSchema nếu chưa có
    adminReply: { type: String, default: null },
    adminReplyDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ["active", "hidden"],
      default: "active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);