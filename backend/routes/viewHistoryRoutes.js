const express = require('express');
const router = express.Router();
const { recordView, getUserHistory } = require('../controllers/viewHistoryController');
const { protect } = require('../middleware/authMiddleware');

router.post('/record', protect, recordView);
router.get('/', protect, getUserHistory);

module.exports = router;
