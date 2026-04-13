import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ProductCard from "../../components/Product/ProductCard";

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

    if (isExpired) return <span className="block text-red-500 font-semibold text-sm">Đã quá hạn khuyến mãi</span>;

    return (
        <div className="flex items-center gap-1.5 sm:gap-2">
            {timeLeft.days > 0 && (
                <div className="flex flex-col items-center justify-center bg-slate-800 text-white rounded-lg p-1.5 sm:p-2 min-w-[38px] sm:min-w-[45px] shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
                    <span className="text-base sm:text-lg font-extrabold leading-none">{timeLeft.days}</span>
                    <span className="text-[9px] sm:text-[10px] uppercase opacity-80 mt-0.5 sm:mt-1">Ngày</span>
                </div>
            )}
            <div className="flex flex-col items-center justify-center bg-slate-800 text-white rounded-lg p-1.5 sm:p-2 min-w-[38px] sm:min-w-[45px] shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
                <span className="text-base sm:text-lg font-extrabold leading-none">{timeLeft.hours.toString().padStart(2, '0')}</span>
                <span className="text-[9px] sm:text-[10px] uppercase opacity-80 mt-0.5 sm:mt-1">Giờ</span>
            </div>
            <span className="font-black text-inherit text-lg sm:text-xl mx-0.5">:</span>
            <div className="flex flex-col items-center justify-center bg-slate-800 text-white rounded-lg p-1.5 sm:p-2 min-w-[38px] sm:min-w-[45px] shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
                <span className="text-base sm:text-lg font-extrabold leading-none">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                <span className="text-[9px] sm:text-[10px] uppercase opacity-80 mt-0.5 sm:mt-1">Phút</span>
            </div>
            <span className="font-black text-inherit text-lg sm:text-xl mx-0.5">:</span>
            <div className="flex flex-col items-center justify-center bg-slate-800 text-white rounded-lg p-1.5 sm:p-2 min-w-[38px] sm:min-w-[45px] shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
                <span className="text-base sm:text-lg font-extrabold leading-none">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                <span className="text-[9px] sm:text-[10px] uppercase opacity-80 mt-0.5 sm:mt-1">Giây</span>
            </div>
        </div>
    );
};

