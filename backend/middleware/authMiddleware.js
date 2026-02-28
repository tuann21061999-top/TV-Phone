const jwt = require("jsonwebtoken");

// Lớp 1: Kiểm tra đã đăng nhập chưa
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Bạn chưa đăng nhập!" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "bi_mat_quan_su");

    req.user = decoded; // Lưu id và role vào request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
  }
};

// Lớp 2: Kiểm tra có phải Admin không
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Truy cập bị từ chối! Chỉ dành cho Admin." });
  }
};

module.exports = { protect, admin };