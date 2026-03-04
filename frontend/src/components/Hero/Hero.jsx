import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Import thêm icon mũi tên
import "./Hero.css";

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
    <section className="hero">
      
      {/* NÚT BẤM TRÁI/PHẢI (Chỉ hiện khi có > 1 banner) */}
      {banners.length > 1 && (
        <>
          <button className="hero-nav prev" onClick={prevSlide}>
            <ChevronLeft size={24} color="#1E293B" />
          </button>
          <button className="hero-nav next" onClick={nextSlide}>
            <ChevronRight size={24} color="#1E293B" />
          </button>
        </>
      )}

      <div className="hero-left">
        {/* Tùy chỉnh Badge, nếu rỗng thì không hiện */}
        <span className="badge">SẢN PHẨM MỚI</span>
        
        <h1>{activeBanner.title}</h1>
        <p>{activeBanner.subtitle}</p>

        <div className="buttons">
          <Link to={activeBanner.link || "/"} className="primary">
            {activeBanner.buttonText || "Mua ngay"}
          </Link>
          <button className="secondary">Xem chi tiết</button>
        </div>

        {/* Chấm tròn chuyển slide */}
        {banners.length > 1 && (
          <div className="hero-dots" style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
            {banners.map((_, idx) => (
              <span 
                key={idx} 
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: '10px', height: '10px', borderRadius: '50%', cursor: 'pointer',
                  background: idx === currentIndex ? '#2563EB' : '#CBD5E1'
                }}
              />
            ))}
          </div>
        )}
      </div>

      <img key={activeBanner._id} src={activeBanner.image} alt={activeBanner.title} className="hero-image-animate" />
    </section>
  );
}

export default Hero;