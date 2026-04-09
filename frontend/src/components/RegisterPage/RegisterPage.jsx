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
import Hero from "../Hero/Hero"; // Nhúng banner home
import { toast, Toaster } from "sonner";

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
  <div className="bg-slate-50 min-h-screen">
    <Header />

    <div className="flex max-w-[1400px] mx-auto items-center justify-center px-5 py-10 gap-12 min-h-[calc(100vh-80px)]">
      
      {/* LEFT BANNER */}
      <div className="hidden lg:block flex-[1.2] animate-[fadeInHalf_0.8s_ease-out_forwards]">
        <div className="p-10">
          <Hero />
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="flex-1 flex justify-center w-full">
        <div className="w-full max-w-[520px] bg-white rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] overflow-hidden">
          
          {/* HEADER */}
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Tạo tài khoản mới</h1>
            <p className="text-sm text-slate-500">
              Cùng khám phá hàng ngàn sản phẩm công nghệ mới nhất.
            </p>
          </div>

          {/* FORM */}
          {step === 1 && (
            <form onSubmit={handleRequestOTP} className="px-8 pb-8">
              
              {/* NAME */}
              <div className="mb-5">
                <label className="block mb-1.5 font-medium">Họ và Tên</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full p-3 pr-10 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                  />
                  <User size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* EMAIL */}
                <div>
                  <label className="block mb-1.5 font-medium">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      maxLength={50}
                      placeholder="example@gmail.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full p-3 pr-10 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                    />
                    <Mail size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                  <p className="text-xs text-right text-slate-500 mt-1">
                    {formData.email.length}/50
                  </p>
                </div>

                {/* PHONE */}
                <div>
                  <label className="block mb-1.5 font-medium">Số điện thoại</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="0xxx xxx xxx"
                      value={formData.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 10) {
                          setFormData({ ...formData, phone: value });
                        }
                      }}
                      className="w-full p-3 pr-10 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                    />
                    <Smartphone size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                  <p className="text-xs text-right text-slate-500 mt-1">
                    {formData.phone.length}/10
                  </p>
                </div>
              </div>

              {/* PASSWORD */}
              <div className="mt-5">
                <label className="block mb-1.5 font-medium">Mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Tối thiểu 8 ký tự"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full p-3 pr-10 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* CONFIRM */}
              <div className="mt-5">
                <label className="block mb-1.5 font-medium">Xác nhận mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    className="w-full p-3 pr-10 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                  />
                  <ShieldCheck size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* TERMS */}
              <div className="flex items-start gap-2 text-sm mt-4">
                <input
                  type="checkbox"
                  required
                  checked={formData.agreeTerms}
                  onChange={(e) =>
                    setFormData({ ...formData, agreeTerms: e.target.checked })
                  }
                />
                <span>
                  Tôi đồng ý với{" "}
                  <a href="#" className="text-blue-600 font-medium">
                    Điều khoản dịch vụ
                  </a>{" "}
                  và{" "}
                  <a href="#" className="text-blue-600 font-medium">
                    Chính sách bảo mật
                  </a>
                </span>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                {loading ? "Đang gửi OTP..." : "Đăng ký tài khoản"}
              </button>
            </form>
          )}

          {/* OTP STEP */}
          {step === 2 && (
            <form onSubmit={handleVerifyAndRegister} className="px-8 pb-8">
              <label className="block mb-1.5 font-medium">Mã OTP</label>
              <p className="text-sm text-slate-500 mb-3">
                Mã đã gửi đến <b>{formData.email}</b>
              </p>

              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-3 text-center tracking-widest font-bold rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                />
                <Key size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                {loading ? "Đang xử lý..." : "Xác nhận & Hoàn tất"}
              </button>

              <div className="text-center mt-4">
                <span
                  onClick={() => setStep(1)}
                  className="text-blue-600 font-medium cursor-pointer"
                >
                  Trở lại sửa thông tin
                </span>
              </div>
            </form>
          )}

          {/* FOOTER */}
          {step === 1 && (
            <div className="bg-slate-50 text-center py-5 text-sm">
              Đã có tài khoản?{" "}
              <a href="/login" className="text-blue-600 font-semibold">
                Đăng nhập
              </a>
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