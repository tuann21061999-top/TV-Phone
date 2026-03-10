const mongoose = require('mongoose');

const viewHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    viewCount: {
        type: Number,
        default: 1
    },
    viewTimestamps: [{
        type: Date,
        default: Date.now
    }],
    lastViewedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Đảm bảo mỗi user chỉ có 1 bản ghi lịch sử xem cho 1 sản phẩm
viewHistorySchema.index({ user: 1, product: 1 }, { unique: true });
// Hỗ trợ truy vấn lịch sử xem gần đây nhanh chóng
viewHistorySchema.index({ lastViewedAt: -1 });

module.exports = mongoose.model('ViewHistory', viewHistorySchema);
