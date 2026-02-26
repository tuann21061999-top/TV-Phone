import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import "./PhonePage.css";
import { Star, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function PhonePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/products?type=device"
        );
        setProducts(res.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (slug) => {
    navigate(`/product/${slug}`);
  };

  const formatPrice = (price) => {
    return price?.toLocaleString("vi-VN") + "₫";
  };

  const getFinalPrice = (product) => {
    const basePrice = product.variants?.[0]?.price || 0;

    if (
      product.promotion &&
      product.promotion.discountPercent &&
      new Date(product.promotion.startDate) <= new Date() &&
      new Date(product.promotion.endDate) >= new Date()
    ) {
      return (
        basePrice -
        (basePrice * product.promotion.discountPercent) / 100
      );
    }

    return basePrice;
  };

  return (
    <div className="phone-page">
      <Header />

      <div className="phone-container">
        <div className="phone-header">
          <h1>Điện thoại Di động</h1>
          <p>Tìm thấy {products.length} sản phẩm phù hợp</p>
        </div>

        <div className="phone-content">
          {/* Sidebar giữ nguyên UI */}
          <aside className="phone-sidebar">
            <div className="filter-group">
              <h3>Thương hiệu</h3>
              <div className="filter-options">
                <label><input type="checkbox" /> Apple</label>
                <label><input type="checkbox" /> Samsung</label>
                <label><input type="checkbox" /> Xiaomi</label>
              </div>
            </div>

            <button className="reset-filter">Xóa tất cả bộ lọc</button>
          </aside>

          <section className="phone-products">
            <div className="product-grid">
              {products.map((product) => {
                const basePrice = product.variants?.[0]?.price || 0;
                const finalPrice = getFinalPrice(product);
                const hasDiscount = finalPrice < basePrice;

                return (
                  <div key={product._id} className="product-card">
                    {product.isFeatured && (
                      <span className="product-tag">HOT</span>
                    )}

                    <div
                      className="product-image"
                      onClick={() =>
                        handleProductClick(product.slug)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <img
                        src={
                          product.images?.[0] ||
                          "/no-image.png"
                        }
                        alt={product.name}
                      />
                    </div>

                    <h3
                      onClick={() =>
                        handleProductClick(product.slug)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      {product.name}
                    </h3>

                    <div className="product-rating">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={
                            i < Math.round(product.averageRating)
                              ? "gold"
                              : "none"
                          }
                          stroke="gold"
                        />
                      ))}
                      <span>({product.averageRating})</span>
                    </div>

                    <div className="product-price">
                      <span className="new">
                        {formatPrice(finalPrice)}
                      </span>

                      {hasDiscount && (
                        <span className="old">
                          {formatPrice(basePrice)}
                        </span>
                      )}
                    </div>

                    <button className="add-cart">
                      <ShoppingCart size={16} />
                      Thêm vào giỏ
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pagination">
              <button><ChevronLeft size={18} /></button>
              <button className="active">1</button>
              <button><ChevronRight size={18} /></button>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default PhonePage;