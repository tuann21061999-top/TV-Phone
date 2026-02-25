const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  color: String,
  storage: String,
  size: String,
  price: { type: Number, required: true },
  importPrice: Number,
  quantity: { type: Number, default: 0 },
  image: String
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: String,
    description: String,
    images: [String],
    type: String,
    basePrice: Number,
    variants: [variantSchema],
    slug: { type: String, unique: true },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    }
  },
  { timestamps: true }
);
productSchema.index({ name: "text", brand: "text" });

module.exports = mongoose.model("Product", productSchema);