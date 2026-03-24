const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    // Tham chiếu đến sản phẩm
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: { type: String, required: true },
    productImage: { type: String },

    // Loại và giá trị giảm giá
    discountType: {
      type: String,
      enum: ["fixed", "percentage", "none"],
      default: "none",
    },
    discountValue: { type: Number, default: 0 },
    promotionEnd: { type: Date, default: null },
    isShockDeal: { type: Boolean, default: false },

    // Trạng thái
    isActive: { type: Boolean, default: true },
    quantityLimit: { type: Number, default: 0 },
    soldQuantity: { type: Number, default: 0 },

    // Dữ liệu snapshot: mức giá đại diện cho sản phẩm (variant rẻ nhất có giảm)
    originalPrice: { type: Number, default: 0 },
    discountedPrice: { type: Number, default: null },

    // Admin tạo
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Promotion", promotionSchema);