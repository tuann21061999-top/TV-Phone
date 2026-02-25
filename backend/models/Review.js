const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    username: String,
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    status: {
      type: String,
      enum: ["active", "hidden"],
      default: "active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);