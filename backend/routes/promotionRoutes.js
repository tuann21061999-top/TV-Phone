const express = require("express");
const router = express.Router();
const promotionController = require("../controllers/promotionController");
const { protect, admin } = require("../middleware/authMiddleware");

// Admin: Lấy danh sách sản phẩm để quản lý khuyến mãi (nhóm theo sản phẩm, không phải variant)
router.get("/admin/promotions", protect, admin, promotionController.getAllPromotions);

// Admin: Cập nhật khuyến mãi cho TOÀN BỘ variants của một sản phẩm
router.put("/admin/promotions/:productId", protect, admin, promotionController.updateDiscount);

// Admin: Hủy khuyến mãi cho TOÀN BỘ variants của một sản phẩm
router.put("/admin/promotions/:productId/reset", protect, admin, promotionController.resetDiscount);

// Public: Lấy danh sách sản phẩm đang có khuyến mãi (tất cả hoặc shock deals)
router.get("/public/promotions", promotionController.getPublicPromotions);

module.exports = router;
