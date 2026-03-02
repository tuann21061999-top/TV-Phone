const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// LƯU Ý: Đổi "verifyToken" thành "protect" để khớp với authMiddleware.js của bạn
// Hãy kiểm tra thư mục của bạn tên là "middleware" hay "middlewares" nhé
const { protect, admin } = require("../middleware/authMiddleware"); 

// Tạo đơn hàng (Checkout)
router.post("/checkout", protect, orderController.createOrder);

// Xem danh sách lịch sử mua hàng
router.get("/my-orders", protect, orderController.getMyOrders);

// Xem chi tiết một đơn hàng cụ thể
router.get("/:id", protect, orderController.getOrderDetail);

router.get("/admin/all", protect, admin, orderController.getAllOrdersAdmin);
router.put("/admin/:id/status", protect, admin, orderController.updateOrderStatus);

// Route cho Admin gửi thông báo
router.put("/admin/:id/notify-delivery", protect, admin, orderController.notifyDelivery);

// Route cho Khách hàng kiểm tra và xác nhận
router.get("/notifications/pending-delivery", protect, orderController.getPendingConfirmations);
router.put("/:id/confirm-delivery", protect, orderController.confirmDelivery);

module.exports = router;