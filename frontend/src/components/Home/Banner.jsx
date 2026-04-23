import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShoppingCart, ArrowRight, Sparkles } from "lucide-react"; 
import { getBannerStyles } from "../../utils/themeUtils";
import { cloudinaryPresets } from "../../utils/cloudinary";
import Promotion from "../Promotion/Promotion";

function Banner() {
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

  const mainBanners = banners.filter(b => b.position !== "sub_left");
  const subBannerList = banners.filter(b => b.position === "sub_left");
  const subBanner = subBannerList.length > 0 ? subBannerList[0] : null;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === mainBanners.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? mainBanners.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (mainBanners.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 10000);
    return () => clearInterval(interval);
  }, [mainBanners.length, currentIndex]);

  if (mainBanners.length === 0) return null;

  const activeBanner = mainBanners[currentIndex] || mainBanners[0];
  const currentTheme = getBannerStyles(activeBanner.theme);

  // Chiều cao cố định cho grid dưới (sub-banner & promotion phải bằng nhau)
  const GRID_H = "h-[160px] md:h-[220px]";

  return (
    <section className="w-full max-w-[1200px] mx-auto px-3 md:px-0">
      
      {/* CSS Nhúng */}
      <style>
        {`
          @keyframes slideUpFade {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.92); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-slideUpFade { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-float { animation: float 6s ease-in-out infinite; }
          .animate-scaleIn { animation: scaleIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .delay-100 { animation-delay: 100ms; }
          .delay-200 { animation-delay: 200ms; }
        `}
      </style>

      {/* ===== MAIN BANNER - Chiều cao cố định, text tự co ===== */}
      <div className={`relative w-full rounded-2xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.07)] border flex flex-col-reverse md:flex-row items-stretch h-[240px] md:h-[340px] lg:h-[380px] group transition-all duration-1000 ease-in-out ${currentTheme.bg}`}>
        
        {/* Background Blobs */}
        <div className={`absolute top-0 right-0 w-[250px] h-[250px] md:w-[500px] md:h-[500px] rounded-full mix-blend-multiply filter blur-[50px] md:blur-[90px] opacity-70 translate-x-1/4 -translate-y-1/4 pointer-events-none transition-colors duration-1000 animate-[spin_30s_linear_infinite] ${currentTheme.blob1}`}></div>
        <div className={`absolute bottom-0 left-0 w-[180px] h-[180px] md:w-[400px] md:h-[400px] rounded-full mix-blend-multiply filter blur-[50px] md:blur-[90px] opacity-70 -translate-x-1/4 translate-y-1/4 pointer-events-none transition-colors duration-1000 animate-[spin_40s_linear_infinite_reverse] ${currentTheme.blob2}`}></div>

        {/* Nút điều hướng (PC) */}
        {mainBanners.length > 1 && (
          <>
            <button className="absolute top-1/2 -translate-y-1/2 left-3 w-9 h-9 rounded-full bg-white/70 border border-white backdrop-blur-md hidden md:flex items-center justify-center cursor-pointer z-20 shadow-md transition-all opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110 hover:text-blue-600 text-slate-700" onClick={prevSlide}>
              <ChevronLeft size={20} />
            </button>
            <button className="absolute top-1/2 -translate-y-1/2 right-3 w-9 h-9 rounded-full bg-white/70 border border-white backdrop-blur-md hidden md:flex items-center justify-center cursor-pointer z-20 shadow-md transition-all opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110 hover:text-blue-600 text-slate-700" onClick={nextSlide}>
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* TEXT (Trái) - flex-1 + overflow-hidden giữ chiều cao cố định */}
        <div key={`text-${activeBanner._id}`} className="flex-1 w-full md:w-1/2 flex flex-col gap-1.5 md:gap-2.5 z-10 px-4 pb-6 pt-2 md:p-8 lg:p-10 text-center md:text-left items-center md:items-start justify-center overflow-hidden">
          
          {/* Badge */}
          <div className={`inline-flex items-center gap-1 text-[9px] md:text-[11px] font-bold tracking-wider px-2.5 py-0.5 md:px-3 md:py-1 rounded-full uppercase animate-slideUpFade opacity-0 shrink-0 ${currentTheme.badge}`}>
            <Sparkles size={10} className="md:w-[13px] md:h-[13px]" />
            Sản phẩm nổi bật
          </div>
          
          {/* Title - Dùng clamp() để tự co font theo chiều cao */}
          <h1 
            className={`font-extrabold leading-[1.15] m-0 tracking-tight animate-slideUpFade opacity-0 delay-100 transition-colors duration-1000 drop-shadow-sm line-clamp-2 ${currentTheme.title}`}
            style={{ fontSize: "clamp(18px, 4vw, 42px)" }}
          >
            {activeBanner.title}
          </h1>
          
          {/* Subtitle */}
          <p 
            className={`leading-relaxed m-0 md:max-w-[90%] animate-slideUpFade opacity-0 delay-200 transition-colors duration-1000 font-medium line-clamp-2 ${currentTheme.subtitle}`}
            style={{ fontSize: "clamp(11px, 1.5vw, 15px)" }}
          >
            {activeBanner.subtitle}
          </p>

          {/* Buttons */}
          <div className="flex flex-row gap-2 md:gap-3 w-full sm:w-auto mt-1 md:mt-3 animate-slideUpFade opacity-0 delay-200 shrink-0">
            <Link 
              to={activeBanner.link || "/"} 
              className={`flex-1 sm:flex-none h-[34px] md:h-[42px] flex items-center justify-center gap-1 text-white no-underline px-4 md:px-7 rounded-lg md:rounded-xl text-[11px] md:text-[13px] font-bold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 active:scale-95 ${currentTheme.btn}`}
            >
              <ShoppingCart size={14} className="md:w-4 md:h-4" />
              {activeBanner.buttonText || "Mua ngay"}
            </Link>
            
            {activeBanner.newsLink && (
              <Link 
                to={activeBanner.newsLink}
                className={`flex-1 sm:flex-none h-[34px] md:h-[42px] flex items-center justify-center gap-1 bg-white/20 backdrop-blur-md no-underline px-4 md:px-7 rounded-lg md:rounded-xl text-[11px] md:text-[13px] font-bold border border-white/40 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 active:scale-95 ${activeBanner.theme === "dark" ? "text-white border-slate-600 hover:bg-white/30" : "text-slate-700 hover:bg-white/40"}`}
              >
                Xem chi tiết
                <ArrowRight size={14} className={`md:w-4 md:h-4 ${activeBanner.theme === "dark" ? "text-slate-300" : "text-slate-500"}`} />
              </Link>
            )}
          </div>
        </div>

        {/* HÌNH ẢNH (Phải) */}
        <div key={`img-${activeBanner._id}`} className="w-full md:w-[45%] relative flex justify-center items-center py-4 md:py-0 z-10 animate-scaleIn opacity-0 group-hover:scale-[1.03] transition-transform duration-700">
          <img 
            src={cloudinaryPresets.banner(activeBanner.image)} 
            alt={activeBanner.title} 
            fetchpriority="high"
            decoding="sync"
            width={340}
            height={300}
            className="w-[140px] sm:w-[180px] md:w-[280px] lg:w-[340px] max-h-[140px] sm:max-h-[200px] md:max-h-[300px] object-contain drop-shadow-[0_16px_30px_rgba(0,0,0,0.2)] animate-float" 
          />
        </div>

        {/* PAGINATION DOTS */}
        {mainBanners.length > 1 && (
          <div className={`absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-20 backdrop-blur-sm py-1 px-2 rounded-full border shadow-sm ${activeBanner.theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-white/60'}`}>
            {mainBanners.map((_, idx) => (
              <span 
                key={idx} 
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                  idx === currentIndex 
                    ? `w-4 md:w-5 ${activeBanner.theme === 'dark' ? 'bg-blue-400' : 'bg-slate-800'}` 
                    : `w-1.5 ${activeBanner.theme === 'dark' ? 'bg-slate-600 hover:bg-slate-500' : 'bg-slate-300 hover:bg-slate-400'}`
                }`}
              />
            ))}
          </div>
        )}

      </div>
      
      {/* ===== GRID (SUB-BANNER & PROMOTION) - Cùng chiều cao cố định ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-3 mt-2.5 md:mt-4">
        
        {/* Cột Trái: Sub Banner */}
        {subBanner ? (
          <div className={`w-full relative rounded-xl overflow-hidden shadow-md border border-slate-200 ${GRID_H}`}>
            <img src={cloudinaryPresets.banner(subBanner.image)} alt={subBanner.title} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover z-0" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/30 z-10"></div>
            <div className="relative z-20 p-4 md:p-6 h-full flex flex-col justify-center max-w-[75%]">
              <h3 className="text-[15px] md:text-[18px] font-extrabold text-white mb-1 leading-tight drop-shadow-md line-clamp-2">
                {subBanner.title}
              </h3>
              <p className="text-[10px] md:text-[12px] text-slate-300 font-medium mb-2 md:mb-3 line-clamp-2">
                {subBanner.subtitle}
              </p>
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                <Link to={subBanner.link || "/electronics"} className="flex items-center text-blue-400 font-bold gap-1 hover:text-blue-300 transition-colors group text-[11px] md:text-[13px] no-underline">
                  {subBanner.buttonText || "Khám phá ngay"}
                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform md:w-3.5 md:h-3.5" />
                </Link>
                {subBanner.newsLink && (
                  <Link to={subBanner.newsLink} className="flex items-center text-emerald-400 font-bold gap-1 hover:text-emerald-300 transition-colors group text-[11px] md:text-[13px] no-underline">
                    Xem chi tiết
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform md:w-3.5 md:h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className={`w-full rounded-xl bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-400 text-[12px] ${GRID_H}`}>
            [Khu vực Sub-Banner Góc Trái]
          </div>
        )}

        {/* Cột Phải: Promotion - Chiều cao khớp bằng GRID_H */}
        <div className={`w-full ${GRID_H}`}>
          <Promotion isCompact={true} />
        </div>

      </div>

    </section>
  );
}

export default Banner;