import React, { useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Truck,
  ChevronRight
} from "lucide-react";
import "./ProductDetail.css";

function ProductDetail() {
  const [selectedColor, setSelectedColor] = useState("Midnight Blue");
  const [selectedStorage, setSelectedStorage] = useState("256GB");
  const [mainImage, setMainImage] = useState(
    "https://api.dicebear.com/7.x/shapes/svg?seed=1"
  );

  const product = {
    name: "Flagship Pro Max 5G",
    price: "30.990.000₫",
    rating: 4.9,
    reviews: 245,
    colors: [
      { name: "Midnight Blue", hex: "#1e293b" },
      { name: "Silver", hex: "#e2e8f0" },
      { name: "Space Gray", hex: "#475569" }
    ],
    storages: ["128GB", "256GB", "512GB"]
  };

  return (
    <div className="product-detail-page">
      <Header />

      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          Trang chủ <ChevronRight size={14} />
          Điện thoại <ChevronRight size={14} />
          <span>{product.name}</span>
        </div>

        {/* Main Section */}
        <div className="product-layout">
          {/* Left Gallery */}
          <div className="gallery">
            <div className="main-image">
              <button className="wishlist-btn">
                <Heart size={18} />
              </button>
              <img src={mainImage} alt={product.name} />
            </div>

            <div className="thumbnails">
              {[1, 2, 3, 4].map((item) => (
                <img
                  key={item}
                  src={`https://api.dicebear.com/7.x/shapes/svg?seed=${item}`}
                  alt="thumb"
                  onClick={() =>
                    setMainImage(
                      `https://api.dicebear.com/7.x/shapes/svg?seed=${item}`
                    )
                  }
                />
              ))}
            </div>
          </div>

          {/* Right Info */}
          <div className="product-info">
            <span className="badge">HÀNG MỚI</span>

            <h1>{product.name}</h1>

            <div className="rating">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#fbbf24" stroke="#fbbf24" />
              ))}
              <span>{product.rating} ({product.reviews} đánh giá)</span>
            </div>

            <div className="price">{product.price}</div>

            {/* Color */}
            <div className="option-group">
              <p>
                Màu: <strong>{selectedColor}</strong>
              </p>
              <div className="color-list">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    className={`color-dot ${
                      selectedColor === color.name ? "active" : ""
                    }`}
                    style={{ background: color.hex }}
                    onClick={() => setSelectedColor(color.name)}
                  />
                ))}
              </div>
            </div>

            {/* Storage */}
            <div className="option-group">
              <p>Dung lượng:</p>
              <div className="storage-list">
                {product.storages.map((size) => (
                  <button
                    key={size}
                    className={`storage-btn ${
                      selectedStorage === size ? "active" : ""
                    }`}
                    onClick={() => setSelectedStorage(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="actions">
              <button className="add-cart">
                <ShoppingCart size={18} />
                Thêm vào giỏ
              </button>
              <button className="share-btn">
                <Share2 size={18} />
              </button>
            </div>

            <button className="buy-now">Mua ngay</button>

            {/* Policies */}
            <div className="policies">
              <div><CheckCircle2 size={16} /> Còn hàng</div>
              <div><Truck size={16} /> Giao hàng miễn phí</div>
              <div><ShieldCheck size={16} /> Bảo hành 2 năm</div>
            </div>
          </div>
        </div>

        {/* Highlight Section */}
        <div className="highlights">
          <h2>Thông số nổi bật</h2>
          <div className="highlight-grid">
            <div className="highlight-card">
              <h4>Màn hình 6.8"</h4>
              <p>OLED 120Hz LTPO</p>
            </div>
            <div className="highlight-card">
              <h4>Camera 200MP</h4>
              <p>Cảm biến chuyên nghiệp</p>
            </div>
            <div className="highlight-card">
              <h4>Pin 5000mAh</h4>
              <p>Sử dụng cả ngày</p>
            </div>
            <div className="highlight-card">
              <h4>Snap 8 Gen 3</h4>
              <p>Hiệu năng vượt trội</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ProductDetail;