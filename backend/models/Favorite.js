const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
    },
    { timestamps: true }
);

// Mỗi user chỉ có thể yêu thích 1 sản phẩm 1 lần
favoriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);
