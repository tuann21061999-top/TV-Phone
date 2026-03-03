const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cron = require("node-cron");
dotenv.config();
const cloudinary = require("./config/cloudinary");
const upload = require("./middleware/upload");
const Order = require("./models/Order");
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

const app = express();
const port = process.env.PORT || 5000;

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
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "tv-phone-test",
    });

    // Xóa file tạm sau khi upload
    fs.unlinkSync(req.file.path);

    res.json({
      message: "Upload successful",
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ message: error.message });
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

app.use(errorHandler);

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});