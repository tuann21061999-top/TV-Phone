const ViewHistory = require('../models/ViewHistory');

// @desc    Record or update product view history
// @route   POST /api/view-history/record
// @access  Private
const recordView = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, productName } = req.body;

        if (!productId || !productName) {
            return res.status(400).json({ message: 'Thiếu productId hoặc productName' });
        }

        const now = Date.now();
        const existingHistory = await ViewHistory.findOne({ user: userId, product: productId });

        if (!existingHistory) {
            // Trường hợp 2: Nếu CHƯA tồn tại -> Tạo mới
            const newHistory = await ViewHistory.create({
                user: userId,
                product: productId,
                productName: productName,
                viewCount: 1,
                viewTimestamps: [now],
                lastViewedAt: now
            });
            return res.status(200).json({ message: 'Đã lưu lịch sử xem mới', history: newHistory });
        }

        // Trường hợp ĐÃ tồn tại
        // Kiểm tra spam view (ví dụ: refresh liên tục trong vòng 30s)
        const SPAM_THRESHOLD_MS = 30 * 1000;
        const timeSinceLastView = now - new Date(existingHistory.lastViewedAt).getTime();

        if (timeSinceLastView < SPAM_THRESHOLD_MS) {
            // Trường hợp 6: Tránh spam -> Chỉ cập nhật lastViewedAt
            existingHistory.lastViewedAt = now;
            await existingHistory.save();
            return res.status(200).json({ message: 'Đã bỏ qua view count do spam (refresh quá nhanh)', history: existingHistory });
        }

        // Trường hợp 3 & 4: Tăng view, thêm timestamp, và giữ tối đa 20 record
        const updatedHistory = await ViewHistory.findOneAndUpdate(
            { _id: existingHistory._id },
            {
                $set: { productName: productName, lastViewedAt: now },
                $inc: { viewCount: 1 },
                $push: {
                    viewTimestamps: {
                        $each: [now],
                        $slice: -20 // Chỉ giữ lại tối đa 20 lần xem gần nhất
                    }
                }
            },
            { returnDocument: 'after' }
        );

        res.status(200).json({ message: 'Đã cập nhật lịch sử xem', history: updatedHistory });
    } catch (error) {
        console.error('Lỗi khi lưu lịch sử xem:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// @desc    Get user's view history
// @route   GET /api/view-history
// @access  Private
const getUserHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const limit = parseInt(req.query.limit) || 10; // Mặc định lấy 10 sản phẩm xem gần nhất

        const history = await ViewHistory.find({ user: userId })
            .sort({ lastViewedAt: -1 })
            .limit(limit)
            .populate('product', 'name price image brand'); // Populate thông tin cơ bản của product để hiển thị

        res.status(200).json(history);
    } catch (error) {
        console.error('Lỗi khi lấy lịch sử xem:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

module.exports = {
    recordView,
    getUserHistory
};
