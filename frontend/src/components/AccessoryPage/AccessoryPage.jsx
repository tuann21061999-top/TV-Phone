import React, { useEffect, useState } from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import axios from "axios";
import "./AccessoryPage.css";
import {
  Star,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
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

  // 🔥 CALL API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const { data } = await axios.get(
          "http://localhost:5000/api/products?type=accessory"
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

  // 🔥 FILTER CATEGORY
  const filteredProducts =
    activeCategory === "Tất cả"
      ? products
      : products.filter(
          (item) => item.category === activeCategory
        );

  return (
    <div className="accessories-page">
      <Header />

      <div className="accessories-container">
        {/* Title */}
        <div className="accessories-header">
          <h1>Phụ kiện</h1>
          <p>Tìm thấy {filteredProducts.length} sản phẩm</p>
        </div>

        <div className="accessories-content">
          {/* Sidebar */}
          <aside className="accessories-sidebar">
            <h3><Filter size={18} /> Bộ lọc</h3>

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

            <div className="filter-group">
              <h4>Mức giá</h4>
              <label><input type="radio" name="price" /> Dưới 1 triệu</label>
              <label><input type="radio" name="price" /> 1 - 5 triệu</label>
              <label><input type="radio" name="price" /> Trên 5 triệu</label>
            </div>
          </aside>

          {/* Product Grid */}
          <section className="accessories-products">

            {loading && <p>Đang tải sản phẩm...</p>}
            {error && <p>{error}</p>}

            {!loading && !error && (
              <>
                <div className="product-grid">
                  {filteredProducts.map((product) => (
                    <div key={product._id} className="product-card">

                      {product.tag && (
                        <span className="product-tag">{product.tag}</span>
                      )}

                      <div className="product-image">
                        <img
                          src={
                            product.image ||
                            "https://via.placeholder.com/200"
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
                            fill="gold"
                            stroke="gold"
                          />
                        ))}
                        <span>({product.reviews || 0})</span>
                      </div>

                      <div className="product-price">
                        <span className="new">
                          {product.price?.toLocaleString("vi-VN")}₫
                        </span>

                        {product.oldPrice && (
                          <span className="old">
                            {product.oldPrice.toLocaleString("vi-VN")}₫
                          </span>
                        )}
                      </div>

                      <button className="add-cart">
                        <ShoppingCart size={16} /> Thêm vào giỏ
                      </button>

                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="pagination">
                  <button><ChevronLeft size={18} /></button>
                  <button className="active">1</button>
                  <button>2</button>
                  <button>3</button>
                  <button><ChevronRight size={18} /></button>
                </div>
              </>
            )}

          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default AccessoriesPage;