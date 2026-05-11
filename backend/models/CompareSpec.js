const mongoose = require("mongoose");
const slugify = require("slugify");

const tierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  rank: {
    type: Number,
    required: true,
  },
}, { _id: true });

const compareSpecSchema = new mongoose.Schema(
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
    order: {
      type: Number,
      required: true,
      default: 1,
    },
    tiers: {
      type: [tierSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

compareSpecSchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      locale: "vi",
    });
  }
});

module.exports = mongoose.model("CompareSpec", compareSpecSchema);
