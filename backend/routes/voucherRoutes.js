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

module.exports = router;
