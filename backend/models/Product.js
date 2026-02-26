const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    color: String,
    storage: String,
    size: String,
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    importPrice: {
      type: Number,
      min: 0,
    },
    quantity: {
      type: Number,
      min: 0,
      default: 0,
    },
    image: String,
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    brand: {
      type: String,
      index: true,
    },
    description: String,
    images: [String],

    productType: {
      type: String,
      required: true,
      enum: ["device", "electronic", "accessory"],
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    specs: {
      type: Object,
    },

    variants: {
      type: [variantSchema],
      required: true,
      validate: [arr => arr.length > 0, "At least one variant is required"],
    },

    compatibleWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    isFeatured: {
      type: Boolean,
      default: false,
    },

    promotion: {
      discountPercent: {
        type: Number,
        min: 0,
        max: 100,
      },
      startDate: Date,
      endDate: Date,
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    totalSold: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);