import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Smartphone,
  ShieldCheck,
} from "lucide-react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./RegisterPage.css";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    console.log("Dữ liệu đăng ký:", formData);
    alert("Đăng ký thành công cho: " + formData.fullName);
  };

  return (
    <div className="register-page">
      <Header />

      <div className="container">
        <div className="register-wrapper">
          <div className="register-card">
            <div className="register-header">
              <h1>Tạo tài khoản mới</h1>
              <p>
                Cùng khám phá hàng ngàn sản phẩm công nghệ mới nhất.
              </p>
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
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                  <User size={18} />
                </div>
              </div>

              {/* Email + Phone */}
              <div className="grid-2">
                <div className="form-group">
                  <label>Email</label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      required
                      placeholder="example@gmail.com"
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                    <Mail size={18} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Số điện thoại</label>
                  <div className="input-wrapper">
                    <input
                      type="tel"
                      required
                      placeholder="09xx xxx xxx"
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                    <Smartphone size={18} />
                  </div>
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
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                  <ShieldCheck size={18} />
                </div>
              </div>

              {/* Điều khoản */}
              <div className="terms">
                <input
                  type="checkbox"
                  required
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      agreeTerms: e.target.checked,
                    })
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