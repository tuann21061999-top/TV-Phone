const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

const { optionalAuth } = require('../middleware/authMiddleware');

// Mọi người đều có thể tư vấn AI mà không cần login (Tuỳ nhu cầu)
router.post('/chat', aiController.chatWithAI);

// Gợi ý sản phẩm khách hàng hoặc Guest
router.get('/recommendations', optionalAuth, aiController.getPersonalizedRecommendations);

// Gợi ý phụ kiện theo lịch sử mua hàng
router.get('/accessory-recommendations', optionalAuth, aiController.getAccessoryRecommendations);

module.exports = router;
