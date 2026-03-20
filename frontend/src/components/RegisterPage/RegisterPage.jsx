import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Smartphone,
  ShieldCheck,
  Key,
} from "lucide-react";
import { useNavigate } from "react-router-dom"; // 1. Thêm navigate để chuyển trang
import { registerUser, sendRegisterOTP } from "../../api/authService"; // 2. Import hàm gọi API đã tạo ở bước trước
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
  
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // 3. Cập nhật hàm xử lý đăng ký
  const handleRequestOTP = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return toast.error("Email không đúng định dạng! (Ví dụ: abc@gmail.com)");

    const phoneRegex = /^(0[3|5|7|8|9])([0-9]{8})$/;
    if (!phoneRegex.test(formData.phone)) return toast.error("Số điện thoại không hợp lệ! (Phải bắt đầu bằng 0 và có 10 số)");
    if(formData.phone.length < 10) return toast.error("Số điện thoại phải có ít nhất 10 số!");
    
    if (formData.password.length < 8) return toast.error("Mật khẩu phải có ít nhất 8 ký tự!");
    if (formData.password !== formData.confirmPassword) return toast.error("Mật khẩu xác nhận không khớp!");

    setLoading(true);
    try {
      const response = await sendRegisterOTP({
        email: formData.email,
        phone: formData.phone
      });
      toast.success(response.data.message || "Đã gửi mã OTP!");
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể gửi OTP!");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if(!otp || otp.length !== 6) return toast.error("Vui lòng nhập đủ 6 số OTP!");

    setLoading(true);
    try {
      const response = await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        otp
      });
      toast.success(response.data.message || "Đăng ký thành công!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn!");
    } finally {
      setLoading(false);
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

            {step === 1 && (
              <form onSubmit={handleRequestOTP} className="register-form">
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

                <button type="submit" className="register-btn" disabled={loading}>
                  {loading ? "Đang gửi OTP..." : "Đăng ký tài khoản"}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyAndRegister} className="register-form">
                <div className="form-group">
                  <label>Mã OTP Verification</label>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '10px' }}>
                    Chúng tôi vừa gửi mã OTP 6 số đến <b>{formData.email}</b>. Vui lòng kiểm tra hộp thư đến (hoặc hòm thư rác).
                  </p>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="Nhập mã 6 chữ số"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      style={{ letterSpacing: '2px', textAlign: 'center', fontWeight: 'bold' }}
                    />
                    <Key size={18} className="input-icon" />
                  </div>
                </div>
                
                <button type="submit" className="register-btn" disabled={loading} style={{ marginTop: '20px' }}>
                  {loading ? "Đang xử lý..." : "Xác nhận & Hoàn tất"}
                </button>
                
                <div className="register-footer" style={{ marginTop: '20px' }}>
                  <span onClick={() => setStep(1)} style={{ cursor: 'pointer', color: '#2563eb', fontWeight: 500 }}>
                    Trở lại sửa thông tin
                  </span>
                </div>
              </form>
            )}

            {step === 1 && (
              <div className="register-footer">
                Đã có tài khoản? <a href="/login">Đăng nhập</a>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterPage;