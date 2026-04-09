const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect, admin } = require("../middleware/authMiddleware"); 
const upload = require("../middleware/upload");

// CUSTOMER
router.post("/checkout", protect, orderController.createOrder);
router.get("/my-orders", protect, orderController.getMyOrders);
router.get("/notifications/pending-delivery", protect, orderController.getPendingConfirmations);
router.get("/:id", protect, orderController.getOrderDetail);
router.put("/:id/confirm-delivery", protect, orderController.confirmDelivery);
router.put("/:id/pay", protect, orderController.markOrderAsPaid);
router.put("/:id/cancel", protect, orderController.cancelOrder);
router.post("/:id/return", protect, upload.array("images", 5), orderController.requestReturn);

// ADMIN
router.get("/admin/all", protect, admin, orderController.getAllOrdersAdmin);
router.get("/admin/stats/dashboard", protect, admin, orderController.getAdminStats);
router.put("/admin/:id/status", protect, admin, orderController.updateOrderStatus);
router.put("/admin/:id/notify-delivery", protect, admin, orderController.notifyDelivery);
router.put("/admin/:id/return-action", protect, admin, orderController.handleReturnAction);

module.exports = router;