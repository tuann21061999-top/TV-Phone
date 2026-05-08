const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

const { optionalAuth } = require('../middleware/authMiddleware');

// Mọi người đều có thể tư vấn AI nhưng thêm optionalAuth để lấy req.user nếu đã đăng nhập
router.post('/chat', optionalAuth, aiController.chatWithAI);

// Gợi ý sản phẩm khách hàng hoặc Guest
router.get('/recommendations', optionalAuth, aiController.getPersonalizedRecommendations);

// Gợi ý phụ kiện theo lịch sử mua hàng
router.get('/accessory-recommendations', optionalAuth, aiController.getAccessoryRecommendations);

module.exports = router;
