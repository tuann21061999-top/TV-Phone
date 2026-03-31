import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Import thêm icon mũi tên

function Hero() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/banners"); 
        setBanners(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy banner:", error);
      }
    };
    fetchBanners();
  }, []);

  // Hàm chuyển slide tiếp theo
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  // Hàm lùi lại slide trước
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  // Tự động chuyển Slide sau mỗi 5 giây
  // Đưa currentIndex vào dependency để mỗi khi bấm nút, timer 5 giây sẽ tự reset lại từ đầu
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length, currentIndex]);

  if (banners.length === 0) return null;

  const activeBanner = banners[currentIndex];

  return (
    <section className="relative flex flex-col-reverse md:flex-row items-center justify-between bg-gradient-to-br from-slate-50 to-slate-200 rounded-[24px] p-10 md:py-[60px] md:px-[80px] mx-auto my-[30px] max-w-[1200px] min-h-auto md:min-h-[450px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.05)] group">
      
      {/* KHAI BÁO KEYFRAMES TÙY CHỈNH CHO HIỆU ỨNG */}
      <style>
        {`
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-40px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes fadeZoomIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-slideInLeft { animation: slideInLeft 0.6s ease-out forwards; }
          .animate-fadeZoomIn { animation: fadeZoomIn 0.5s ease-out forwards; }
        `}
      </style>

      {/* NÚT BẤM TRÁI/PHẢI (Chỉ hiện khi có > 1 banner) */}
      {banners.length > 1 && (
        <>
          <button 
            className="absolute top-1/2 -translate-y-1/2 left-5 w-[44px] h-[44px] rounded-full bg-white/60 border border-white/80 backdrop-blur-[4px] flex items-center justify-center cursor-pointer z-10 shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-300 opacity-0 group-hover:opacity-100 hover:bg-white hover:shadow-[0_6px_16px_rgba(0,0,0,0.1)] hover:scale-110 hidden md:flex" 
            onClick={prevSlide}
          >
            <ChevronLeft size={24} color="#1E293B" />
          </button>
          <button 
            className="absolute top-1/2 -translate-y-1/2 right-5 w-[44px] h-[44px] rounded-full bg-white/60 border border-white/80 backdrop-blur-[4px] flex items-center justify-center cursor-pointer z-10 shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-300 opacity-0 group-hover:opacity-100 hover:bg-white hover:shadow-[0_6px_16px_rgba(0,0,0,0.1)] hover:scale-110 hidden md:flex" 
            onClick={nextSlide}
          >
            <ChevronRight size={24} color="#1E293B" />
          </button>
        </>
      )}

      {/* NỘI DUNG BÊN TRÁI */}
      <div className="flex-1 w-full md:max-w-[50%] flex flex-col gap-5 z-[2] items-center text-center md:items-start md:text-left mt-7 md:mt-0 animate-slideInLeft">
        
        {/* Badge */}
        <span className="inline-block bg-blue-600/10 text-blue-600 text-[13px] font-extrabold tracking-[1.5px] px-4 py-2 rounded-full w-fit uppercase">
          SẢN PHẨM MỚI
        </span>
        
        <h1 className="text-[32px] md:text-[36px] lg:text-[48px] font-extrabold text-slate-900 leading-[1.2] m-0">
          {/* Tách chữ màu xanh nếu muốn, ở đây tạm thời in nguyên cục title */}
          {activeBanner.title}
        </h1>
        
        <p className="text-[16px] md:text-[18px] text-slate-600 leading-[1.6] m-0 mb-2.5">
          {activeBanner.subtitle}
        </p>

        {/* Khung Nút bấm */}
        <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
          <Link 
            to={activeBanner.link || "/"} 
            className="w-full md:w-auto h-[52px] flex items-center justify-center bg-blue-600 text-white no-underline px-8 rounded-xl text-[16px] font-bold border-2 border-blue-600 cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(37,99,235,0.3)] hover:bg-blue-700 hover:border-blue-700 hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)]"
          >
            {activeBanner.buttonText || "Mua ngay"}
          </Link>
          <button className="w-full md:w-auto h-[52px] flex items-center justify-center bg-transparent text-slate-900 px-8 rounded-xl text-[16px] font-bold border-2 border-slate-300 cursor-pointer transition-all duration-300 hover:border-slate-900 hover:bg-slate-900/5">
            Xem chi tiết
          </button>
        </div>

        {/* Chấm tròn chuyển slide */}
        {banners.length > 1 && (
          <div className="flex gap-2.5 mt-6">
            {banners.map((_, idx) => (
              <span 
                key={idx} 
                onClick={() => setCurrentIndex(idx)}
                className={`w-[10px] h-[10px] rounded-full cursor-pointer transition-all duration-300 hover:scale-125 ${idx === currentIndex ? 'bg-blue-600' : 'bg-slate-300'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* HÌNH ẢNH BÊN PHẢI */}
      <img 
        key={activeBanner._id} 
        src={activeBanner.image} 
        alt={activeBanner.title} 
        className="w-[80%] md:w-[45%] max-h-[300px] md:max-h-[450px] object-contain z-[1] drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] animate-fadeZoomIn" 
      />
    </section>
  );
}

export default Hero;