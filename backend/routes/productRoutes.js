const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const { validateProduct } = require("../middleware/productMiddleware");

router.post("/", validateProduct, productController.createProduct);

router.get("/", productController.getAllProducts);

router.get("/:id", productController.getProductById);

router.put("/:id", validateProduct, productController.updateProduct);

router.delete("/:id", productController.deleteProduct);

module.exports = router;