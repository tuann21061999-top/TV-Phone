const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const OTP = require("../models/OTP");
const sendEmail = require("../utils/sendEmail");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client("250807668016-8p2k3cisiadd70rclj8graue584iechr.apps.googleusercontent.com");

// ĐĂNG KÝ (GỬI OTP)
exports.sendRegisterOTP = async (req, res) => {
  try {
    const { email, phone } = req.body;
    
    // Kiểm tra trùng
    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      if (userExists.email === email) return res.status(400).json({ message: "Email này đã được đăng ký!" });
      if (userExists.phone === phone) return res.status(400).json({ message: "Số điện thoại này đã được đăng ký!" });
    }

    // Xóa OTP đăng ký cũ của email này
    await OTP.deleteMany({ email, type: "register" });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newOTP = new OTP({
      email,
      code: otpCode,
      type: "register",
      expireAt: new Date(Date.now() + 5 * 60 * 1000)
    });
    await newOTP.save();

    const emailOptions = {
        to: email,
        subject: "Mã Xác nhận Đăng ký tài khoản V&T Nexis",
        html: `<h2>Xác nhận Đăng ký</h2><p>Mã OTP của bạn là: <b>${otpCode}</b>. Mã có hiệu lực trong 5 phút.</p>`
    };
    await sendEmail(emailOptions);

    res.status(200).json({ message: "Đã gửi mã OTP đến email của bạn!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
  }
};

// ĐĂNG KÝ (TẠO TÀI KHOẢN KHI ĐÃ VERIFY)
exports.register = async (req, res) => {
  try {
    const { fullName, email, phone, password, otp } = req.body;
    
    if (!otp) return res.status(400).json({ message: "Vui lòng cung cấp mã OTP rừ Email!" });

    // Validate OTP
    const validOTP = await OTP.findOne({
      email,
      code: otp,
      type: "register",
      isUsed: false,
      expireAt: { $gt: new Date() }
    });

    if (!validOTP) {
      return res.status(400).json({ message: "Mã OTP không hợp lệ hoặc đã hết hạn!" });
    }

    // 1. Kiểm tra lại lần cuối
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
    await OTP.deleteOne({ _id: validOTP._id });

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

// ĐĂNG NHẬP BẰNG GOOGLE
exports.googleLogin = async (req, res) => {
  try {
    const { googleToken } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: googleToken,
      audience: "250807668016-8p2k3cisiadd70rclj8graue584iechr.apps.googleusercontent.com",
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;
    
    let user = await User.findOne({ email });
    
    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-10) + "T1!"; 
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);
      
      user = new User({
          name,
          email,
          avatar: picture,
          password: hashedPassword,
          role: "user"
      });
      await user.save();
    }
    
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "bi_mat_quan_su",
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      message: "Đăng nhập Google thành công!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi đăng nhập Google: " + error.message });
  }
};

// ============================
// QUÊN MẬT KHẨU (Gửi OTP qua Email)
// ============================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Vui lòng cung cấp email!" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại trong hệ thống!" });
    }

    // Xóa OTP cũ (nếu có)
    await OTP.deleteMany({ userId: user._id, type: "reset_password" });

    // Tạo OTP ngẫu nhiên 6 số
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu vào database (hết hạn sau 5 phút)
    const newOTP = new OTP({
      userId: user._id,
      code: otpCode,
      type: "reset_password",
      expireAt: new Date(Date.now() + 5 * 60 * 1000), // 5 phút
    });
    await newOTP.save();

    // SỬ DỤNG HÀM GỬI EMAIL THẬT SỰ
    const emailOptions = {
        to: email,
        subject: "Mã Khôi phục Mật khẩu V&T Nexis",
        html: `<h2>Khôi phục mật khẩu</h2><p>Mã OTP của bạn là: <b>${otpCode}</b>. Mã có hiệu lực trong 5 phút.</p>`
    };
    await sendEmail(emailOptions);

    res.status(200).json({
      message: `Đã gửi mã OTP đến hòm thư email của bạn!`,
      // Bỏ ẩn mã OTP trên production
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
  }
};

// ============================
// XÁC NHẬN OTP
// ============================
exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Vui lòng nhập đủ email và OTP!" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Người dùng không tồn tại!" });
    }

    const validOTP = await OTP.findOne({
      userId: user._id,
      code: otp,
      type: "reset_password",
      isUsed: false,
      expireAt: { $gt: new Date() } // Kiểm tra còn hạn không
    });

    if (!validOTP) {
      return res.status(400).json({ message: "Mã OTP không hợp lệ, đã sử dụng hoặc đã hết hạn!" });
    }

    // Đã verify thành công, ta cứ giữ OTP ở đó cho bước reset (nhưng chưa đánh dấu isUsed vội)
    // Hoặc có thể trả về 1 token riêng để đổi mật khẩu. Để đơn giản, ta cho phép đổi password luôn ở bước sau

    res.status(200).json({ message: "OTP hợp lệ! Vui lòng nhập mật khẩu mới." });

  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
  }
};

// ============================
// ĐẶT LẠI MẬT KHẨU MỚI
// ============================
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Dữ liệu không đầy đủ!" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Người dùng không tồn tại!" });
    }

    // Verify lại 1 lần nữa để đảm bảo tính an toàn
    const validOTP = await OTP.findOne({
      userId: user._id,
      code: otp,
      type: "reset_password",
      isUsed: false,
      expireAt: { $gt: new Date() }
    });

    if (!validOTP) {
      return res.status(400).json({ message: "Phiên đổi mật khẩu không hợp lệ, hoặc OTP đã hết hạn!" });
    }

    // Hash pass mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật User
    user.password = hashedPassword;
    await user.save();

    // Đánh dấu OTP đã dùng hoặc xóa luôn
    await OTP.deleteOne({ _id: validOTP._id });

    res.status(200).json({ message: "Đổi mật khẩu thành công! Bạn có thể đăng nhập." });

  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
  }
};