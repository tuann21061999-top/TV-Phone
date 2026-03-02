const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// Tất cả route yêu cầu đăng nhập
router.use(protect);

/* ===============================
   PROFILE
   =============================== */

router.get("/profile", userController.getProfile);
router.put("/update", userController.updateProfile);

/* ===============================
   ADDRESS
   =============================== */

router.post("/address", userController.addAddress);
router.delete("/address/:addressId", userController.deleteAddress);
router.put("/address/:addressId", userController.updateAddress);

/* ===============================
   PAYMENT
   =============================== */

router.post("/payment", userController.addPaymentMethod);
router.delete("/payment/:paymentId", userController.deletePaymentMethod);
router.put("/payment/:paymentId", userController.updatePaymentMethod);

module.exports = router;