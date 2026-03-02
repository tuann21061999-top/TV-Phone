const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Bắt buộc import User model

// Lớp 1: Kiểm tra đã đăng nhập chưa
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Bạn chưa đăng nhập!" });
    }

    const token = authHeader.split(" ")[1];
    
    // Giải mã Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "bi_mat_quan_su");

    // BỔ SUNG: Truy vấn Database để xem User còn tồn tại không
    const currentUser = await User.findById(decoded.id).select("-password");
    if (!currentUser) {
      return res.status(401).json({ message: "Người dùng thuộc token này không còn tồn tại!" });
    }

    // Gán thông tin user từ DB vào request (rất tiện lợi cho các controller sử dụng req.user)
    req.user = currentUser; 
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
  }
};

// Lớp 2: Kiểm tra có phải Admin không
const admin = (req, res, next) => {
  // Vì bên protect đã gán nguyên currentUser vào req.user nên ta dùng luôn
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Truy cập bị từ chối! Chỉ dành cho Admin." });
  }
};

module.exports = { protect, admin };