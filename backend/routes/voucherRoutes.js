const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucherController");
const { protect, admin } = require("../middleware/authMiddleware");

/* ================= ADMIN ROUTES ================= */

// Tạo voucher mới
router.post("/admin", protect, admin, voucherController.createVoucher);

// Lấy tất cả voucher
router.get("/admin", protect, admin, voucherController.getAllVouchers);

// Cập nhật voucher
router.put("/admin/:id", protect, admin, voucherController.updateVoucher);

// Xóa voucher
router.delete("/admin/:id", protect, admin, voucherController.deleteVoucher);

/* ================= USER ROUTES ================= */

// Lấy danh sách Voucher khả dụng của User
router.get("/my-vouchers", protect, voucherController.getUserVouchers);

// Áp dụng mã giảm giá (kiểm tra + tính tiền)
router.post("/apply", protect, voucherController.applyVoucher);

// Lưu mã giảm giá vào ví (nếu chưa có)
router.post("/save", protect, voucherController.saveVoucher);

// Lấy lịch sử đổi điểm
router.get("/redemption-history", protect, voucherController.getRedemptionHistory);

// Lấy chi tiết mã giảm giá theo code (Dùng cho trang Voucher Detail)
router.get("/:code", voucherController.getVoucherByCode);

// Đổi điểm tích lũy lấy voucher
router.post("/redeem-points", protect, voucherController.redeemPoints);


module.exports = router;
