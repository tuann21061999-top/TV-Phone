const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        reason: String
    }],
    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

// TTL Index: Tự động xoá document khi hết hạn expiresAt
recommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Recommendation', recommendationSchema);
