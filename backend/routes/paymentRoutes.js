const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware'); // Nếu bạn có middleware check login

// Route để Frontend lấy link thanh toán
router.post('/create-payment', protect, paymentController.createPayment);

// Các route để Cổng thanh toán gọi về (GET hoặc POST tùy cấu hình)
router.get('/vnpay-callback', paymentController.vnpayCallback);
router.get('/momo-callback', paymentController.momoCallback);

module.exports = router;