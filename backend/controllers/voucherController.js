const Voucher = require("../models/Voucher");

/* =====================================================
   HÀM TIỆN ÍCH: TÍNH SỐ TIỀN GIẢM GIÁ
   ===================================================== */
const calculateDiscount = (voucher, orderTotal) => {
    let discount = 0;

    if (voucher.discountType === "percentage") {
        discount = Math.round((orderTotal * voucher.value) / 100);
        // Giới hạn tối đa nếu có
        if (voucher.maxDiscountAmount && discount > voucher.maxDiscountAmount) {
            discount = voucher.maxDiscountAmount;
        }
    } else {
        // fixed amount
        discount = voucher.value;
    }

    // Không cho giảm quá tổng đơn hàng
    if (discount > orderTotal) {
        discount = orderTotal;
    }

    return discount;
};

/* =====================================================
   HÀM TIỆN ÍCH: VALIDATE VOUCHER
   ===================================================== */
const validateVoucher = (voucher, userId, orderTotal) => {
    // 1. Voucher còn active không?
    if (!voucher.isActive) {
        return { valid: false, message: "Mã giảm giá đã bị vô hiệu hóa!" };
    }

    // 2. Còn hạn không?
    if (new Date() > new Date(voucher.expiryDate)) {
        return { valid: false, message: "Mã giảm giá đã hết hạn!" };
    }

    // 3. Còn lượt dùng không?
    if (voucher.usedCount >= voucher.usageLimit) {
        return { valid: false, message: "Mã giảm giá đã hết lượt sử dụng!" };
    }

    // 4. User này đã dùng mã này chưa?
    if (userId && voucher.usedBy.some((id) => id.toString() === userId.toString())) {
        return { valid: false, message: "Bạn đã sử dụng mã giảm giá này rồi!" };
    }

    // 5. Đủ giá trị đơn hàng tối thiểu không?
    if (orderTotal < voucher.minOrderValue) {
        return {
            valid: false,
            message: `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString()}đ để dùng mã này!`,
        };
    }

    return { valid: true };
};

const voucherController = {
    /* =====================================================
       ADMIN: TẠO VOUCHER MỚI
       ===================================================== */
    createVoucher: async (req, res) => {
        try {
            const { code, discountType, value, minOrderValue, maxDiscountAmount, expiryDate, usageLimit, description } = req.body;

            if (!code || !discountType || value === undefined || !expiryDate) {
                return res.status(400).json({ message: "Thiếu thông tin bắt buộc (code, discountType, value, expiryDate)!" });
            }

            // Kiểm tra mã đã tồn tại
            const existingVoucher = await Voucher.findOne({ code: code.toUpperCase() });
            if (existingVoucher) {
                return res.status(400).json({ message: "Mã voucher đã tồn tại!" });
            }

            const voucher = await Voucher.create({
                code: code.toUpperCase(),
                discountType,
                value,
                minOrderValue: minOrderValue || 0,
                maxDiscountAmount: maxDiscountAmount || null,
                expiryDate,
                usageLimit: usageLimit || 100,
                description: description || "",
            });

            res.status(201).json({ message: "Tạo voucher thành công!", voucher });
        } catch (error) {
            console.error("Lỗi tạo voucher:", error);
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    },

    /* =====================================================
       ADMIN: LẤY TẤT CẢ VOUCHER
       ===================================================== */
    getAllVouchers: async (req, res) => {
        try {
            const vouchers = await Voucher.find().sort({ createdAt: -1 });
            res.status(200).json(vouchers);
        } catch (error) {
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    },

    /* =====================================================
       ADMIN: CẬP NHẬT VOUCHER
       ===================================================== */
    updateVoucher: async (req, res) => {
        try {
            const voucher = await Voucher.findById(req.params.id);
            if (!voucher) {
                return res.status(404).json({ message: "Không tìm thấy voucher!" });
            }

            const allowedFields = [
                "code", "discountType", "value", "minOrderValue",
                "maxDiscountAmount", "expiryDate", "usageLimit", "isActive", "description",
            ];

            allowedFields.forEach((field) => {
                if (req.body[field] !== undefined) {
                    voucher[field] = field === "code" ? req.body[field].toUpperCase() : req.body[field];
                }
            });

            await voucher.save();
            res.status(200).json({ message: "Cập nhật voucher thành công!", voucher });
        } catch (error) {
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    },

    /* =====================================================
       ADMIN: XÓA VOUCHER
       ===================================================== */
    deleteVoucher: async (req, res) => {
        try {
            const voucher = await Voucher.findByIdAndDelete(req.params.id);
            if (!voucher) {
                return res.status(404).json({ message: "Không tìm thấy voucher!" });
            }
            res.status(200).json({ message: "Xóa voucher thành công!" });
        } catch (error) {
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    },

    /* =====================================================
       USER: ÁP DỤNG MÃ GIẢM GIÁ
       Kiểm tra tính hợp lệ + tính số tiền giảm
       ===================================================== */
    applyVoucher: async (req, res) => {
        try {
            const { code, orderTotal } = req.body;
            const userId = req.user.id;

            if (!code) {
                return res.status(400).json({ message: "Vui lòng nhập mã giảm giá!" });
            }

            if (!orderTotal || orderTotal <= 0) {
                return res.status(400).json({ message: "Tổng đơn hàng không hợp lệ!" });
            }

            // Tìm voucher theo code
            const voucher = await Voucher.findOne({ code: code.toUpperCase() });
            if (!voucher) {
                return res.status(404).json({ message: "Mã giảm giá không tồn tại!" });
            }

            // Validate voucher
            const validation = validateVoucher(voucher, userId, orderTotal);
            if (!validation.valid) {
                return res.status(400).json({ message: validation.message });
            }

            // Tính số tiền giảm
            const discountAmount = calculateDiscount(voucher, orderTotal);

            res.status(200).json({
                message: "Áp dụng mã giảm giá thành công!",
                discountAmount,
                voucherCode: voucher.code,
                discountType: voucher.discountType,
                value: voucher.value,
            });
        } catch (error) {
            console.error("Lỗi áp dụng voucher:", error);
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    },
};

// Export controller + utility functions
module.exports = {
    ...voucherController,
    validateVoucher,
    calculateDiscount,
};
