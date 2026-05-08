const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["order", "promotion", "system"]
    },
    isRead: { type: Boolean, default: false },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    link: String,
    metadata: Object
  },
  { timestamps: true }
);

// ✅ DATABASE INDEXES
notificationSchema.index({ userId: 1, createdAt: -1 });             // User notifications
notificationSchema.index({ userId: 1, isRead: 1 });                  // Unread count

module.exports = mongoose.model("Notification", notificationSchema);
