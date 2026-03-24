import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../Product/ProductCard';
import './AIRecommend.css';

const AIRecommend = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favoriteIds, setFavoriteIds] = useState(new Set()); // Thêm state lưu tim
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const { data } = await axios.get("http://localhost:5000/api/ai/recommendations", config);
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
            }).catch(() => {});
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
        <section className="ai-recommend-wrapper container">
            <div className="ai-recommend-header">
                <div className="ai-badge-title">
                    <Sparkles className="ai-icon-pulse" size={24} />
                    <h2>Dành Riêng Cho Bạn</h2>
                    <span className="ai-tag">AI Powered</span>
                </div>
                <p className="ai-subtitle">Gợi ý thông minh dựa trên sở thích và hành vi mua sắm của bạn.</p>
            </div>
            
            <div className="ai-carousel-container">
                <button 
                    className="ai-carousel-btn left" 
                    onClick={() => scroll('left')}
                    style={{ opacity: currentIndex === 0 ? 0.5 : 1, pointerEvents: currentIndex === 0 ? 'none' : 'auto' }}
                >
                    <ChevronLeft size={24} />
                </button>

                <div className="ai-recommend-grid" ref={carouselRef} onScroll={handleScroll}>
                    {recommendations.map((item, idx) => {
                        if (!item.product) return null;
                        return (
                            <div key={idx} className="ai-product-item">
                                <ProductCard 
                                    product={item.product} 
                                    isFavorited={favoriteIds.has(item.product._id)}
                                    onFavoriteToggle={handleFavoriteToggle}
                                />
                                <div className="ai-reason-box">
                                    <div className="ai-reason-text">"{item.reason}"</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button 
                    className="ai-carousel-btn right" 
                    onClick={() => scroll('right')}
                    style={{ opacity: currentIndex >= recommendations.length - 1 ? 0.5 : 1, pointerEvents: currentIndex >= recommendations.length - 1 ? 'none' : 'auto' }}
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            <div className="ai-carousel-dots">
                {[...Array(totalPages)].map((_, idx) => (
                    <div 
                        key={`dot-${idx}`} 
                        className={`ai-dot ${currentIndex === idx ? 'active' : ''}`}
                        onClick={() => scrollToIndex(idx)}
                    />
                ))}
            </div>
        </section>
    );
};

export default AIRecommend;
