const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cron = require("node-cron");
const http = require("http");
const { Server } = require("socket.io");
dotenv.config();
const cloudinary = require("./config/cloudinary");
const upload = require("./middleware/upload");
const Order = require("./models/Order");
const Message = require("./models/Message");
const Product = require("./models/Product");
const Promotion = require("./models/Promotion");
const fs = require("fs");



const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const errorHandler = require("./middleware/errorMiddleware");
const adminRoutes = require("./routes/adminRoutes");
const cartRoutes = require("./routes/cartRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const voucherRoutes = require("./routes/voucherRoutes");
const chatRoutes = require("./routes/chatRoutes");
const promotionRoutes = require("./routes/promotionRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const newsRoutes = require("./routes/newsRoutes");
const viewHistoryRoutes = require("./routes/viewHistoryRoutes");

const app = express();
const port = process.env.PORT || 5000;

// =============================
// ✅ TẠO HTTP SERVER + SOCKET.IO
// =============================
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Trong production nên giới hạn origin
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// =============================
// ✅ ROUTE TEST UPLOAD IMAGE
// =============================
app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload lên Cloudinary
    console.log("Attempting Cloudinary upload for:", req.file.path);
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "tv-phone-test",
    });
    console.log("Cloudinary upload success:", result.secure_url);

    // Xóa file tạm sau khi upload
    fs.unlinkSync(req.file.path);

    res.json({
      message: "Upload successful",
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error("UPLOAD ERROR DETAILS:", error);
    res.status(500).json({ message: error.message, stack: error.stack, fullError: error });
  }
});
// Lên lịch chạy ngầm: Cứ mỗi 5 phút hệ thống sẽ tự động quét 1 lần
cron.schedule("*/5 * * * *", async () => {
  try {
    // Lấy thời gian hiện tại lùi lại 15 phút trước
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);

    // TÌM VÀ CẬP NHẬT: Các đơn hàng 'pending' được tạo trước mốc 15 phút này
    // Chuyển chúng sang trạng thái 'cancelled' (Đã hủy)
    const result = await Order.updateMany(
      {
        status: "pending",
        createdAt: { $lte: fifteenMinsAgo }
      },
      {
        $set: { status: "cancelled" }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`[Cron Job] Đã tự động hủy ${result.modifiedCount} đơn hàng pending quá 15 phút.`);
    }

    // 💡 LƯU Ý: Nếu bạn muốn XÓA HẲN đơn hàng khỏi Database thay vì chuyển thành "Hủy",
    // Hãy thay câu lệnh updateMany ở trên bằng lệnh sau:
    // await Order.deleteMany({ status: "pending", createdAt: { $lte: fifteenMinsAgo } });
    // === RESET CÁC KHUYẾN MÃI HẾT HẠN ===
    const now = new Date();
    const expiredProducts = await Product.find({
      "variants.promotionEnd": { $lte: now },
      "variants.discountPrice": { $ne: null }
    });

    let resetCount = 0;
    for (const product of expiredProducts) {
      let changed = false;
      product.variants.forEach(variant => {
        if (variant.promotionEnd && variant.promotionEnd <= now && variant.discountPrice != null) {
          variant.discountType = "none";
          variant.discountValue = 0;
          variant.promotionEnd = null;
          variant.isShockDeal = false;
          variant.discountPrice = null;
          changed = true;
        }
      });
      if (changed) {
        await product.save();
        // Cũng cập nhật trong collection Promotions
        await Promotion.findOneAndUpdate(
          { productId: product._id },
          { isActive: false, discountType: "none", discountValue: 0, promotionEnd: null, discountedPrice: null }
        );
        resetCount++;
      }
    }

    if (resetCount > 0) {
      console.log(`[Cron Job] Đã reset ${resetCount} sản phẩm hết hạn khuyến mãi.`);
    }

  } catch (error) {
    console.error("Lỗi khi chạy cron job tự động hủy đơn:", error);
  }
});

// Routes chính
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/admin/inventory", inventoryRoutes);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/view-history", viewHistoryRoutes);

