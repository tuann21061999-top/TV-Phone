const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const { protect, admin } = require("../middleware/authMiddleware");

// @desc    Nhập hàng với cập nhật giá nhập trung bình (WAC)
// @route   POST /api/admin/inventory/import
// @access  Admin
router.post("/import", protect, admin, inventoryController.importStock);

module.exports = router;
