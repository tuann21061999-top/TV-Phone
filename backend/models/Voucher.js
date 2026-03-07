const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
    {
        // Mã voucher (VD: "GIAM50K", "SALE10")
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        // Loại giảm giá: phần trăm hoặc số tiền cố định
        discountType: {
            type: String,
            enum: ["percentage", "fixed"],
            required: true,
        },

        // Giá trị giảm (VD: 10 = 10%, hoặc 50000 = 50.000đ)
        value: {
            type: Number,
            required: true,
            min: 0,
        },

        // Giá trị đơn hàng tối thiểu để áp dụng
        minOrderValue: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Giới hạn tối đa số tiền giảm (dùng cho percentage)
        maxDiscountAmount: {
            type: Number,
            default: null,
        },

        // Ngày hết hạn
        expiryDate: {
            type: Date,
            required: true,
        },

        // Tổng lượt dùng tối đa
        usageLimit: {
            type: Number,
            default: 100,
            min: 1,
        },

        // Số lượt đã dùng
        usedCount: {
            type: Number,
            default: 0,
        },

        // Danh sách user đã dùng mã này (tránh 1 user dùng quá nhiều lần)
        usedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        // Trạng thái kích hoạt
        isActive: {
            type: Boolean,
            default: true,
        },

        // Mô tả ngắn (tùy chọn)
        description: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);


module.exports = mongoose.model("Voucher", voucherSchema);
