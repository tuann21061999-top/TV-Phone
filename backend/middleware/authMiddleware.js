const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Bạn chưa đăng nhập!"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "bi_mat_quan_su"
    );

    req.user = decoded;
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Token không hợp lệ hoặc đã hết hạn!"
    });
  }
};

module.exports = { protect };