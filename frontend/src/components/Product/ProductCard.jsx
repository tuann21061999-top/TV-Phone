import { useState, useEffect } from "react";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import "./Product.css";

function ProductCard({ product, isFavorited = false, onFavoriteToggle }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(isFavorited);
  const [loadingLike, setLoadingLike] = useState(false);

  // Sync internal state if parent fetches favorite data asynchronously
  useEffect(() => {
    setLiked(isFavorited);
  }, [isFavorited]);

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning("Vui lòng đăng nhập để sử dụng tính năng yêu thích!");
      navigate("/login");
      return;
    }

    if (loadingLike) return;
    setLoadingLike(true);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/favorites/toggle",
        { productId: product._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLiked(data.isFavorited);
      toast.success(data.message);
      if (onFavoriteToggle) onFavoriteToggle(product._id, data.isFavorited);
    } catch {
      toast.error("Lỗi khi thực hiện yêu thích!");
    } finally {
      setLoadingLike(false);
    }
  };

  const formatPrice = (price) => price?.toLocaleString("vi-VN") + "₫";

  const getPricingInfo = () => {
    if (!product.variants?.length) return { basePrice: 0, finalPrice: 0, discountPercent: 0 };
    let bestBasePrice = Infinity;
    let bestFinalPrice = Infinity;
    let bestDiscountPercent = 0;

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
      }
    });

    return {
      basePrice: bestBasePrice === Infinity ? 0 : bestBasePrice,
      finalPrice: bestFinalPrice === Infinity ? 0 : bestFinalPrice,
      discountPercent: bestDiscountPercent
    };
  };

  const { basePrice, finalPrice, discountPercent } = getPricingInfo();
  const isDiscounted = finalPrice < basePrice;

  return (
    <div
      className="card-grid"
      onClick={() => navigate(`/product/${product.slug || product._id}`)}
    >
      <div className="image-container">
        {/* Badges nằm trong khung ảnh giống thiết kế */}
        <div className="badges-wrapper">
          {isDiscounted && discountPercent > 0 && (
            <span className="badge-discount">-{discountPercent}%</span>
          )}
          {product.isFeatured && !isDiscounted && (
            <span className="badge-new">Mới</span>
          )}
        </div>

        <button
          className={`wishlist-btn-grid ${liked ? "liked" : ""}`}
          onClick={handleToggleFavorite}
          title={liked ? "Bỏ yêu thích" : "Yêu thích"}
        >
          <Heart size={18} color={liked ? "#ef4444" : "#6b7280"} fill={liked ? "#ef4444" : "none"} />
        </button>

        <img
          src={product.images?.[0] || product.colorImages?.[0]?.imageUrl || "/no-image.png"}
          alt={product.name}
        />
      </div>

      <div className="card-content">
        <h4 className="product-title">{product.name}</h4>

        {/* HIỂN THỊ HIGHLIGHT XẾP CHỒNG NHƯ YÊU CẦU */}
        <div className="product-highlights-stacked">
          {product.highlights?.slice(0, 3).map((h, idx) => (
            <span key={idx} className="h-tag">{h}</span>
          ))}
        </div>

        <div className="stars-grid">
          <div className="star-icons">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                fill={i < Math.round(product.averageRating || 0) ? "#facc15" : "none"}
                stroke="#facc15"
              />
            ))}
          </div>
          <span className="rating-count">({product.reviewsCount || 0})</span>
        </div>

        <div className="card-footer-grid">
          <div className="price-block">
            {isDiscounted ? (
              <>
                <span className="old-price-grid">{formatPrice(basePrice)}</span>
                <span className="current-price-grid">{formatPrice(finalPrice)}</span>
              </>
            ) : (
              <span className="current-price-grid">{formatPrice(basePrice)}</span>
            )}
          </div>


        </div>
      </div>
    </div>
  );
}

export default ProductCard;