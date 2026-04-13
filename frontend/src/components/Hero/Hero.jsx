import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShoppingCart, ArrowRight, Sparkles } from "lucide-react"; 

function Hero() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/banners`); 
        setBanners(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy banner:", error);
      }
    };
    fetchBanners();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 10000);
    return () => clearInterval(interval);
  }, [banners.length, currentIndex]);

  if (banners.length === 0) return null;

  const activeBanner = banners[currentIndex];

  return (
    <section className="w-full max-w-[1200px] mx-auto my-4 md:my-8 px-4 md:px-0">
      
      {/* CSS Nhúng cho các hiệu ứng Keyframes nâng cao */}
      <style>
        {`
          @keyframes slideUpFade {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
            100% { transform: translateY(0px); }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-slideUpFade { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-float { animation: float 6s ease-in-out infinite; }
          .animate-scaleIn { animation: scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          
          /* Delay cho các phần tử chữ xuất hiện tuần tự */
          .delay-100 { animation-delay: 100ms; }
          .delay-200 { animation-delay: 200ms; }
        `}
      </style>

      {/* KHUNG MAIN BANNER */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col-reverse md:flex-row items-center min-h-[450px] md:min-h-[480px] group">
        
        {/* Background Blobs (Tạo điểm nhấn mờ ảo phía sau) */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-blue-400/10 rounded-full mix-blend-multiply filter blur-[60px] md:blur-[80px] opacity-70 translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-indigo-400/10 rounded-full mix-blend-multiply filter blur-[60px] md:blur-[80px] opacity-70 -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

        {/* NÚT ĐIỀU HƯỚNG TRÁI/PHẢI (PC Only) */}
        {banners.length > 1 && (
          <>
            <button 
              className="absolute top-1/2 -translate-y-1/2 left-4 md:left-6 w-11 h-11 rounded-full bg-white/70 border border-white backdrop-blur-md flex items-center justify-center cursor-pointer z-20 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110 hover:text-blue-600 text-slate-700 hidden md:flex" 
              onClick={prevSlide}
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              className="absolute top-1/2 -translate-y-1/2 right-4 md:right-6 w-11 h-11 rounded-full bg-white/70 border border-white backdrop-blur-md flex items-center justify-center cursor-pointer z-20 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110 hover:text-blue-600 text-slate-700 hidden md:flex" 
              onClick={nextSlide}
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* NỘI DUNG TEXT (Trái) - Reset key bằng _id để trigger animation lại mỗi khi đổi slide */}
        <div key={`text-${activeBanner._id}`} className="flex-1 w-full md:w-1/2 flex flex-col gap-4 z-10 px-6 pb-12 pt-4 md:p-12 lg:p-16 text-center md:text-left items-center md:items-start">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-600 text-[12px] font-bold tracking-wide px-3.5 py-1.5 rounded-full uppercase animate-slideUpFade opacity-0">
            <Sparkles size={14} className="text-blue-500" />
            Sản phẩm nổi bật
          </div>
          
          {/* Title */}
          <h1 className="text-[28px] sm:text-[32px] md:text-[42px] lg:text-[48px] font-extrabold text-slate-900 leading-[1.15] m-0 tracking-tight animate-slideUpFade opacity-0 delay-100">
            {activeBanner.title}
          </h1>
          
          {/* Subtitle */}
          <p className="text-[14px] sm:text-[15px] md:text-[17px] text-slate-500 leading-relaxed m-0 md:max-w-[90%] animate-slideUpFade opacity-0 delay-200">
            {activeBanner.subtitle}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2 md:mt-4 animate-slideUpFade opacity-0 delay-200">
            <Link 
              to={activeBanner.link || "/"} 
              className="flex-1 sm:flex-none h-[48px] md:h-[52px] flex items-center justify-center gap-2 bg-blue-600 text-white no-underline px-6 md:px-8 rounded-xl text-[15px] font-bold cursor-pointer transition-all duration-300 shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:bg-blue-700 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(37,99,235,0.45)] active:scale-95"
            >
              <ShoppingCart size={18} />
              {activeBanner.buttonText || "Mua ngay"}
            </Link>
            <button className="flex-1 sm:flex-none h-[48px] md:h-[52px] flex items-center justify-center gap-2 bg-white text-slate-700 px-6 md:px-8 rounded-xl text-[15px] font-bold border border-slate-200 cursor-pointer transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-1 active:scale-95">
              Xem chi tiết
              <ArrowRight size={18} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* HÌNH ẢNH SẢN PHẨM (Phải) */}
        <div key={`img-${activeBanner._id}`} className="w-full md:w-1/2 relative flex justify-center items-center py-8 md:py-12 z-10 animate-scaleIn opacity-0">
          <img 
            src={activeBanner.image} 
            alt={activeBanner.title} 
            className="w-[240px] sm:w-[280px] md:w-[350px] lg:w-[420px] max-h-[250px] sm:max-h-[300px] md:max-h-[450px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] animate-float" 
          />
        </div>

        {/* PAGINATION DOTS (Dạng Pill hiện đại) */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-white/50 backdrop-blur-sm py-2 px-3 rounded-full border border-white/60 shadow-sm">
            {banners.map((_, idx) => (
              <span 
                key={idx} 
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                  idx === currentIndex 
                    ? 'w-6 bg-blue-600' 
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

export default Hero;