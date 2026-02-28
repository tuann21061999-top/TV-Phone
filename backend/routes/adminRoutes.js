// routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

/* ================= PRODUCT ================= */

// Tạo sản phẩm
router.post("/products", protect, admin, adminController.createProduct);

// Cập nhật sản phẩm
router.put("/products/:id", protect, admin, adminController.updateProduct);

// Ẩn sản phẩm (soft delete)
router.delete("/products/:id", protect, admin, adminController.deleteProduct);

// Lấy toàn bộ sản phẩm (admin view)
router.get("/products", protect, admin, adminController.getAllProductsAdmin);

// Toggle nổi bật
router.patch("/products/:id/feature", protect, admin, adminController.toggleFeatured);

// Cập nhật khuyến mãi
router.patch("/products/:id/promotion", protect, admin, adminController.updatePromotion);

// Cập nhật tồn kho variant
router.patch(
  "/products/:productId/variants/:variantId",
  protect,
  admin,
  adminController.updateVariantStock
);
// Toggle hiển thị sản phẩm
router.patch(
  "/products/:id/active",
  protect,
  admin,
  adminController.toggleProductActive
);

module.exports = router;