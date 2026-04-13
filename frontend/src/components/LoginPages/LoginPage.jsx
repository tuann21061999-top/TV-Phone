import React, { useState } from "react";
import { Eye, EyeOff, User, Smartphone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, googleLogin } from "../../api/authService";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Hero from "../Hero/Hero"; // Nhúng banner home

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



  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const res = await googleLogin({ googleToken: credentialResponse.credential });
      const { token, user } = res.data;
      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        toast.success(`Chào mừng ${user.name}!`);
        setTimeout(() => {
          if (user.role === "admin") navigate("/admin");
          else navigate("/profile");
          window.location.reload();
        }, 100);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Đăng nhập Google thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId="250807668016-8p2k3cisiadd70rclj8graue584iechr.apps.googleusercontent.com">
      <div className="bg-[#f8fafc] min-h-screen font-sans flex flex-col">
        <Header />
        
        {/* Keyframes hiệu ứng trượt khung Banner bên trái */}
        <style>
          {`
            @keyframes fadeInHalf {
              from { opacity: 0; transform: translateX(-30px); }
              to { opacity: 1; transform: translateX(0); }
            }
            .animate-fadeInHalf {
              animation: fadeInHalf 0.8s ease-out forwards;
            }
          `}
        </style>

        <div className="flex max-w-[1400px] mx-auto items-center justify-center py-10 px-5 gap-[60px] min-h-[calc(100vh-80px)] w-full">
          
          {/* Khung chứa Hero Banner (Ẩn trên điện thoại, hiện trên màn hình lớn) */}
          {/* Đã sửa thành [&>section] và dùng !important để đè layout của component Hero */}
          <div className="hidden lg:block flex-[1.2] animate-fadeInHalf [&>section]:!m-0 [&>section]:!p-10 [&>section]:!min-h-fit [&>section]:!shadow-none [&>section]:!bg-none [&>section]:!bg-transparent">
            <Hero />
          </div>
          
          {/* Khung Form Đăng nhập */}
          <div className="flex-1 flex justify-center w-full">
            <div className="flex justify-center w-full">
              <div className="w-full max-w-[420px] bg-white rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="p-[30px] text-center">
                  <div className="flex items-center justify-center gap-2 mb-[15px] font-semibold text-[18px] text-slate-900">
                    <div className="bg-blue-600 text-white p-1.5 rounded-lg flex items-center justify-center">
                      <Smartphone size={18} />
                    </div>
                    <span>V&T Nexis</span>
                  </div>
                  <h1 className="text-[24px] mb-2 font-bold m-0 text-slate-900">Đăng nhập</h1>
                  <p className="text-[14px] text-slate-500 m-0">Chào mừng bạn quay trở lại với V&T Nexis</p>
                </div>

                <form onSubmit={handleSubmit} className="px-[30px] pb-[30px]">
                  <div className="mb-5">
                    <label className="block mb-1.5 font-medium text-slate-900 text-[14px]">Email hoặc Số điện thoại</label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        required
                        placeholder="example@gmail.com"
                        value={formData.identifier}
                        onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                        className="w-full py-3 pr-[40px] pl-3 rounded-xl border border-slate-200 outline-none transition-colors duration-200 focus:border-blue-600 text-[14px]"
                      />
                      <User size={18} className="absolute right-3 text-slate-400" />
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="block mb-1.5 font-medium text-slate-900 text-[14px]">Mật khẩu</label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Nhập mật khẩu của bạn"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full py-3 pr-[40px] pl-3 rounded-xl border border-slate-200 outline-none transition-colors duration-200 focus:border-blue-600 text-[14px]"
                      />
                      <button type="button" className="absolute right-2.5 bg-transparent border-none cursor-pointer text-slate-400 flex items-center justify-center p-1" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between text-[14px] mb-5 items-center">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 select-none">
                      <input
                        type="checkbox"
                        checked={formData.rememberMe}
                        onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                        className="w-4 h-4 accent-blue-600 cursor-pointer"
                      />
                      <span>Ghi nhớ đăng nhập</span>
                    </label>
                    <Link to="/forgot-password" className="text-blue-600 font-medium no-underline hover:underline">Quên mật khẩu?</Link>
                  </div>

                  <button type="submit" className="w-full py-3 px-4 bg-blue-600 text-white border-none rounded-xl font-semibold cursor-pointer transition-colors duration-200 hover:bg-blue-800 disabled:opacity-70 disabled:cursor-not-allowed" disabled={loading}>
                    {loading ? "Đang xử lý..." : "Đăng nhập"}
                  </button>

                  <div className="flex items-center text-center my-[25px] text-slate-400 text-[12px] font-medium before:content-[''] before:flex-1 before:border-b before:border-slate-200 after:content-[''] after:flex-1 after:border-b after:border-slate-200">
                    <span className="px-[15px]">HOẶC ĐĂNG NHẬP VỚI</span>
                  </div>

                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error("Đăng nhập Google thất bại!")}
                    />
                  </div>
                </form>

                <div className="bg-slate-50 p-5 text-center text-[14px] text-slate-600 border-t border-slate-100">
                  Chưa có tài khoản? <Link to="/register" className="text-blue-600 font-semibold no-underline hover:underline ml-1">Đăng ký ngay</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;