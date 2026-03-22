import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ProductCard from "../../components/Product/ProductCard";
import "./Promotions.css";

// Component Đếm ngược
const CountdownTimer = ({ targetDate }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            const left = calculateTimeLeft();
            if (Object.keys(left).length === 0) {
                setIsExpired(true);
                clearInterval(timer);
            } else {
                setTimeLeft(left);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (isExpired) return <span className="expired-text">Đã quá hạn khuyến mãi</span>;

    return (
        <div className="countdown-timer">
            {timeLeft.days > 0 && <div className="time-box"><span>{timeLeft.days}</span><span>Ngày</span></div>}
            <div className="time-box"><span>{timeLeft.hours.toString().padStart(2, '0')}</span><span>Giờ</span></div>
            <span className="colon">:</span>
            <div className="time-box"><span>{timeLeft.minutes.toString().padStart(2, '0')}</span><span>Phút</span></div>
            <span className="colon">:</span>
            <div className="time-box"><span>{timeLeft.seconds.toString().padStart(2, '0')}</span><span>Giây</span></div>
        </div>
    );
};

// Helper function to extract pricing logic from variants
const getProductPricing = (product) => {
    if (!product.variants?.length) return { basePrice: 0, finalPrice: 0, discountPercent: 0, targetEnd: null };
    
    let bestBasePrice = Infinity;
    let bestFinalPrice = Infinity;
    let bestDiscountPercent = 0;
    let bestPromotionEnd = null;

    product.variants.forEach(v => {
      const now = new Date();
      let currentActivePrice = v.price;
      let currentDiscountPercent = 0;

      if (v.discountPrice != null && v.promotionEnd && new Date(v.promotionEnd) > now) {
        currentActivePrice = v.discountPrice;
        if (v.discountType === "percentage") {
          currentDiscountPercent = v.discountValue;
        } else if (v.discountType === "fixed") {
          currentDiscountPercent = Math.round((v.discountValue / v.price) * 100);
        }
      }

      if (currentActivePrice < bestFinalPrice) {
        bestFinalPrice = currentActivePrice;
        bestBasePrice = v.price;
        bestDiscountPercent = currentDiscountPercent;
        bestPromotionEnd = v.promotionEnd ? new Date(v.promotionEnd) : null;
      }
    });

    return {
      basePrice: bestBasePrice === Infinity ? 0 : bestBasePrice,
      finalPrice: bestFinalPrice === Infinity ? 0 : bestFinalPrice,
      discountPercent: bestDiscountPercent,
      targetEnd: bestPromotionEnd
    };
};

const Promotions = () => {
    const [allPromotions, setAllPromotions] = useState([]);
    const [topDeals, setTopDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                setLoading(true);
                const resAll = await axios.get("http://localhost:5000/api/promotions/public/promotions?type=all");
                const resShock = await axios.get("http://localhost:5000/api/promotions/public/promotions?type=shock");

                setAllPromotions(resAll.data);
                
                // Sort shockDeals by totalSold and take top 3
                const sortedTop = [...resShock.data].sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0)).slice(0, 3);
                setTopDeals(sortedTop);
            } catch (error) {
                console.error("Lỗi fetch promotions", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPromotions();
    }, []);

    // Slider auto-play
    useEffect(() => {
        if (topDeals.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % topDeals.length);
        }, 5000); // 5 seconds per slide
        return () => clearInterval(timer);
    }, [topDeals.length]);

    const nextSlide = () => setCurrentSlide(prev => (prev + 1) % topDeals.length);
    const prevSlide = () => setCurrentSlide(prev => (prev - 1 + topDeals.length) % topDeals.length);

    return (
        <div className="promotions-page">
            <Header />

            <div className="promo-container">
                {/* SHOCK DEALS SECTION (SLIDER) */}
                <div className="shock-deals-section">
                    <div className="ambient-glow-left"></div>
                    <div className="ambient-glow-right"></div>
                    
                    <div className="shock-deals-content-wrapper">
                        <div className="shock-deals-header">
                            <h2 className="animated-title">🔥 GIỜ VÀNG GIÁ SỐC 🔥</h2>
                            <p className="animated-subtitle">Săn ngay những siêu phẩm bán chạy nhất!</p>
                        </div>

                        {loading ? (
                            <div className="loading-state">Đang tải data...</div>
                        ) : topDeals.length > 0 ? (
                            <div className="promo-slider-container">
                                {topDeals.length > 1 && (
                                    <>
                                        <button onClick={prevSlide} className="slider-nav-btn prev"><ChevronLeft size={32} /></button>
                                        <button onClick={nextSlide} className="slider-nav-btn next"><ChevronRight size={32} /></button>
                                    </>
                                )}
                                
                                <div className="promo-slider-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                                    {topDeals.map((product) => {
                                        const pricing = getProductPricing(product);
                                        const displayImage = product.images?.[0] || product.colorImages?.[0]?.imageUrl || "/no-image.png";

                                        return (
                                            <div key={`slide-${product._id}`} className="promo-slide">
                                                <div className="promo-slide-info">
                                                    <div className="promo-badge">TOP BÁN CHẠY</div>
                                                    <h3 className="promo-slide-name">{product.name}</h3>
                                                    <div className="promo-pricing">
                                                        <span className="promo-price-new">{pricing.finalPrice.toLocaleString()}đ</span>
                                                        {pricing.discountPercent > 0 && <span className="promo-price-old">{pricing.basePrice.toLocaleString()}đ</span>}
                                                    </div>

                                                    {pricing.targetEnd && (
                                                        <div className="promo-slide-timer">
                                                            <CountdownTimer targetDate={pricing.targetEnd} />
                                                        </div>
                                                    )}

                                                    <Link to={`/product/${product.slug || product._id}`} className="view-btn">
                                                        Xem siêu phẩm này
                                                    </Link>
                                                </div>

                                                <div className="promo-image-wrapper">
                                                    <div className="promo-image-stage">
                                                        {pricing.discountPercent > 0 && <div className="promo-discount-badge">-{pricing.discountPercent}%</div>}
                                                        <img src={displayImage} alt={product.name} className="promo-image" />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {topDeals.length > 1 && (
                                    <div className="slider-dots">
                                        {topDeals.map((_, idx) => (
                                            <button 
                                                key={idx} 
                                                className={`slider-dot ${idx === currentSlide ? "active" : ""}`}
                                                onClick={() => setCurrentSlide(idx)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="empty-state">Hiện chưa có deal sốc nào đang diễn ra.</div>
                        )}
                    </div>
                </div>

                {/* ALL PROMOTIONS SECTION */}
                <div className="all-promotions-section">
                    <div className="section-title">
                        <h3>TẤT CẢ KHUYẾN MÃI</h3>
                    </div>

                    {loading ? (
                        <div className="loading-state">Đang tải data...</div>
                    ) : allPromotions.length > 0 ? (
                        <div className="products-grid">
                            {allPromotions.map(product => (
                                <div key={`promo-${product._id}`} className="promo-card-wrapper">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">Hiện không có sản phẩm khuyến mãi.</div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Promotions;
