const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { protect, admin } = require("../middleware/authMiddleware");

// 1. Lấy giỏ hàng: GET https://tv-phone.onrender.com/api/cart
router.get("/", protect, cartController.getCart);

// 2. Thêm vào giỏ: POST https://tv-phone.onrender.com/api/cart/add
// Body: { productId, variantId, quantity, condition, conditionLevel }
router.post("/add", protect, cartController.addToCart);

// 3. Cập nhật số lượng: PUT https://tv-phone.onrender.com/api/cart/update
// Body: { itemId, quantity }
router.put("/update", protect, cartController.updateQuantity);

// 4. Xóa 1 sản phẩm: DELETE https://tv-phone.onrender.com/api/cart/remove/:itemId
router.delete("/remove/:itemId", protect, cartController.removeItem);

// 5. Làm trống giỏ: DELETE https://tv-phone.onrender.com/api/cart/clear
router.delete("/clear", protect, cartController.clearCart);

module.exports = router;