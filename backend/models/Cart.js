const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID của variant trong mảng variants
  sku: String,           // Lưu để dễ quản lý kho
  name: String,
  image: String,
  color: String,
  storage: String,
  condition: String,     // Lưu "new" hoặc "used"
  conditionLevel: String, // Lưu "99%", "98%" nếu có
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1, min: 1 }
});

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    items: [cartItemSchema],
    // total nên mặc định là 0
    total: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Middleware tự động tính lại tổng tiền trước khi save
cartSchema.pre("save", function () {
  this.total = this.items.reduce((acc, item) => {
    return acc + (item.price * item.quantity);
  }, 0);
});

module.exports = mongoose.model("Cart", cartSchema);