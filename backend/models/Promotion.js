const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    type: {
      type: String,
      enum: ["discount", "gift", "combo", "voucher"],
      default: "discount"
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },
    discountPercent: Number,
    discountPrice: Number,
    giftItem: String,
    startDate: Date,
    endDate: Date,
    image: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Promotion", promotionSchema);