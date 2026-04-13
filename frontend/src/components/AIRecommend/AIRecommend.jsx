import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../Product/ProductCard';

const AIRecommend = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favoriteIds, setFavoriteIds] = useState(new Set()); 
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/ai/recommendations`, config);
                setRecommendations(data.recommendations || []);
            } catch (error) {
                console.error("Lỗi AI Recommendation:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();

        if (token) {
            axios.get(`${import.meta.env.VITE_API_URL}/api/favorites`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                const ids = new Set(res.data.map(p => p._id));
                setFavoriteIds(ids);
            }).catch(() => { });
        }
    }, [token]);

    const handleFavoriteToggle = (productId, isLiked) => {
        setFavoriteIds(prev => {
            const next = new Set(prev);
            isLiked ? next.add(productId) : next.delete(productId);
            return next;
        });
    };

    // Carousel logic
    const carouselRef = React.useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const updatePages = () => {
            if (carouselRef.current && recommendations.length > 0) {
                const containerWidth = carouselRef.current.clientWidth;
                const itemWidth = window.innerWidth < 768 ? 150 : 280; // Chiều rộng ước tính của 1 item
                const itemsPerPage = Math.max(1, Math.floor(containerWidth / itemWidth));
                setTotalPages(Math.ceil(recommendations.length / itemsPerPage));
            }
        };
        updatePages();
        window.addEventListener('resize', updatePages);
        return () => window.removeEventListener('resize', updatePages);
    }, [recommendations]);

    const handleScroll = (e) => {
        const scrollLeft = e.target.scrollLeft;
        const containerWidth = e.target.clientWidth;
        const pageIndex = Math.round(scrollLeft / containerWidth);
        setCurrentIndex(pageIndex);
    };

    const scroll = (direction) => {
        if (carouselRef.current) {
            const containerWidth = carouselRef.current.clientWidth;
            // Trên mobile vuốt từng đoạn nhỏ, trên PC cuộn hết 1 khung
            const scrollAmount = window.innerWidth < 768 ? containerWidth / 1.5 : containerWidth;
            const amount = direction === 'left' ? -scrollAmount : scrollAmount;
            carouselRef.current.scrollBy({ left: amount, behavior: 'smooth' });
        }
    };

    const scrollToIndex = (index) => {
        if (carouselRef.current) {
            const containerWidth = carouselRef.current.clientWidth;
            carouselRef.current.scrollTo({ left: index * containerWidth, behavior: 'smooth' });
        }
    };

    if (loading || recommendations.length === 0) return null;

    return (
        <section className="my-6 md:my-[50px] container mx-auto px-0 md:px-4 relative group">

            {/* HEADER */}
            <div className="mb-4 md:mb-[25px] text-left md:text-center px-4 md:px-0">
                <div className="inline-flex items-center gap-1.5 md:gap-3 bg-gradient-to-r from-green-50 to-pink-50 px-3 py-1.5 md:px-6 md:py-2.5 rounded-full border border-pink-200 shadow-sm">
                    <Sparkles className="text-rose-600 animate-pulse w-4 h-4 md:w-6 md:h-6" />
                    <h2 className="text-[16px] md:text-2xl font-extrabold m-0 bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                        Dành Riêng Cho Bạn
                    </h2>
                    <span className="bg-gradient-to-br from-[#FF6B6B] to-[#FF8E53] text-white text-[9px] md:text-[11px] font-bold px-2 py-0.5 md:px-2.5 md:py-1 rounded-full uppercase tracking-wider hidden sm:inline-block">
                        AI Powered
                    </span>
                </div>
                <p className="mt-1 md:mt-2.5 text-slate-500 text-[12px] md:text-[15px]">
                    Gợi ý thông minh dựa trên sở thích và hành vi mua sắm của bạn.
                </p>
            </div>

            {/* CAROUSEL CONTAINER */}
            <div className="relative flex items-center w-full">

                {/* NÚT TRÁI (Hiển thị cả Mobile & PC) */}
                <button
                    className="absolute top-1/2 -translate-y-1/2 left-1 md:-left-5 z-20 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full w-8 h-8 md:w-11 md:h-11 flex items-center justify-center cursor-pointer shadow-md text-slate-700 transition-all duration-300 hover:bg-white hover:text-rose-600 md:hover:scale-110"
                    onClick={() => scroll('left')}
                    style={{ opacity: currentIndex === 0 ? 0 : 1, pointerEvents: currentIndex === 0 ? 'none' : 'auto' }}
                >
                    <ChevronLeft size={20} className="md:w-6 md:h-6" />
                </button>

                {/* GRID SẢN PHẨM */}
                <div
                    className="flex gap-2.5 md:gap-5 overflow-x-auto px-4 md:px-0 pb-4 pt-2 scroll-smooth items-stretch w-full snap-x snap-mandatory scrollbar-hide [&::-webkit-scrollbar]:hidden"
                    ref={carouselRef}
                    onScroll={handleScroll}
                >
                    {recommendations.map((item, idx) => {
                        if (!item.product) return null;
                        return (
                            // THU NHỎ KÍCH THƯỚC: Mobile w-[140px-150px], Desktop w-[260px-280px]
                            <div key={idx} className="snap-start w-[140px] xs:w-[150px] sm:w-[170px] md:w-auto md:min-w-[280px] md:max-w-[300px] shrink-0 rounded-xl bg-white flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.04)] md:shadow-none transition-transform hover:-translate-y-1">
                                <div className="relative z-10">
                                    <ProductCard
                                        product={item.product}
                                        isFavorited={favoriteIds.has(item.product._id)}
                                        onFavoriteToggle={handleFavoriteToggle}
                                    />
                                </div>
                                <div className="-mt-1.5 md:-mt-2.5 p-2 md:p-3.5 bg-slate-50/80 md:bg-slate-50 rounded-b-xl border border-slate-100 md:border-slate-200 border-t-0 flex-grow relative z-0 flex flex-col justify-center">
                                    {/* CẮT DÒNG (line-clamp-2) ĐỂ THẺ KHÔNG BỊ CAO */}
                                    <div 
                                        className="text-[10.5px] md:text-[13px] text-slate-600 italic leading-snug md:leading-relaxed pl-2 md:pl-2.5 border-l-[2px] md:border-l-[3px] border-rose-400 line-clamp-2 md:line-clamp-3" 
                                        title={item.reason}
                                    >
                                        "{item.reason}"
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* NÚT PHẢI (Hiển thị cả Mobile & PC) */}
                <button
                    className="absolute top-1/2 -translate-y-1/2 right-1 md:-right-5 z-20 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full w-8 h-8 md:w-11 md:h-11 flex items-center justify-center cursor-pointer shadow-md text-slate-700 transition-all duration-300 hover:bg-white hover:text-rose-600 md:hover:scale-110"
                    onClick={() => scroll('right')}
                    style={{ opacity: currentIndex >= totalPages - 1 ? 0 : 1, pointerEvents: currentIndex >= totalPages - 1 ? 'none' : 'auto' }}
                >
                    <ChevronRight size={20} className="md:w-6 md:h-6" />
                </button>
            </div>

            {/* CAROUSEL DOTS */}
            <div className="flex justify-center gap-1.5 md:gap-2 mt-1 md:mt-2">
                {[...Array(totalPages)].map((_, idx) => (
                    <div
                        key={`dot-${idx}`}
                        className={`h-1.5 md:h-2.5 rounded-full cursor-pointer transition-all duration-300 ${currentIndex === idx ? 'bg-rose-600 w-4 md:w-6' : 'bg-slate-300 w-1.5 md:w-2.5'}`}
                        onClick={() => scrollToIndex(idx)}
                    />
                ))}
            </div>
        </section>
    );
};

export default AIRecommend;