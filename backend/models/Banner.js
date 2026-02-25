const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: String,
    image: { type: String, required: true },
    link: String,
    isActive: { type: Boolean, default: true },
    order: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);