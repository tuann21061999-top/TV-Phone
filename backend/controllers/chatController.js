const Message = require("../models/Message");
const User = require("../models/User");
const mongoose = require("mongoose");

const chatController = {
    /* =====================================================
       LẤY LỊCH SỬ CHAT GIỮA KHÁCH HÀNG VÀ (CÁC) ADMIN
       GET /api/chat/conversation/:userId
       ===================================================== */
    getConversation: async (req, res) => {
        try {
            const myId = req.user.id;
            const partnerId = req.params.userId;

            // Kiểm tra xem người đang request có phải admin không
            const currentUser = await User.findById(myId);
            const isAdmin = currentUser && currentUser.role === "admin";

            let matchCondition = {};

            if (isAdmin) {
                // Nếu là Admin: Lấy TẤT CẢ tin nhắn của khách hàng này (partnerId)
                // với BẤT KỲ admin nào trong hệ thống.
                const admins = await User.find({ role: "admin" }).select("_id");
                const adminIds = admins.map(a => a._id);

                matchCondition = {
                    $or: [
                        { senderId: { $in: adminIds }, receiverId: partnerId },
                        { senderId: partnerId, receiverId: { $in: adminIds } },
                    ]
                };
            } else {
                // Nếu là Khách: Chỉ lấy tin nhắn đích danh của họ
                matchCondition = {
                    $or: [
                        { senderId: myId, receiverId: partnerId },
                        { senderId: partnerId, receiverId: myId },
                    ]
                };
            }

            const messages = await Message.find(matchCondition)
                .sort({ createdAt: 1 }) 
                .limit(200); 

            res.status(200).json(messages);
        } catch (error) {
            console.error("Lỗi lấy lịch sử chat:", error);
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    },

    /* =====================================================
       ADMIN: LẤY DANH SÁCH TẤT CẢ CONVERSATION
       GET /api/chat/admin/conversations
       ===================================================== */
    getAdminConversations: async (req, res) => {
        try {
            // Lấy danh sách ID của TẤT CẢ admin hiện có
            const admins = await User.find({ role: "admin" }).select("_id");
            const adminIds = admins.map(a => new mongoose.Types.ObjectId(a._id));

            // Tìm tất cả tin nhắn mà người gửi HOẶC người nhận là MỘT TRONG SỐ CÁC ADMIN
            const conversations = await Message.aggregate([
                {
                    $match: {
                        $or: [
                            { senderId: { $in: adminIds } },
                            { receiverId: { $in: adminIds } }
                        ],
                    },
                },
                {
                    // Lấy ID của Khách hàng (người không nằm trong mảng adminIds)
                    $addFields: {
                        partnerId: {
                            $cond: [
                                { $in: ["$senderId", adminIds] },
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
                        isArchived: { $first: "$isArchived" },
                        unreadCount: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            // Đếm tin chưa đọc nếu người gửi KHÔNG PHẢI là admin (tức là khách nhắn)
                                            { $not: { $in: ["$senderId", adminIds] } },
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
                {
                    $match: {
                        isArchived: req.query.tab === "archived" ? true : { $ne: true }
                    }
                },
                { $sort: { lastMessageTime: -1 } },
            ]);

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
            const partnerId = req.params.userId;
            
            // Bất kỳ admin nào đọc cũng sẽ đánh dấu là đã đọc cho cả hệ thống
            const admins = await User.find({ role: "admin" }).select("_id");
            const adminIds = admins.map(a => a._id);

            await Message.updateMany(
                { senderId: partnerId, receiverId: { $in: adminIds }, isRead: false },
                { $set: { isRead: true } }
            );

            res.status(200).json({ message: "Đã đánh dấu đã đọc" });
        } catch (error) {
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    },

    /* =====================================================
       LẤY DANH SÁCH ADMIN
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

    /* =====================================================
       ADMIN: KẾT THÚC TRÒ CHUYỆN (Lưu trữ lịch sử chat)
       DELETE /api/chat/admin/conversation/:userId
       ===================================================== */
    endConversation: async (req, res) => {
        try {
            const partnerId = req.params.userId;

            const admins = await User.find({ role: "admin" }).select("_id");
            const adminIds = admins.map(a => a._id);

            // Gom lịch sử vào kho lưu trữ chung, không phân biệt admin nào đã ấn kết thúc
            await Message.updateMany(
                {
                    $or: [
                        { senderId: { $in: adminIds }, receiverId: partnerId },
                        { senderId: partnerId, receiverId: { $in: adminIds } },
                    ],
                },
                { $set: { isArchived: true } }
            );

            res.status(200).json({ message: "Đã kết thúc cuộc trò chuyện và lưu vào lịch sử" });
        } catch (error) {
            console.error("Lỗi xóa/lưu trữ lịch sử chat:", error);
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    },
};

module.exports = chatController;