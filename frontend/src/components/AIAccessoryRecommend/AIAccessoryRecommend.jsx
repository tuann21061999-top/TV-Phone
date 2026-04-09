import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../Product/ProductCard';

const AIAccessoryRecommend = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favoriteIds, setFavoriteIds] = useState(new Set()); // Thêm state lưu tim
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const { data } = await axios.get("http://localhost:5000/api/ai/accessory-recommendations", config);
                setRecommendations(data.recommendations || []);
            } catch (error) {
                console.error("Lỗi AI Recommendation:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();

        // Lấy danh sách yêu thích nếu đã đăng nhập
        if (token) {
            axios.get("http://localhost:5000/api/favorites", {
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
                // Item width is ~320px
                const itemsPerPage = Math.max(1, Math.floor(containerWidth / 320));
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
            const amount = direction === 'left' ? -containerWidth : containerWidth;
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
        <section className="my-[50px] container mx-auto px-4 relative">

            {/* HEADER */}
            <div className="mb-[25px] text-center">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-50 to-pink-50 px-6 py-2.5 rounded-full border border-pink-200 shadow-sm">
                    <Sparkles className="text-rose-600 animate-pulse" size={24} />
                    <h2 className="text-2xl font-extrabold m-0 bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                        Phụ Kiện Tương Thích
                    </h2>
                    <span className="bg-gradient-to-br from-[#FF6B6B] to-[#FF8E53] text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Smart Match
                    </span>
                </div>
                <p className="mt-2.5 text-slate-500 text-[15px]">
                    Gợi ý phụ kiện hoàn hảo dành cho các thiết bị bạn đang sử dụng.
                </p>
            </div>

            {/* CAROUSEL CONTAINER */}
            <div className="relative flex items-center w-full">

                {/* NÚT TRÁI */}
                <button
                    className="absolute top-1/2 -translate-y-1/2 -left-3 md:-left-5 z-20 bg-white border border-slate-200 rounded-full w-10 h-10 md:w-11 md:h-11 flex items-center justify-center cursor-pointer shadow-md text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:text-rose-600 hover:shadow-lg"
                    onClick={() => scroll('left')}
                    style={{ opacity: currentIndex === 0 ? 0.5 : 1, pointerEvents: currentIndex === 0 ? 'none' : 'auto' }}
                >
                    <ChevronLeft size={24} />
                </button>

                {/* GRID SẢN PHẨM */}
                <div
                    className="flex gap-5 overflow-x-auto pb-5 pt-2.5 scroll-smooth items-stretch w-full snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
                    ref={carouselRef}
                    onScroll={handleScroll}
                >
                    {recommendations.map((item, idx) => {
                        if (!item.product) return null;
                        return (
                            <div key={idx} className="snap-start min-w-[280px] max-w-[300px] rounded-xl bg-white shrink-0 flex flex-col">
                                <div className="relative z-10">
                                    <ProductCard
                                        product={item.product}
                                        isFavorited={favoriteIds.has(item.product._id)}
                                        onFavoriteToggle={handleFavoriteToggle}
                                    />
                                </div>
                                <div className="-mt-2.5 p-3.5 bg-slate-50 rounded-b-xl border border-slate-200 border-t-0 flex-grow relative z-0">
                                    <div className="text-[13.5px] text-slate-700 italic leading-relaxed pl-2.5 border-l-[3px] border-rose-500">
                                        "{item.reason}"
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* NÚT PHẢI */}
                <button
                    className="absolute top-1/2 -translate-y-1/2 -right-3 md:-right-5 z-20 bg-white border border-slate-200 rounded-full w-10 h-10 md:w-11 md:h-11 flex items-center justify-center cursor-pointer shadow-md text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:text-rose-600 hover:shadow-lg"
                    onClick={() => scroll('right')}
                    style={{ opacity: currentIndex >= totalPages - 1 ? 0.5 : 1, pointerEvents: currentIndex >= totalPages - 1 ? 'none' : 'auto' }}
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* CAROUSEL DOTS */}
            <div className="flex justify-center gap-2 mt-2.5">
                {[...Array(totalPages)].map((_, idx) => (
                    <div
                        key={`dot-${idx}`}
                        className={`h-2.5 rounded-full cursor-pointer transition-all duration-300 ${currentIndex === idx ? 'bg-rose-600 w-6' : 'bg-slate-300 w-2.5'}`}
                        onClick={() => scrollToIndex(idx)}
                    />
                ))}
            </div>
        </section>
    );
};

export default AIAccessoryRecommend;
