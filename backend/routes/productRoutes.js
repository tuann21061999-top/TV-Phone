const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const { validateProduct } = require("../middleware/productMiddleware");
const { protect, admin } = require("../middleware/authMiddleware");

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
   BULK ACTIONS - (Cần đặt trước /:id)
=============================== */
router.put("/bulk-update", protect, admin, productController.bulkUpdateProducts);
router.delete("/bulk-delete", protect, admin, productController.bulkDeleteProducts);

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