import { Star, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Product.css";

function ProductCard({ product }) {
  const navigate = useNavigate();

  const formatPrice = (price) =>
    price?.toLocaleString("vi-VN") + "₫";

  const getLowestPrice = () => {
    if (!product.variants?.length) return 0;
    return Math.min(...product.variants.map((v) => v.price));
  };

  const getFinalPrice = () => {
    const basePrice = getLowestPrice();

    if (!product.promotion?.discountPercent)
      return basePrice;

    const now = new Date();
    const start = new Date(product.promotion.startDate);
    const end = new Date(product.promotion.endDate);

    if (now >= start && now <= end) {
      return basePrice -
        (basePrice *
          product.promotion.discountPercent) /
          100;
    }

    return basePrice;
  };

  const basePrice = getLowestPrice();
  const finalPrice = getFinalPrice();
  const isDiscounted = finalPrice < basePrice;

  return (
    <div
      className="card"
      onClick={() =>
        navigate(
          `/product/${product.slug || product._id}`
        )
      }
    >
      {product.isFeatured && (
        <span className="badge-card">HOT</span>
      )}

      <div className="image">
        <img
          src={product.images?.[0] || "/no-image.png"}
          alt={product.name}
        />
      </div>

      <h4 className="product-name">{product.name}</h4>

      <div className="product-highlights-small">
        {product.highlights?.slice(0, 2).map((h, idx) => (
          <span key={idx} className="h-tag">
            {h}
          </span>
        ))}
      </div>

      <div className="stars">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            fill={
              i <
              Math.round(product.averageRating || 0)
                ? "#facc15"
                : "none"
            }
            stroke="#facc15"
          />
        ))}
        <span className="rating-num">
          ({product.averageRating || 0})
        </span>
      </div>

      <div className="card-footer-price">
        <div>
          {isDiscounted ? (
            <>
              <span className="old-price">
                {formatPrice(basePrice)}
              </span>
              <span className="price">
                {formatPrice(finalPrice)}
              </span>
            </>
          ) : (
            <span className="price">
              {formatPrice(basePrice)}
            </span>
          )}
        </div>

        <button
          className="cart-btn"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <ShoppingCart size={18} />
        </button>
      </div>
    </div>
  );
}

export default ProductCard;