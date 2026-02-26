import React, { useState } from "react";
import { Eye, EyeOff, User, Smartphone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../api/authService";
import { toast } from "sonner"; // 1. Đổi từ Toaster sang toast
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Thêm trạng thái chờ
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Bắt đầu loading
    
    try {
      // 2. Gọi API đăng nhập (Backend của bạn đã hỗ trợ tìm theo Email/Phone)
      const response = await loginUser({
        identifier: formData.identifier,
        password: formData.password
      });

      const { token, user } = response.data;
      // 3. Lưu dữ liệu
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // 4. Thông báo thành công (Dùng toast.success)
      toast.success(`Chào mừng ${user.name}! Đăng nhập thành công!`);
      
      // 5. Điều hướng NGAY LẬP TỨC
      // Lưu ý: Không nên dùng window.location.reload() ở đây vì nó sẽ làm mất hiệu ứng chuyển trang mượt mà
      navigate("/profile");
      
    } catch (error) {
      // 6. Báo lỗi cụ thể nếu sai mật khẩu hoặc tài khoản
      const errorMessage = error.response?.data?.message || "Đăng nhập thất bại!";
      toast.error(errorMessage);
      console.error("Login Error:", error);
    } finally {
      setLoading(false); // Kết thúc loading
    }
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
              <p>Sử dụng Email hoặc Số điện thoại để đăng nhập.</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label>Email hoặc Số điện thoại</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    required
                    placeholder="Nhập email hoặc số điện thoại"
                    value={formData.identifier}
                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                  />
                  <User size={18} />
                </div>
              </div>

              <div className="form-group">
                <label>Mật khẩu</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

              <div className="login-options">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  />
                  Ghi nhớ đăng nhập
                </label>
                <a href="#">Quên mật khẩu?</a>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? "Đang xử lý..." : "Đăng nhập"}
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