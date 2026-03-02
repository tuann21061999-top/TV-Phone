import React, { useState } from "react";
import { Eye, EyeOff, User, Smartphone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../api/authService";
import { toast } from "sonner";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await loginUser({
        identifier: formData.identifier,
        password: formData.password
      });

      // Kiểm tra kỹ cấu trúc data trả về từ backend
      const { token, user } = response.data;

      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        toast.success(`Chào mừng ${user.name}!`);

        // Đợi một chút để đảm bảo localStorage đã ghi xong trước khi chuyển trang
        setTimeout(() => {
          if (user.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/profile");
          }
          // Ép reload nếu Header không tự cập nhật (tùy chọn)
          window.location.reload(); 
        }, 100);
      }
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Đăng nhập thất bại!";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý đăng nhập MXH (Giao diện)
  const handleSocialLogin = (platform) => {
    toast.info(`Tính năng đăng nhập bằng ${platform} đang được phát triển!`);
  };

  return (
    <div className="login-page">
      <Header />
      <div className="container">
        <div className="login-wrapper">
          <div className="login-card">
            <div className="login-header">
              <div className="login-logo">
                <div className="logo-icon"><Smartphone size={18} /></div>
                <span>TechStore</span>
              </div>
              <h1>Đăng nhập</h1>
              <p>Chào mừng bạn quay trở lại với TechStore</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label>Email hoặc Số điện thoại</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    required
                    placeholder="example@gmail.com"
                    value={formData.identifier}
                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                  />
                  <User size={18} className="input-icon" />
                </div>
              </div>

              <div className="form-group">
                <label>Mật khẩu</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Nhập mật khẩu của bạn"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="login-options">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <a href="#" className="forgot-pass">Quên mật khẩu?</a>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </button>

              <div className="divider">
                <span>HOẶC ĐĂNG NHẬP VỚI</span>
              </div>

              <div className="social-login">
                <button type="button" className="social-btn google" onClick={() => handleSocialLogin("Google")}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" />
                  Đăng nhập bằng Google
                </button>
                <button type="button" className="social-btn facebook" onClick={() => handleSocialLogin("Facebook")}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_2023.png" alt="Facebook" />
                  Đăng nhập bằng Facebook
                </button>
              </div>
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