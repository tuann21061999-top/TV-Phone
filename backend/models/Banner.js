const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Không bắt buộc, dùng khi banner dành riêng cho 1 sản phẩm
    title: { type: String, required: true }, // Tiêu đề chính (VD: "iPhone 15 Pro Max")
    subtitle: { type: String },              // Tiêu đề phụ (VD: "Mạnh mẽ vượt trội. Giảm 10%")
    image: { type: String, required: true }, // URL ảnh banner
    link: { type: String, required: true },  // Link khi click vào (VD: "/product/iphone-15")
    buttonText: { type: String, default: "Xem chi tiết" }, // Chữ trên nút
    
    // Điều khiển hiển thị
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },     // Thứ tự xuất hiện trên Slider
    
    // Tự động chạy chiến dịch (Tùy chọn nâng cao)
    startDate: { type: Date },               // Tự động hiện từ ngày
    endDate: { type: Date }                  // Tự động ẩn sau ngày
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);