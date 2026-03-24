import React, { useState, useEffect } from "react";
import "./Promotion.css";
import Countdown from "../Countdown/Countdown";
import axios from "axios";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

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

function Promotion() {
  const [bestProduct, setBestProduct] = useState(null);
  const [bestPricing, setBestPricing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestPromotion = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/promotions/public/best");
        if (data) {
          setBestProduct(data);
          
          const percent = Math.round(((data.originalPrice - data.discountedPrice) / data.originalPrice) * 100);
          setBestPricing({
            basePrice: data.originalPrice,
            finalPrice: data.discountedPrice,
            discountPercent: percent,
            targetEnd: data.promotionEnd ? new Date(data.promotionEnd) : null
          });
        }
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm khuyến mãi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestPromotion();
  }, []);

  if (loading) {
    return (
      <section className="promotion promotion-loading">
        <Loader2 className="spinner" size={32} />
      </section>
    );
  }

  // Nếu không có sản phẩm nào
  if (!bestProduct || !bestPricing) return null;

  const displayImage = bestProduct.productImage || "/no-image.png";
  
  // Tính thẻ progress bar
  const hasLimit = bestProduct.quantityLimit > 0;
  const soldQty = bestProduct.soldQuantity || 0;
  const progressPercent = hasLimit ? Math.min((soldQty / bestProduct.quantityLimit) * 100, 100) : 0;

  return (
    <section className="promotion">
      {/* Vùng Deco Ánh Sáng */}
      <div className="promo-glow-left"></div>
      
      <div className="promo-content">
        <div className="promo-badge">HOT DEAL MỖI NGÀY</div>
        <h2 className="promo-title">
            {bestProduct.isShockDeal ? "FLASH SALE CHỚP NHOÁNG" : bestPricing.discountPercent > 0 ? "Giảm Giá Khủng" : "Sản Phẩm Đỉnh Cao"}
        </h2>
        
        <div className="promo-product-info">
          <h3 className="promo-product-name">{bestProduct.productName}</h3>
          <div className="promo-pricing">
             <span className="promo-price-new">{bestPricing.finalPrice.toLocaleString()}đ</span>
             {bestPricing.discountPercent > 0 && <span className="promo-price-old">{bestPricing.basePrice.toLocaleString()}đ</span>}
          </div>
        </div>

        {/* Cột mốc Flash Sale */}
        {hasLimit && (
            <div className="flash-sale-progress-container" style={{ margin: "15px 0" }}>
                <div className="flash-sale-progress-bar" style={{ width: "100%", height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                    <div className="flash-sale-progress-fill" style={{ width: `${progressPercent}%`, height: "100%", background: "linear-gradient(90deg, #ff416c, #ff4b2b)", borderRadius: "4px" }}></div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748b", marginTop: "5px" }}>
                    <span>Đã bán: {soldQty}</span>
                    <span>Giới hạn: {bestProduct.quantityLimit}</span>
                </div>
            </div>
        )}

        {/* Nếu ko có giảm giá thì ko hiện countdown */}
        {bestPricing.discountPercent > 0 && <Countdown />}

        <Link to={`/product/${bestProduct.slug || bestProduct.productId}`} className="view-btn">
          Xem ngay kẻo lỡ
        </Link>
      </div>

      <div className="promo-image-wrapper">
        <div className="promo-image-stage">
          {bestPricing.discountPercent > 0 && <div className="promo-discount-badge">-{bestPricing.discountPercent}%</div>}
          <img src={displayImage} alt={bestProduct.productName} className="promo-image" />
        </div>
      </div>
    </section>
  );
}

export default Promotion;