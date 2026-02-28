const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const { validateProduct } = require("../middleware/productMiddleware");

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
   UPDATE
=============================== */

router.put("/:id", validateProduct, productController.updateProduct);

/* ===============================
   DELETE
=============================== */

router.delete("/:id", productController.deleteProduct);

module.exports = router;