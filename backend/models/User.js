const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  province: String,
  district: String,
  ward: String,
  detail: String,
  isDefault: { type: Boolean, default: false }
});

const paymentMethodSchema = new mongoose.Schema({
  type: String,
  provider: String,
  accountNumber: String,
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    addresses: [addressSchema],
    wishlist: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        addedAt: { type: Date, default: Date.now }
      }
    ],
    paymentMethods: [paymentMethodSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);