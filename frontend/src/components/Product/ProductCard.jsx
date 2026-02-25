import { Star, ShoppingCart } from "lucide-react";
import "./Product.css";

function ProductCard({ product }) {
  return (
    <div className="card">
      {product.badge && (
        <span className="badge-card">{product.badge}</span>
      )}

      <div className="image">
        <img src={product.image} alt={product.name} />
      </div>

      <h4 className="product-name">{product.name}</h4>

      <div className="stars">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={16} fill="#facc15" stroke="#facc15" />
        ))}
      </div>

      <p className="price">{product.price}</p>

      <button className="cart-btn">
        <ShoppingCart size={18} />
      </button>
    </div>
  );
}

export default ProductCard;