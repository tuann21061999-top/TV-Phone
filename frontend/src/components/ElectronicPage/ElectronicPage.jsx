import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import axios from "axios";
import "./ElectronicPage.css";
import {
  Star,
  ShoppingCart,
  Filter,
  Tv,
  Speaker,
  Cpu,
  Monitor
} from "lucide-react";

function ElectronicPage() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { name: "Tất cả", icon: null },
    { name: "Tivi", icon: <Tv size={16} /> },
    { name: "Loa", icon: <Speaker size={16} /> },
    { name: "Máy tính", icon: <Monitor size={16} /> },
    { name: "Linh kiện", icon: <Cpu size={16} /> }
  ];

  // ===============================
  // Fetch products
  // ===============================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          "http://localhost:5000/api/products?type=electronic"
        );
        setProducts(data);
        setLoading(false);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Không thể tải sản phẩm");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ===============================
  // Format price
  // ===============================
  const formatPrice = (price) =>
    price?.toLocaleString("vi-VN") + "₫";

  // ===============================
  // Promotion logic
  // ===============================
  const getPriceInfo = (product) => {
    const basePrice = product.variants?.[0]?.price || 0;
    let finalPrice = basePrice;

    const isPromoActive =
      product.promotion?.discountPercent > 0 &&
      new Date(product.promotion.startDate) <= new Date() &&
      new Date(product.promotion.endDate) >= new Date();

    if (isPromoActive) {
      finalPrice =
        basePrice -
        (basePrice * product.promotion.discountPercent) / 100;
    }

    return {
      basePrice,
      finalPrice,
      hasDiscount: finalPrice < basePrice
    };
  };

  // ===============================
  // Save view history
  // ===============================
  const handleProductClick = async (productId) => {
    const token = localStorage.getItem("token");

    if (!token) return; // chưa đăng nhập thì bỏ qua

    try {
      await axios.post(
        "http://localhost:5000/api/history/view",
        { productId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    } catch (error) {
      console.error("Lỗi lưu lịch sử xem:", error);
    }
  };

  // ===============================
  // Filter products
  // ===============================
  const filteredProducts =
    activeCategory === "Tất cả"
      ? products
      : products.filter(
          (item) => item.categoryId?.name === activeCategory
        );

  return (
    <div className="electronics-page">
      <Header />

      <div className="electronics-container">
        <div className="electronics-header">
          <h1>Đồ điện tử & Gia dụng</h1>
          <p>Tìm thấy {filteredProducts.length} sản phẩm</p>
        </div>

        <div className="electronics-content">
          {/* Sidebar */}
          <aside className="electronics-sidebar">
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

          {/* Product Section */}
          <section className="electronics-products">
            {loading && <p>Đang tải sản phẩm...</p>}
            {error && <p>{error}</p>}

            {!loading && !error && (
              <div className="product-grid">
                {filteredProducts.map((product) => {
                  const {
                    basePrice,
                    finalPrice,
                    hasDiscount
                  } = getPriceInfo(product);

                  return (
                    <div
                      key={product._id}
                      className="product-card"
                    >
                      <Link
                        to={`/product/${product.slug}`}
                        className="product-link"
                        onClick={() =>
                          handleProductClick(product._id)
                        }
                      >
                        {(product.isFeatured ||
                          hasDiscount) && (
                          <span className="product-tag">
                            {hasDiscount
                              ? `-${product.promotion.discountPercent}%`
                              : "HOT"}
                          </span>
                        )}

                        <div className="product-image">
                          <img
                            src={
                              product.images?.[0] ||
                              "/no-image.png"
                            }
                            alt={product.name}
                          />
                        </div>

                        <h3>{product.name}</h3>

                        <div className="product-rating">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={
                                i <
                                Math.round(
                                  product.averageRating || 0
                                )
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
                        <ShoppingCart size={16} /> Thêm vào giỏ
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ElectronicPage;