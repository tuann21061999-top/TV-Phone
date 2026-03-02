const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  variantId: mongoose.Schema.Types.ObjectId,
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: String,
  image: String,
  color: String,
  storage: String,
  quantity: Number,
  price: Number,
  importPrice: Number
});

const orderSchema = new mongoose.Schema(
  {
    email: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [orderItemSchema],
    total: Number, // Đây sẽ là tổng tiền cuối cùng khách phải trả
    
    // Thông tin giao hàng (lưu dưới dạng object cho gọn, khớp với Frontend)
    shippingInfo: {
      fullName: String,
      phone: String,
      email: String,
      addressDetail: String,
      province: String,
      district: String,
      ward: String
    },

    // Đã thay thế các fee cũ bằng các fee thực tế từ Frontend
    shippingFee: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    
    warrantyFee: { type: Number, default: 0 },
    warrantyType: { type: String, default: "Bảo hành cơ bản" },

    paymentMethod: { 
      type: String, 
      enum: ["COD", "MOMO", "VNPAY"], 
      default: "COD" 
    },
    
    paymentGatewayId: { type: String }, 
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    paymentUrl: { type: String },
    // Trong OrderSchema

    isDeliveryConfirming: { type: Boolean, default: false },
    
    status: {
      type: String,
      enum: [
        "pending",          // Đang chờ khách quét mã/nhập thẻ (MoMo/VNPay)
        "waiting_approval", // Khách đặt COD, chờ Admin duyệt
        "paid",             // Khách đã chuyển khoản online thành công, chờ Admin duyệt
        "preparing",        // Đã duyệt, đang đóng gói (Chờ vận chuyển)
        "shipping",         // Đã giao cho shipper (Đang vận chuyển)
        "done",             // Shipper giao thành công (Hoàn thành)
        "cancelled",        // Đơn bị hủy (Khách hủy hoặc Shop hủy)
        "returned"          // Đơn bị hoàn về (Khách từ chối nhận)
      ],
      default: "waiting_approval"
    }
  },
  { timestamps: true }
  
);

module.exports = mongoose.model("Order", orderSchema);