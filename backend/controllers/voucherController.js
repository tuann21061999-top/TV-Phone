const Voucher = require("../models/Voucher");
const Notification = require("../models/Notification");

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
            const { code, discountType, value, minOrderValue, maxDiscountAmount, expiryDate, usageLimit, description, isPublic, isShocking } = req.body;

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
                isPublic: isPublic !== false, // Mặc định true
            });

            // Chỉ phát thông báo toàn hệ thống nếu Admin check chọn "Thông báo mã giảm giá sốc"
            if (isShocking) {
                try {
                    await Notification.create({
                        title: "🎁 Mã Giảm Giá Sốc",
                        message: `TechStore vừa phát hành mã giảm giá ${code.toUpperCase()}. Nhanh tay kẻo lỡ số lượng có hạn!`,
                        type: "promotion",
                        link: `/voucher/${code.toUpperCase()}`
                    });
                } catch (err) {
                    console.error("Lỗi tạo thông báo voucher:", err);
                }
            }

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

            // Nếu admin đổi mã sang một mã đã tồn tại
            if (req.body.code && req.body.code.toUpperCase() !== voucher.code) {
                const existing = await Voucher.findOne({ code: req.body.code.toUpperCase() });
                if (existing) {
                    return res.status(400).json({ message: "Mã voucher mới này đã bị trùng với một mã khác!" });
                }
            }

            const allowedFields = [
                "code", "discountType", "value", "minOrderValue",
                "maxDiscountAmount", "expiryDate", "usageLimit", "isActive", "description", "isPublic"
            ];

            allowedFields.forEach((field) => {
                if (req.body[field] !== undefined) {
                    voucher[field] = field === "code" ? req.body[field].toUpperCase() : req.body[field];
                }
            });

            await voucher.save();

            // Cho phép bắn lại thông báo mã sốc nếu tick
            if (req.body.isShocking) {
                try {
                    await Notification.create({
                        title: "🎁 Nhắc lại: Mã Giảm Giá Sốc",
                        message: `Mã giảm giá cực khủng ${voucher.code} vừa được cập nhật. Nhanh tay săn ngay!`,
                        type: "promotion",
                        link: `/voucher/${voucher.code}`
                    });
                } catch (err) { }
            }

            res.status(200).json({ message: "Cập nhật voucher thành công!", voucher });
        } catch (error) {
            console.error("Lỗi cập nhật voucher:", error);
            if (error.code === 11000) {
                return res.status(400).json({ message: "Mã voucher đã tồn tại!" });
            }
            res.status(500).json({ message: "Lỗi lưu dữ liệu!", error: error.message });
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

    /* =====================================================
       USER: LẤY CHI TIẾT MỘT VOUCHER (THEO MÃ)
       ===================================================== */
    getVoucherByCode: async (req, res) => {
        try {
            const { code } = req.params;
            const voucher = await Voucher.findOne({ code: code.toUpperCase() });

            if (!voucher) {
                return res.status(404).json({ message: "Mã giảm giá không tồn tại!" });
            }

            res.status(200).json(voucher);
        } catch (error) {
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    },

    /* =====================================================
       USER: LẤY VÍ VOUCHER KHẢ DỤNG (CỦA TÔI)
       Lọc các mã public hoặc được cấp cho User này, chưa hết hạn, và đặc biệt User chưa dùng
       ===================================================== */
    getUserVouchers: async (req, res) => {
        try {
            const userId = req.user.id;
            const now = new Date();

            const filter = {
                isActive: true,
                expiryDate: { $gt: now },
                $expr: { $lt: ["$usedCount", "$usageLimit"] },
                $or: [
                    { isPublic: true },
                    { targetUsers: userId }
                ]
            };

            const activeVouchers = await Voucher.find(filter).sort({ expiryDate: 1 });

            // Lọc ra các voucher user này CHƯA DÙNG
            const validForMe = activeVouchers.filter(v => !v.usedBy.includes(userId));

            res.status(200).json(validForMe);
        } catch (error) {
            console.error("Lỗi lấy voucher my wallet:", error);
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    },

    /* =====================================================
       USER: LƯU MÃ VÀO VÍ VOUCHER
       ===================================================== */
    saveVoucher: async (req, res) => {
        try {
            const { code } = req.body;
            const userId = req.user.id;

            if (!code) return res.status(400).json({ message: "Vui lòng nhập mã!" });

            const voucher = await Voucher.findOne({ code: code.toUpperCase() });
            if (!voucher) return res.status(404).json({ message: "Mã giảm giá không tồn tại!" });

            if (!voucher.isActive) return res.status(400).json({ message: "Mã này đã bị vô hiệu hóa!" });
            if (new Date() > new Date(voucher.expiryDate)) return res.status(400).json({ message: "Mã này đã hết hạn!" });
            if (voucher.usedCount >= voucher.usageLimit) return res.status(400).json({ message: "Mã này đã hết lượt lưu/sử dụng!" });

            // Kiểm tra đã lưu hay dùng chưa
            if (voucher.usedBy.includes(userId)) return res.status(400).json({ message: "Bạn đã sử dụng mã này rồi!" });
            
            if (voucher.isPublic) {
                return res.status(200).json({ message: "Mã này đã có sẵn trong ví của bạn!" });
            }

            if (voucher.targetUsers.includes(userId)) {
                return res.status(200).json({ message: "Mã này đã nằm trong ví của bạn!" });
            }

            // Lưu vào list targetUsers để hiện vào ví
            voucher.targetUsers.push(userId);
            await voucher.save();

            res.status(200).json({ message: "Đã lưu mã vào ví voucher của bạn!" });
        } catch (error) {
            console.error("Lỗi lưu voucher vào ví:", error);
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
