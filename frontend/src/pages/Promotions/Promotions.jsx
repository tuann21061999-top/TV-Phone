import React, { useEffect, useState } from "react";
import axios from "axios";
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


const Promotions = () => {
    const [shockDeals, setShockDeals] = useState([]);
    const [allPromotions, setAllPromotions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                setLoading(true);
                // Lấy tất cả khuyến mãi
                const resAll = await axios.get("http://localhost:5000/api/promotions/public/promotions?type=all");
                // Lấy riêng shock deals để hiển thị phần banner trên đầu (API sẽ filter giúp hoặc ta tự filter từ resAll cũng được)
                const resShock = await axios.get("http://localhost:5000/api/promotions/public/promotions?type=shock");

                setAllPromotions(resAll.data);
                setShockDeals(resShock.data);
            } catch (error) {
                console.error("Lỗi fetch promotions", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPromotions();
    }, []);

    // Hàm helper lấy ra promotionEnd xa nhất của sản phẩm để hiển thị đồng hồ chung cho Card
    const getLatestPromotionEnd = (product) => {
        if (!product || !product.variants) return null;
        let latest = 0;
        product.variants.forEach(v => {
            if (v.promotionEnd) {
                const t = new Date(v.promotionEnd).getTime();
                if (t > latest) latest = t;
            }
        });
        return latest > 0 ? new Date(latest) : null;
    };

    return (
        <div className="promotions-page">
            <Header />

            <div className="promo-container">
                {/* SHOCK DEALS SECTION */}
                <div className="shock-deals-section">
                    <div className="shock-deals-header">
                        <h2>🔥 GIỜ VÀNG GIÁ SỐC 🔥</h2>
                        <p>Săn ngay deal hot số lượng có hạn!</p>
                    </div>

                    {loading ? (
                        <div className="loading-state">Đang tải data...</div>
                    ) : shockDeals.length > 0 ? (
                        <div className="shock-deals-list">
                            {shockDeals.map(product => {
                                const targetEnd = getLatestPromotionEnd(product);
                                return (
                                    <div key={`shock-${product._id}`} className="shock-deal-card-wrapper">
                                        <ProductCard product={product} />
                                        {targetEnd && (
                                            <div className="card-countdown-wrapper">
                                                <CountdownTimer targetDate={targetEnd} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty-state">Hiện chưa có deal sốc nào đang diễn ra.</div>
                    )}
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
