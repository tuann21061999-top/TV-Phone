const Message = require("../models/Message");
const User = require("../models/User");
const mongoose = require("mongoose");

const chatController = {
    /* =====================================================
       LẤY LỊCH SỬ CHAT GIỮA 2 NGƯỜI
       GET /api/chat/conversation/:userId
       ===================================================== */
    getConversation: async (req, res) => {
        try {
            const myId = req.user.id;
            const partnerId = req.params.userId;

            const messages = await Message.find({
                $or: [
                    { senderId: myId, receiverId: partnerId },
                    { senderId: partnerId, receiverId: myId },
                ],
            })
                .sort({ createdAt: 1 }) // Cũ nhất trước
                .limit(200); // Giới hạn để tránh quá tải

            res.status(200).json(messages);
        } catch (error) {
            console.error("Lỗi lấy lịch sử chat:", error);
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    },

    /* =====================================================
       ADMIN: LẤY DANH SÁCH TẤT CẢ CONVERSATION
       Gom nhóm theo user, lấy tin nhắn cuối + số tin chưa đọc
       GET /api/chat/admin/conversations
       ===================================================== */
    getAdminConversations: async (req, res) => {
        try {
            // Chuyển sang ObjectId vì aggregate cần so sánh chính xác kiểu dữ liệu
            const adminId = new mongoose.Types.ObjectId(req.user.id);

            // Tìm tất cả tin nhắn liên quan đến admin
            const conversations = await Message.aggregate([
                {
                    $match: {
                        $or: [{ senderId: adminId }, { receiverId: adminId }],
                    },
                },
                {
                    // Lấy ID của người kia (không phải admin)
                    $addFields: {
                        partnerId: {
                            $cond: [
                                { $eq: ["$senderId", adminId] },
                                "$receiverId",
                                "$senderId",
                            ],
                        },
                    },
                },
                { $sort: { createdAt: -1 } },
                {
                    $group: {
                        _id: "$partnerId",
                        lastMessage: { $first: "$content" },
                        lastMessageTime: { $first: "$createdAt" },
                        unreadCount: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $ne: ["$senderId", adminId] },
                                            { $eq: ["$isRead", false] },
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },
                    },
                },
                { $sort: { lastMessageTime: -1 } },
            ]);

            // Nạp thêm thông tin user
            const populatedConversations = await Promise.all(
                conversations.map(async (conv) => {
                    const user = await User.findById(conv._id).select("name email");
                    return {
                        userId: conv._id,
                        userName: user?.name || "Người dùng",
                        userEmail: user?.email || "",
                        lastMessage: conv.lastMessage,
                        lastMessageTime: conv.lastMessageTime,
                        unreadCount: conv.unreadCount,
                    };
                })
            );

            res.status(200).json(populatedConversations);
        } catch (error) {
            console.error("Lỗi lấy danh sách chat:", error);
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    },

    /* =====================================================
       ĐÁNH DẤU TIN NHẮN ĐÃ ĐỌC
       PUT /api/chat/mark-read/:userId
       ===================================================== */
    markAsRead: async (req, res) => {
        try {
            const myId = req.user.id;
            const partnerId = req.params.userId;

            await Message.updateMany(
                { senderId: partnerId, receiverId: myId, isRead: false },
                { $set: { isRead: true } }
            );

            res.status(200).json({ message: "Đã đánh dấu đã đọc" });
        } catch (error) {
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    },

    /* =====================================================
       LẤY DANH SÁCH ADMIN (để user biết gửi cho ai)
       GET /api/chat/admins
       ===================================================== */
    getAdmins: async (req, res) => {
        try {
            const admins = await User.find({ role: "admin" }).select("_id name email");
            res.status(200).json(admins);
        } catch (error) {
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    },
};

module.exports = chatController;
