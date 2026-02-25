const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    code: { type: String, required: true },
    type: {
      type: String,
      enum: ["reset_password", "register"],
      required: true
    },
    expireAt: { type: Date, required: true },
    isUsed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("OTP", otpSchema);