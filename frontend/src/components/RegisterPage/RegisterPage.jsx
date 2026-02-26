import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Smartphone,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom"; // 1. Thêm navigate để chuyển trang
import { registerUser } from "../../api/authService"; // 2. Import hàm gọi API đã tạo ở bước trước
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { toast, Toaster } from "sonner";
import "./RegisterPage.css";

const RegisterPage = () => {
  const navigate = useNavigate(); // Khởi tạo điều hướng
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  // 3. Cập nhật hàm xử lý đăng ký
  const handleSubmit = async (e) => {
  e.preventDefault();

  // 1. Kiểm tra Email đúng định dạng (Regex)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    return alert("Email không đúng định dạng! (Ví dụ: abc@gmail.com)");
  }

  // 2. Kiểm tra Số điện thoại (Việt Nam: 10 số, bắt đầu bằng số 0)
  const phoneRegex = /^(0[3|5|7|8|9])([0-9]{8})$/;
  if (!phoneRegex.test(formData.phone)) {
    toast.error("Số điện thoại không hợp lệ! (Phải bắt đầu bằng 0 và có 10 số)");
    return;
  }
  if(formData.phone.length < 10) {
    toast.error("Số điện thoại phải có ít nhất 10 số!");
    return;
  }
  // 3. Kiểm tra độ dài mật khẩu
  if (formData.password.length < 8) {
    toast.error("Mật khẩu phải có ít nhất 8 ký tự!");
    return;
  }

  // 4. Kiểm tra khớp mật khẩu
  if (formData.password !== formData.confirmPassword) {
    toast.error("Mật khẩu xác nhận không khớp!");
    return;
  }

  // Nếu tất cả đều qua thì mới gọi API
  try {
    const response = await registerUser({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password
    });
    toast.success(response.data.message || "Đăng ký thành công!");
    navigate("/login");
  } catch (error) {
    toast.error(error.response?.data?.message || "Đăng ký thất bại!");
  }
};

  return (
    <div className="register-page">
      <Header />
      <div className="container">
        <div className="register-wrapper">
          <div className="register-card">
            <div className="register-header">
              <h1>Tạo tài khoản mới</h1>
              <p>Cùng khám phá hàng ngàn sản phẩm công nghệ mới nhất.</p>
            </div>

            <form onSubmit={handleSubmit} className="register-form">
              {/* Họ tên */}
              <div className="form-group">
                <label>Họ và Tên</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName} // Nên thêm value để control input
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                  <User size={18} />
                </div>
              </div>

              <div className="grid-2">

                {/* Email */}
                <div className="form-group">
                  <label>Email</label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      required
                      maxLength={50} // Giới hạn tối đa 50 ký tự
                      placeholder="example@gmail.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                    <Mail size={18} />
                  </div>
                  {/* Hiển thị đếm số ký tự (Tùy chọn) */}
                  <small style={{ textAlign: 'right', display: 'block', color: '#666' }}>
                    {formData.email.length}/50
                  </small>
                </div>

                {/* Số điện thoại */}
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <div className="input-wrapper">
                    <input
                      type="tel"
                      required
                      placeholder="0xxx xxx xxx"
                      value={formData.phone}
                      onChange={(e) => {
                        // Chỉ cho phép nhập số và tối đa 10 số
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 10) {
                          setFormData({ ...formData, phone: value });
                        }
                      }}
                    />
                    <Smartphone size={18} />
                  </div>
                  <small style={{ textAlign: 'right', display: 'block', color: '#666' }}>
                    {formData.phone.length}/10
                  </small>
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label>Mật khẩu</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Tối thiểu 8 ký tự"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label>Xác nhận mật khẩu</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                  />
                  <ShieldCheck size={18} />
                </div>
              </div>

              <div className="terms">
                <input
                  type="checkbox"
                  required
                  checked={formData.agreeTerms}
                  onChange={(e) =>
                    setFormData({ ...formData, agreeTerms: e.target.checked })
                  }
                />
                <span>
                  Tôi đồng ý với <a href="#">Điều khoản dịch vụ</a> và{" "}
                  <a href="#">Chính sách bảo mật</a>.
                </span>
              </div>

              <button type="submit" className="register-btn">
                Đăng ký tài khoản
              </button>
            </form>

            <div className="register-footer">
              Đã có tài khoản? <a href="/login">Đăng nhập</a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterPage;