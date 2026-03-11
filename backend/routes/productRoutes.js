const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const { validateProduct } = require("../middleware/productMiddleware");
const { protect, admin } = require("../middleware/authMiddleware");

/* ===============================
   TOOL DỌN DẸP (CHẠY 1 LẦN RỒI XÓA DÒNG NÀY)
   Phải đặt lên trên cùng để không bị /:id nuốt
=============================== */
// Thêm tạm dòng này để chạy dọn dẹp
router.get("/cleanup-condition", productController.cleanUpConditionLevel);
router.get("/cleanup-categories", productController.cleanUpCategories);

/* ===============================
   CREATE
=============================== */
router.post("/", validateProduct, productController.createProduct);

/* ===============================
   GET ALL
=============================== */
router.get("/", productController.getAllProducts);

/* ===============================
   GET BY ID OR SLUG
=============================== */
router.get("/:id", productController.getProductById);

/* ===============================
   UPDATE STATUS (Ẩn/Hiện) - Đặt lên trước /:id
=============================== */
router.put("/:id/status", protect, admin, productController.toggleProductStatus);

/* ===============================
   UPDATE
=============================== */
router.put("/:id", validateProduct, productController.updateProduct);

/* ===============================
   DELETE
=============================== */
router.delete("/:id", protect, admin, productController.deleteProduct);

module.exports = router;