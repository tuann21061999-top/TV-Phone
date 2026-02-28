import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import axios from "axios";
import "./AccessoryPage.css";
import {
  Star,
  ShoppingCart,
  Filter,
  Headphones,
  Zap,
  Smartphone,
  Battery
} from "lucide-react";

function AccessoriesPage() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { name: "Tất cả", icon: null },
    { name: "Tai nghe", icon: <Headphones size={16} /> },
    { name: "Củ sạc", icon: <Zap size={16} /> },
    { name: "Ốp lưng", icon: <Smartphone size={16} /> },
    { name: "Pin dự phòng", icon: <Battery size={16} /> }
  ];

  /* ================= FETCH PRODUCTS ================= */

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Gọi API với query filter accessory từ server
        const { data } = await axios.get(
          "http://localhost:5000/api/products?productType=accessory"
        );

        // Lọc lại một lần nữa ở client để đảm bảo dữ liệu sạch
        const accessories = data.filter(p => p.productType === "accessory");
        setProducts(accessories);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Không thể tải sản phẩm phụ kiện");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /* ================= HELPERS ================= */

  const formatPrice = (price) =>
    price?.toLocaleString("vi-VN") + "₫";

  const getLowestPrice = (product) => {
    if (!product.variants?.length) return 0;
    return Math.min(...product.variants.map(v => v.price));
  };

  const getFinalPrice = (product) => {
    const basePrice = getLowestPrice(product);

    if (!product.promotion?.discountPercent)
      return basePrice;

    const now = new Date();
    const start = new Date(product.promotion.startDate);
    const end = new Date(product.promotion.endDate);

    if (now >= start && now <= end) {
      return (
        basePrice -
        (basePrice * product.promotion.discountPercent) / 100
      );
    }

    return basePrice;
  };

  /* ================= FILTER ================= */

  const filteredProducts = useMemo(() => {
    if (activeCategory === "Tất cả") return products;

    return products.filter((item) => {
      // Logic kiểm tra category dựa trên populate hoặc ID
      const categoryName = item.categoryId?.name || item.categoryId;
      return categoryName === activeCategory;
    });
  }, [products, activeCategory]);

  /* ================= UI ================= */

  return (
    <div className="accessories-page">
      <Header />

      <div className="accessories-container">
        <div className="accessories-header">
          <h1>Phụ kiện Công nghệ</h1>
          <p>Tìm thấy {filteredProducts.length} sản phẩm</p>
        </div>

        <div className="accessories-content">
          {/* SIDEBAR */}
          <aside className="accessories-sidebar">
            <h3>
              <Filter size={18} /> Bộ lọc
            </h3>

            <div className="filter-group">
              <h4>Danh mục</h4>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  className={
                    activeCategory === cat.name
                      ? "category-btn active"
                      : "category-btn"
                  }
                  onClick={() => setActiveCategory(cat.name)}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <section className="accessories-products">
            {loading && <div className="loading">Đang tải phụ kiện...</div>}
            {error && <div className="error-msg">{error}</div>}

            {!loading && !error && (
              <div className="product-grid">
                {filteredProducts.map((product) => {
                  const basePrice = getLowestPrice(product);
                  const finalPrice = getFinalPrice(product);
                  const hasDiscount = finalPrice < basePrice;

                  // Lấy ảnh mặc định từ colorImages hoặc fallback
                  const displayImage = product.colorImages?.find(img => img.isDefault)?.imageUrl 
                                      || product.colorImages?.[0]?.imageUrl 
                                      || "/no-image.png";

                  return (
                    <div
                      key={product._id}
                      className="product-card"
                    >
                      <Link
                        to={`/product/${product.slug || product._id}`}
                        className="product-link"
                      >
                        {(product.isFeatured || hasDiscount) && (
                          <span className="product-tag">
                            {hasDiscount
                              ? `-${product.promotion.discountPercent}%`
                              : "HOT"}
                          </span>
                        )}

                        <div className="product-image">
                          <img
                            src={displayImage}
                            alt={product.name}
                          />
                        </div>

                        <h3>{product.name}</h3>

                        {/* Rating */}
                        <div className="product-rating">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={
                                i < Math.round(product.averageRating || 0)
                                  ? "gold"
                                  : "none"
                              }
                              stroke="gold"
                            />
                          ))}
                          <span>
                            ({product.averageRating || 0})
                          </span>
                        </div>

                        {/* Price */}
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
                      </Link>

                      <button className="add-cart">
                        <ShoppingCart size={16} />
                        Thêm vào giỏ
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            
            {!loading && filteredProducts.length === 0 && (
              <div className="no-products">
                Không tìm thấy sản phẩm nào trong danh mục này.
              </div>
            )}
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default AccessoriesPage;