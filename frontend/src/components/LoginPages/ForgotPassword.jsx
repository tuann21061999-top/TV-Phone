import React, { useState } from "react";
import { Mail, Key, Lock, Eye, EyeOff, Smartphone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword, verifyOTP, resetPassword } from "../../api/authService";
import { toast } from "sonner";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "../LoginPages/LoginPage.css"; // Reuse login styles

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Bước 1: Yêu cầu mã OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await forgotPassword({ email });
            toast.success(res.data.message || "Đã gửi mã OTP đến email của bạn!");
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi gửi email OTP");
        } finally {
            setLoading(false);
        }
    };

    // Bước 2: Xác thực mã OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await verifyOTP({ email, otp });
            toast.success(res.data.message || "Xác thực OTP thành công!");
            setStep(3);
        } catch (error) {
            toast.error(error.response?.data?.message || "Mã OTP không hợp lệ hoặc đã hết hạn!");
        } finally {
            setLoading(false);
        }
    };

    // Bước 3: Đặt lại mật khẩu
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error("Mật khẩu xác nhận không khớp!");
        }
        if (newPassword.length < 6) {
            return toast.warning("Mật khẩu phải có ít nhất 6 ký tự!");
        }

        setLoading(true);
        try {
            const res = await resetPassword({ email, otp, newPassword });
            toast.success(res.data.message || "Đổi mật khẩu thành công!");
            setTimeout(() => {
                navigate("/login");
            }, 1000);
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi đổi mật khẩu!");
        } finally {
            setLoading(false);
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
                            <h1>Khôi phục mật khẩu</h1>
                            <p>
                                {step === 1 && "Nhập email của bạn để nhận mã xác nhận"}
                                {step === 2 && "Vui lòng kiểm tra email và nhập mã OTP"}
                                {step === 3 && "Tạo mật khẩu mới cho tài khoản của bạn"}
                            </p>
                        </div>

                        {/* BƯỚC 1 */}
                        {step === 1 && (
                            <form onSubmit={handleSendOTP} className="login-form">
                                <div className="form-group">
                                    <label>Email đăng ký</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="email"
                                            required
                                            placeholder="example@gmail.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                        <Mail size={18} className="input-icon" />
                                    </div>
                                </div>
                                <button type="submit" className="login-btn" disabled={loading}>
                                    {loading ? "Đang gửi..." : "Gửi mã OTP"}
                                </button>
                                <div className="login-footer" style={{ marginTop: '20px' }}>
                                    <Link to="/login">Quay lại Đăng nhập</Link>
                                </div>
                            </form>
                        )}

                        {/* BƯỚC 2 */}
                        {step === 2 && (
                            <form onSubmit={handleVerifyOTP} className="login-form">
                                <div className="form-group">
                                    <label>Mã xác nhận (OTP)</label>
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
                                    <small style={{ display: 'block', marginTop: '8px', color: '#6b7280', textAlign: 'right' }}>
                                        Mã có hiệu lực trong 5 phút
                                    </small>
                                </div>
                                <button type="submit" className="login-btn" disabled={loading}>
                                    {loading ? "Đang kiểm tra..." : "Xác nhận OTP"}
                                </button>
                                <div className="login-footer" style={{ marginTop: '20px' }}>
                                    <span onClick={() => setStep(1)} style={{ cursor: 'pointer', color: '#2563eb' }}>
                                        Nhập lại Email
                                    </span>
                                </div>
                            </form>
                        )}

                        {/* BƯỚC 3 */}
                        {step === 3 && (
                            <form onSubmit={handleResetPassword} className="login-form">
                                <div className="form-group">
                                    <label>Mật khẩu mới</label>
                                    <div className="input-wrapper">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            placeholder="Ít nhất 6 ký tự"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                        <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                        <Lock size={18} className="input-icon" style={{ left: '16px', position: 'absolute', color: '#9ca3af' }} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Xác nhận mật khẩu</label>
                                    <div className="input-wrapper">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            placeholder="Nhập lại mật khẩu mới"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                        <Lock size={18} className="input-icon" style={{ left: '16px', position: 'absolute', color: '#9ca3af' }} />
                                    </div>
                                </div>
                                <button type="submit" className="login-btn" disabled={loading}>
                                    {loading ? "Đang lưu..." : "Đổi mật khẩu"}
                                </button>
                            </form>
                        )}

                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ForgotPassword;
