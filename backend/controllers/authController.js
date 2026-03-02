const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ĐĂNG KÝ
exports.register = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // 1. Kiểm tra email hoặc sđt đã tồn tại chưa
    const userExists = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (userExists) {
      if (userExists.email === email) {
        return res.status(400).json({ message: "Email này đã được đăng ký!" });
      }
      if (userExists.phone === phone) {
        return res.status(400).json({ message: "Số điện thoại này đã được đăng ký!" });
      }
    }

    // 2. Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Tạo user mới (Lưu ý: map 'fullName' từ form vào 'name' trong Model)
    const newUser = new User({
      name: fullName, 
      email: email,
      phone: phone,
      password: hashedPassword,
      role: "user" // Mặc định là user
    });

    await newUser.save();
    res.status(201).json({ message: "Tạo tài khoản thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
  }
};

// ĐĂNG NHẬP
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Tìm theo email hoặc số điện thoại
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      return res.status(400).json({ message: "Tài khoản không tồn tại!" });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không chính xác!" });
    }

    // Tạo JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "bi_mat_quan_su",
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: "Đăng nhập thành công!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi đăng nhập: " + error.message });
  }
};