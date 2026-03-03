const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

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

router.put("/update-avatar", upload.single("avatar"), userController.updateAvatar);

// Lấy toàn bộ user: GET /api/users/admin/all
router.get("/admin/all", protect, admin, userController.getAllUsersAdmin);

// Cập nhật quyền: PUT /api/users/admin/:id/role
router.put("/admin/:id/role", protect, admin, userController.updateUserRoleAdmin);

// Xóa user: DELETE /api/users/admin/:id
router.delete("/admin/:id", protect, admin, userController.deleteUserAdmin);

module.exports = router;