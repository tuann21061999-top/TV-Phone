import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles } from 'lucide-react';
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
            
            <div className="ai-recommend-grid">
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
        </section>
    );
};

export default AIRecommend;