// Helper function to extract pricing logic from variants
const getProductPricing = (product) => {
    if (!product.variants?.length) return { basePrice: 0, finalPrice: 0, discountPercent: 0, targetEnd: null, totalLimit: 0, totalSold: 0 };
    
    let bestBasePrice = Infinity;
    let bestFinalPrice = Infinity;
    let bestDiscountPercent = 0;
    let bestPromotionEnd = null;
    let totalLimit = 0;
    let totalSold = 0;

    product.variants.forEach(v => {
      const now = new Date();
      let currentActivePrice = v.price;
      let currentDiscountPercent = 0;

      if (v.discountPrice != null && v.promotionEnd && new Date(v.promotionEnd) > now) {
        currentActivePrice = v.discountPrice;
        
        if (v.quantityLimit > 0) {
            totalLimit += v.quantityLimit;
            totalSold += (v.soldQuantity || 0);
        }

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
      targetEnd: bestPromotionEnd,
      totalLimit,
      totalSold
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
                const resAll = await axios.get(`${import.meta.env.VITE_API_URL}/api/promotions/public/promotions?type=all`);
                const resShock = await axios.get(`${import.meta.env.VITE_API_URL}/api/promotions/public/promotions?type=shock`);

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
        <div className="bg-slate-100 min-h-screen font-sans pb-16">
            <Header />

            <div className="w-full max-w-[1300px] mx-auto px-3 sm:px-5 py-6 md:py-16 flex flex-col gap-6 md:gap-10">
                {/* SHOCK DEALS SECTION (SLIDER) */}
                <div className="relative bg-transparent">
                    <div className="relative z-10">
                        <div className="text-center text-slate-800 mb-6 md:mb-10">
                            <h2 className="text-[24px] sm:text-[32px] md:text-[42px] font-black mb-2 md:mb-3 uppercase tracking-[1.5px] sm:tracking-[3px] text-red-500 drop-shadow-[0_4px_15px_rgba(239,68,68,0.2)]">
                                🔥 GIỜ VÀNG GIÁ SỐC 🔥
                            </h2>
                            <p className="text-sm sm:text-lg md:text-xl opacity-90 text-slate-600 m-0 font-medium">Săn ngay những siêu phẩm bán chạy nhất!</p>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-20 text-slate-500 font-medium text-lg animate-pulse">
                                Đang tải dữ liệu khuyến mãi...
                            </div>
                        ) : topDeals.length > 0 ? (
                            <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-gradient-to-br from-slate-900 to-blue-900 p-0">
                                {topDeals.length > 1 && (
                                    <>
                                        <button onClick={prevSlide} className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-5 bg-white/10 border border-white/20 text-white w-12 h-12 rounded-full justify-center items-center cursor-pointer z-10 transition-all duration-300 backdrop-blur-sm hover:bg-amber-400 hover:text-slate-900 hover:border-amber-400 p-0">
                                            <ChevronLeft size={32} />
                                        </button>
                                        <button onClick={nextSlide} className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-5 bg-white/10 border border-white/20 text-white w-12 h-12 rounded-full justify-center items-center cursor-pointer z-10 transition-all duration-300 backdrop-blur-sm hover:bg-amber-400 hover:text-slate-900 hover:border-amber-400 p-0">
                                            <ChevronRight size={32} />
                                        </button>
                                    </>
                                )}
                                
                                <div className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] w-full" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                                    {topDeals.map((product) => {
                                        const pricing = getProductPricing(product);
                                        const displayImage = product.images?.[0] || product.colorImages?.[0]?.imageUrl || "/no-image.png";

                                        const hasLimit = pricing.totalLimit > 0;
                                        const progressPercent = hasLimit ? Math.min((pricing.totalSold / pricing.totalLimit) * 100, 100) : 0;
                                        const quantityLeft = Math.max(0, pricing.totalLimit - pricing.totalSold);

                                        return (
                                            <div key={`slide-${product._id}`} className="flex-none w-full flex flex-col md:flex-row justify-between items-center p-5 sm:p-10 md:p-[60px_80px] gap-5 sm:gap-10 text-white box-border text-center md:text-left">
                                                <div className="flex-1 flex flex-col items-center md:items-start gap-2.5 sm:gap-4">
                                                    <div className="bg-white/10 border border-white/20 py-1.5 sm:py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-bold tracking-[1px] sm:tracking-[1.5px] text-amber-400 backdrop-blur-md">TOP BÁN CHẠY</div>
                                                    <h3 className="text-xl sm:text-3xl md:text-4xl font-extrabold m-0 text-white leading-tight">{product.name}</h3>
                                                    <div className="flex items-baseline justify-center md:justify-start gap-2 sm:gap-4 mt-1.5 sm:mt-2.5">
                                                        <span className="text-2xl sm:text-3xl md:text-[32px] font-black text-amber-400">{pricing.finalPrice.toLocaleString()}đ</span>
                                                        {pricing.discountPercent > 0 && <span className="text-sm sm:text-lg line-through text-slate-400 font-medium">{pricing.basePrice.toLocaleString()}đ</span>}
                                                    </div>

                                                    {pricing.targetEnd && (
                                                        <div className="my-3 sm:my-5 bg-white/5 p-2.5 sm:p-4 rounded-xl border-t-4 md:border-t-0 md:border-l-4 border-red-500">
                                                            <CountdownTimer targetDate={pricing.targetEnd} />
                                                        </div>
                                                    )}

                                                    {hasLimit && (
                                                        <div className="w-full max-w-sm my-2 sm:my-3 border border-red-500/30 bg-red-950/40 p-2.5 sm:p-3 rounded-lg backdrop-blur-sm">
                                                            <div className="flex justify-between text-[11px] sm:text-[13px] text-white/90 mb-1.5 sm:mb-2 font-medium">
                                                                <span className="flex items-center gap-1 sm:gap-1.5 text-red-400">
                                                                    <span className="relative flex h-2 w-2">
                                                                        {quantityLeft > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                                    </span>
                                                                    {quantityLeft > 0 ? "Kẻo lỡ!" : "Đã cháy hàng!"}
                                                                </span>
                                                                <span>Đã bán: <span className="font-bold text-amber-400">{pricing.totalSold}</span>/{pricing.totalLimit}</span>
                                                            </div>
                                                            <div className="w-full h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
                                                                <div className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full" style={{ width: `${progressPercent}%` }} />
                                                            </div>
                                                        </div>
                                                    )}

                                                    <Link to={`/product/${product.slug || product._id}`} className="inline-block bg-amber-400 text-slate-900 font-bold py-2.5 sm:py-3.5 px-5 sm:px-7 rounded-xl no-underline cursor-pointer transition-all duration-300 text-sm sm:text-base border-none mt-1.5 sm:mt-2.5 hover:bg-amber-500 hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(245,158,11,0.4)]">
                                                        Xem siêu phẩm này
                                                    </Link>
                                                </div>

                                                <div className="flex-1 flex justify-center items-center relative z-10 w-full">
                                                    <div className="bg-white rounded-full w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] md:w-[420px] md:h-[420px] flex justify-center items-center relative shadow-[0_20px_50px_rgba(0,0,0,0.3),0_0_0_10px_rgba(255,255,255,0.05)] transition-transform duration-700 hover:scale-105">
                                                        {pricing.discountPercent > 0 && (
                                                            <div className="absolute -top-1 sm:-top-1.5 right-1 sm:right-2 md:right-4 bg-red-500 text-white w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full text-base sm:text-xl md:text-2xl font-black shadow-[0_10px_25px_rgba(239,68,68,0.4)] rotate-[15deg] z-10">
                                                                -{pricing.discountPercent}%
                                                            </div>
                                                        )}
                                                        <img src={displayImage} alt={product.name} className="w-[70%] h-[70%] object-contain mix-blend-multiply" />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {topDeals.length > 1 && (
                                    <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-10">
                                        {topDeals.map((_, idx) => (
                                            <button 
                                                key={idx} 
                                                className={`h-2.5 sm:h-3 rounded-full border-none cursor-pointer transition-all duration-300 p-0 ${idx === currentSlide ? "bg-amber-400 w-[24px] sm:w-[30px]" : "bg-white/30 w-2.5 sm:w-3 hover:bg-white/50"}`}
                                                onClick={() => setCurrentSlide(idx)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-500 shadow-sm">
                                Hiện chưa có deal sốc nào đang diễn ra.
                            </div>
                        )}
                    </div>
                </div>

                {/* ALL PROMOTIONS SECTION */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                    <div className="mb-5 md:mb-[30px] border-b-2 border-slate-100 pb-3 md:pb-[15px]">
                        <h3 className="text-xl sm:text-[24px] md:text-[28px] text-slate-800 m-0 relative inline-block font-extrabold after:content-[''] after:absolute after:-bottom-[14px] md:after:-bottom-[17px] after:left-0 after:w-[60%] after:h-1 after:rounded-md after:bg-blue-600">
                            TẤT CẢ KHUYẾN MÃI
                        </h3>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20 text-slate-500 font-medium text-lg animate-pulse">
                            Đang tải dữ liệu...
                        </div>
                    ) : allPromotions.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3 sm:gap-5 md:gap-[30px]">
                            {allPromotions.map(product => (
                                <div key={`promo-${product._id}`} className="bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-slate-500 italic">
                            Hiện không có sản phẩm khuyến mãi.
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Promotions;