app.use(errorHandler);

// =============================
// ✅ SOCKET.IO - CHAT REAL-TIME
// =============================
// Lưu mapping: userId -> socketId để gửi tin nhắn đến đúng người
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`[Socket.io] User connected: ${socket.id}`);

  // Khi user đăng nhập, join room bằng userId
  socket.on("join_room", (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.join(userId); // Mỗi user có 1 room riêng = chính userId
    console.log(`[Socket.io] User ${userId} joined room`);
  });

  // Khi gửi tin nhắn
  socket.on("send_message", async (data) => {
    try {
      const { senderId, receiverId, content } = data;

      if (!senderId || !receiverId || !content) {
        return socket.emit("error_message", { message: "Thiếu thông tin tin nhắn" });
      }

      // Lưu tin nhắn vào Database
      const newMessage = await Message.create({
        senderId,
        receiverId,
        content: content.trim(),
      });

      // Emit tin nhắn đến người nhận
      io.to(receiverId).emit("receive_message", {
        _id: newMessage._id,
        senderId: newMessage.senderId,
        receiverId: newMessage.receiverId,
        content: newMessage.content,
        isRead: newMessage.isRead,
        createdAt: newMessage.createdAt,
      });

      // Emit lại cho người gửi (để confirm tin nhắn đã gửi)
      socket.emit("message_sent", {
        _id: newMessage._id,
        senderId: newMessage.senderId,
        receiverId: newMessage.receiverId,
        content: newMessage.content,
        isRead: newMessage.isRead,
        createdAt: newMessage.createdAt,
      });

    } catch (error) {
      console.error("[Socket.io] Lỗi gửi tin nhắn:", error);
      socket.emit("error_message", { message: "Lỗi gửi tin nhắn" });
    }
  });

  // Đánh dấu đã đọc real-time
  socket.on("mark_read", async ({ readerId, senderId }) => {
    try {
      await Message.updateMany(
        { senderId, receiverId: readerId, isRead: false },
        { $set: { isRead: true } }
      );
      // Thông báo cho người gửi biết tin nhắn đã được đọc
      io.to(senderId).emit("messages_read", { readerId });
    } catch (error) {
      console.error("[Socket.io] Lỗi mark read:", error);
    }
  });

  // Typing indicator
  socket.on("typing", ({ senderId, receiverId }) => {
    io.to(receiverId).emit("user_typing", { senderId });
  });

  socket.on("stop_typing", ({ senderId, receiverId }) => {
    io.to(receiverId).emit("user_stop_typing", { senderId });
  });

  // Khi user disconnect
  socket.on("disconnect", () => {
    // Xóa user khỏi map
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`[Socket.io] User ${userId} disconnected`);
        break;
      }
    }
  });
});

// CRON JOB 2: Tự động chạy mỗi 5 phút để check và xóa khuyến mãi nào hêt hạn
cron.schedule("*/5 * * * *", async () => {
  try {
    const Product = require("./models/Product"); // require here to avoid circular dep issues just in case, or we can use the top level one
    const now = new Date();
    // Tìm các sản phẩm có ít nhất 1 variant hết hạn khuyến mãi
    const products = await Product.find({
      "variants": {
        $elemMatch: {
          promotionEnd: { $lt: now, $ne: null }
        }
      }
    });

    for (const product of products) {
      let changed = false;
      for (const variant of product.variants) {
        if (variant.promotionEnd && variant.promotionEnd < now) {
          variant.discountType = "none";
          variant.discountValue = 0;
          variant.promotionEnd = null;
          variant.isShockDeal = false;
          variant.discountPrice = null;
          changed = true;
        }
      }
      if (changed) await product.save();
    }
    // console.log("[Cron] Đã dọn dẹp khuyến mãi hết hạn");
  } catch (error) {
    console.error("[Cron] Lỗi khi quản lý khuyến mãi:", error);
  }
});

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Start server (dùng HTTP server thay vì app.listen để hỗ trợ Socket.io)
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});