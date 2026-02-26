import React, { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./PromotionPage.css";

import {
  Clock,
  ShoppingCart,
  Star,
  ChevronDown,
  Truck,
  ShieldCheck,
  RefreshCcw,
  Flame
} from "lucide-react";

const promotions = [
  {
    id: 1,
    name: "Sony WH-1000XM5 Noise Canceling",
    price: "7.192.000₫",
    oldPrice: "8.990.000₫",
    reviews: 32,
    tag: "-20%",
  },
  {
    id: 2,
    name: "MagSafe Silicone Case - Blue Horizon",
    price: "838.500₫",
    oldPrice: "1.290.000₫",
    reviews: 18,
    tag: "-35%",
  },
  {
    id: 3,
    name: "Apple Watch Series 9 GPS 41mm",
    price: "8.916.500₫",
    oldPrice: "10.490.000₫",
    reviews: 27,
    tag: "-15%",
  },
];

function PromotionPage() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 4,
    minutes: 12,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0)
          return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0)
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0)
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="promotion-page">
      <Header />

      <div className="promotion-container">

        {/* HERO FLASH SALE */}
        <section className="promo-hero">
          <div className="promo-hero-content">
            <div className="promo-badge">
              <Clock size={14} />
              Flash Sale trong ngày
            </div>

            <h1>Galaxy S24 Ultra</h1>

            <p>
              Trải nghiệm AI di động thế hệ mới. Camera 200MP.
              Giảm giá 25% trong thời gian giới hạn.
            </p>

            <div className="countdown">
              {Object.entries(timeLeft).map(([key, value]) => (
                <div key={key} className="time-box">
                  <span>{value < 10 ? `0${value}` : value}</span>
                  <small>{key}</small>
                </div>
              ))}
            </div>

            <div className="hero-price">
              <span className="old">32.990.000₫</span>
              <span className="new">24.742.500₫</span>
            </div>
          </div>
        </section>

        {/* HEADER SECTION */}
        <div className="promotion-header">
          <h2>
            <Flame size={22} /> Tất cả ưu đãi
          </h2>
          <p>Hiện có 120 sản phẩm đang giảm giá</p>
        </div>

        <div className="promotion-content">

          {/* SIDEBAR */}
          <aside className="promotion-sidebar">
            <h3>Bộ lọc</h3>

            <div className="filter-group">
              <h4>Danh mục</h4>
              <label><input type="checkbox" /> Điện thoại</label>
              <label><input type="checkbox" /> Âm thanh</label>
              <label><input type="checkbox" /> Phụ kiện</label>
            </div>

            <div className="filter-group">
              <h4>Mức giảm giá</h4>
              <label><input type="radio" name="sale" /> Dưới 10%</label>
              <label><input type="radio" name="sale" /> 10% - 30%</label>
              <label><input type="radio" name="sale" /> Trên 30%</label>
            </div>
          </aside>

          {/* PRODUCTS */}
          <section className="promotion-products">
            <div className="product-grid">
              {promotions.map((product) => (
                <div key={product.id} className="product-card">

                  <span className="product-tag">
                    {product.tag}
                  </span>

                  <div className="product-image"></div>

                  <h3>{product.name}</h3>

                  <div className="product-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="gold" stroke="gold" />
                    ))}
                    <span>({product.reviews})</span>
                  </div>

                  <div className="product-price">
                    <span className="new">{product.price}</span>
                    <span className="old">{product.oldPrice}</span>
                  </div>

                  <button className="add-cart">
                    <ShoppingCart size={16} /> Thêm vào giỏ
                  </button>

                </div>
              ))}
            </div>

            {/* PAGINATION */}
            <div className="load-more-wrapper">
              <button className="load-more-btn">
                Tải thêm ưu đãi
                <ChevronDown size={18} />
              </button>
            </div>
          </section>
        </div>

        {/* TRUST SECTION */}
        <section className="trust-section">
          <div className="trust-item">
            <Truck />
            <div>
              <h4>Miễn phí giao hàng</h4>
              <p>Đơn từ 1.000.000₫</p>
            </div>
          </div>

          <div className="trust-item">
            <ShieldCheck />
            <div>
              <h4>Bảo hành 2 năm</h4>
              <p>Chính hãng toàn quốc</p>
            </div>
          </div>

          <div className="trust-item">
            <RefreshCcw />
            <div>
              <h4>30 ngày đổi trả</h4>
              <p>Hoàn tiền nếu không hài lòng</p>
            </div>
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
}

export default PromotionPage;