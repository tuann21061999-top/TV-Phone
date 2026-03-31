import React, { useState } from "react";
import { Mail, Key, Lock, Eye, EyeOff, Smartphone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword, verifyOTP, resetPassword } from "../../api/authService";
import { toast } from "sonner";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

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
        <div className="bg-[#f8fafc] min-h-screen font-sans flex flex-col">
            <Header />
            <div className="flex max-w-[1400px] mx-auto items-center justify-center py-10 px-5 min-h-[calc(100vh-80px)] w-full">
                <div className="flex justify-center w-full">
                    <div className="w-full max-w-[420px] bg-white rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] overflow-hidden">
                        <div className="p-[30px] text-center">
                            <div className="flex items-center justify-center gap-2 mb-[15px] font-semibold text-[18px] text-slate-900">
                                <div className="bg-blue-600 text-white p-1.5 rounded-lg flex items-center justify-center">
                                    <Smartphone size={18} />
                                </div>
                                <span>TechStore</span>
                            </div>
                            <h1 className="text-[24px] mb-2 font-bold m-0 text-slate-900">Khôi phục mật khẩu</h1>
                            <p className="text-[14px] text-slate-500 m-0">
                                {step === 1 && "Nhập email của bạn để nhận mã xác nhận"}
                                {step === 2 && "Vui lòng kiểm tra email và nhập mã OTP"}
                                {step === 3 && "Tạo mật khẩu mới cho tài khoản của bạn"}
                            </p>
                        </div>

                        {/* BƯỚC 1 */}
                        {step === 1 && (
                            <form onSubmit={handleSendOTP} className="px-[30px] pb-[30px]">
                                <div className="mb-5">
                                    <label className="block mb-1.5 font-medium text-slate-900 text-[14px]">Email đăng ký</label>
                                    <div className="relative flex items-center">
                                        <input
                                            type="email"
                                            required
                                            placeholder="example@gmail.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full py-3 pr-[40px] pl-3 rounded-xl border border-slate-200 outline-none transition-colors duration-200 focus:border-blue-600 text-[14px]"
                                        />
                                        <Mail size={18} className="absolute right-3 text-slate-400" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-3 px-4 bg-blue-600 text-white border-none rounded-xl font-semibold cursor-pointer transition-colors duration-200 hover:bg-blue-800 disabled:opacity-70 disabled:cursor-not-allowed" disabled={loading}>
                                    {loading ? "Đang gửi..." : "Gửi mã OTP"}
                                </button>
                                <div className="mt-5 text-center text-[14px]">
                                    <Link to="/login" className="text-blue-600 font-medium no-underline hover:underline">Quay lại Đăng nhập</Link>
                                </div>
                            </form>
                        )}

                        {/* BƯỚC 2 */}
                        {step === 2 && (
                            <form onSubmit={handleVerifyOTP} className="px-[30px] pb-[30px]">
                                <div className="mb-5">
                                    <label className="block mb-1.5 font-medium text-slate-900 text-[14px]">Mã xác nhận (OTP)</label>
                                    <div className="relative flex items-center">
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            placeholder="Nhập mã 6 chữ số"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full py-3 pr-[40px] pl-3 rounded-xl border border-slate-200 outline-none transition-colors duration-200 focus:border-blue-600 text-[14px] tracking-[2px] text-center font-bold"
                                        />
                                        <Key size={18} className="absolute right-3 text-slate-400" />
                                    </div>
                                    <small className="block mt-2 text-slate-500 text-right text-[12px]">
                                        Mã có hiệu lực trong 5 phút
                                    </small>
                                </div>
                                <button type="submit" className="w-full py-3 px-4 bg-blue-600 text-white border-none rounded-xl font-semibold cursor-pointer transition-colors duration-200 hover:bg-blue-800 disabled:opacity-70 disabled:cursor-not-allowed" disabled={loading}>
                                    {loading ? "Đang kiểm tra..." : "Xác nhận OTP"}
                                </button>
                                <div className="mt-5 text-center text-[14px]">
                                    <span onClick={() => setStep(1)} className="cursor-pointer text-blue-600 font-medium hover:underline">
                                        Nhập lại Email
                                    </span>
                                </div>
                            </form>
                        )}

                        {/* BƯỚC 3 */}
                        {step === 3 && (
                            <form onSubmit={handleResetPassword} className="px-[30px] pb-[30px]">
                                <div className="mb-5">
                                    <label className="block mb-1.5 font-medium text-slate-900 text-[14px]">Mật khẩu mới</label>
                                    <div className="relative flex items-center">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            placeholder="Ít nhất 6 ký tự"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full py-3 pr-[40px] pl-10 rounded-xl border border-slate-200 outline-none transition-colors duration-200 focus:border-blue-600 text-[14px]"
                                        />
                                        <Lock size={18} className="absolute left-3 text-slate-400" />
                                        <button type="button" className="absolute right-2.5 bg-transparent border-none cursor-pointer text-slate-400 flex items-center justify-center p-1" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="mb-5">
                                    <label className="block mb-1.5 font-medium text-slate-900 text-[14px]">Xác nhận mật khẩu</label>
                                    <div className="relative flex items-center">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            placeholder="Nhập lại mật khẩu mới"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full py-3 pr-[40px] pl-10 rounded-xl border border-slate-200 outline-none transition-colors duration-200 focus:border-blue-600 text-[14px]"
                                        />
                                        <Lock size={18} className="absolute left-3 text-slate-400" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-3 px-4 bg-blue-600 text-white border-none rounded-xl font-semibold cursor-pointer transition-colors duration-200 hover:bg-blue-800 disabled:opacity-70 disabled:cursor-not-allowed" disabled={loading}>
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
