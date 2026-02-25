import React, { useState } from "react";
import { Eye, EyeOff, User, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./LoginPage.css";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dữ liệu đăng nhập:", formData);
    alert("Đang xử lý đăng nhập cho: " + formData.identifier);
  };

  return (
    <div className="login-page">
      <Header />

      <div className="container">
        <div className="login-wrapper">
          <div className="login-card">
            <div className="login-header">
              <div className="login-logo">
                <div className="logo-icon">
                  <Smartphone size={18} />
                </div>
                <span>TechStore</span>
              </div>

              <h1>Đăng nhập</h1>
              <p>Đăng nhập vào tài khoản của bạn để tiếp tục mua sắm.</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {/* Email */}
              <div className="form-group">
                <label>Email hoặc Số điện thoại</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="example@gmail.com"
                    value={formData.identifier}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        identifier: e.target.value,
                      })
                    }
                  />
                  <User size={18} />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label>Mật khẩu</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password: e.target.value,
                      })
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

              {/* Remember */}
              <div className="login-options">
                <label>
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rememberMe: e.target.checked,
                      })
                    }
                  />
                  Ghi nhớ đăng nhập
                </label>
                <a href="#">Quên mật khẩu?</a>
              </div>

              <button type="submit" className="login-btn">
                Đăng nhập
              </button>
            </form>

            <div className="login-footer">
              Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LoginPage;