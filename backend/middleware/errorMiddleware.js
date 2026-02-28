const errorHandler = (err, req, res, next) => {
  console.error("🔥 Error Log:", err.stack);

  // Mặc định lỗi là 500 nếu không có status code cụ thể
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Lỗi hệ thống không xác định",
    // Chỉ hiện stack trace khi đang ở môi trường phát triển (development)
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = errorHandler;