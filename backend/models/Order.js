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
    total: Number,
    paymentMethod: { type: String, default: "COD" },
    fullName: String,
    phone: String,
    shippingAddress: String,
    province: String,
    regionFee: { type: Number, default: 0 },
    methodFee: { type: Number, default: 0 },
    warrantyFee: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        "waiting_approval",
        "pending",
        "paid",
        "done",
        "unsuccessful",
        "cancelled"
      ],
      default: "waiting_approval"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);