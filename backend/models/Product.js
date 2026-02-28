const mongoose = require("mongoose");
const slugify = require("slugify");

const variantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true, trim: true },

    // Phải khớp với colorName trong colorImages
    colorName: {
      type: String,
      required: true,
    },

    storage: {
      type: String, // 128GB, 256GB
      required: true,
    },

    size: {
      type: String, // 8GB RAM (optional)
    },

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

    isActive: {
      type: Boolean,
      default: true,
    },
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
      unique: true,
      lowercase: true,
    },

    brand: {
      type: String,
      index: true,
    },


    condition: {
      type: String,
      enum: ["new", "used"],
      default: "new",
    },

    conditionLevel: {
      type: [String],
      enum: ["99%", "98%", "97%"],
      required: function () {
        return this.condition === "used";
      },
    },

    description: String,


    colorImages: [
      {
        colorName: {
          type: String,
          required: true,
        },

        imageUrl: {
          type: String,
          required: true,
        },

        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],


    productType: {
      type: String,
      required: true,
      enum: ["device", "electronic", "accessory"],
    },

    highlights: {
      type: [String],
      default: [],
      index: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    specs: {
      type: Object,
    },

    /* ===============================
       DANH SÁCH VARIANTS
       =============================== */

    variants: {
      type: [variantSchema],
      required: true,
      validate: [
        (arr) => arr.length > 0,
        "At least one variant is required",
      ],
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

/* ===============================
   VALIDATE COLOR TỒN TẠI
   =============================== */
productSchema.pre("validate", function () {
  const colorList = this.colorImages.map((c) => c.colorName);

  for (let variant of this.variants) {
    if (!colorList.includes(variant.colorName)) {
      throw new Error(
        `Color "${variant.colorName}" does not exist in colorImages`
      );
    }
  }
});
productSchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
    });
  }
});

module.exports = mongoose.model("Product", productSchema);