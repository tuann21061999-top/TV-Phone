import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProductDetail.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Sample product data - In real app, fetch from API
  const product = {
    id: id || 1,
    name: "Flagship Pro Max 5G",
    badge: "HÀNG MỚI VỀ",
    price: "30.990.000đ",
    originalPrice: "35.990.000đ",
    rating: 4.9,
    reviews: 245,
    colors: [
      { name: "Xanh Đêm (Midnight Blue)", hex: "#1a2332" },
      { name: "Xám Đen", hex: "#3d3d3d" },
    ],
    storage: ["128GB", "256GB", "512GB"],
    specs: [
      { icon: "📱", name: "Màn hình 6.8\"", desc: "OLED 120Hz LTPO" },
      { icon: "📷", name: "Camera 200MP", desc: "Cảm biến chuyên nghiệp" },
      { icon: "🔋", name: "Pin 5000mAh", desc: "Sử dụng cả ngày dài" },
      { icon: "⚡", name: "Vi Xử Lý Snap 8 Gen 3", desc: "Thế hệ Cam 3" },
    ],
    description: "Flagship Pro Max 5G mang đến một trải nghiệm điện thoại cao cấp với màn hình OLED 120Hz, camera 200MP và pin 5000mAh. Chip xử lý mạnh mẽ cho mọi tác vụ.",
    images: [
      "https://via.placeholder.com/400x500?text=Phone+1",
      "https://via.placeholder.com/400x500?text=Phone+2",
      "https://via.placeholder.com/400x500?text=Phone+3",
      "https://via.placeholder.com/400x500?text=Phone+Gallery",
    ],
  };

  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState("256GB");
  const [mainImage, setMainImage] = useState(0);

  const handleAddToCart = () => {
    console.log({
      product: product.name,
      color: product.colors[selectedColor].name,
      storage: selectedStorage,
    });
    // TODO: Add to cart logic
  };

  const relatedProducts = [
    {
      name: "Tai nghe Wireless Pro",
      price: "3.490.000đ",
      image: "https://via.placeholder.com/200x200?text=Headphones",
    },
    {
      name: "Ốp lưng ClearGuard",
      price: "690.000đ",
      image: "https://via.placeholder.com/200x200?text=Case",
    },
    {
      name: "Bộ sạc nhanh 48W",
      price: "850.000đ",
      image: "https://via.placeholder.com/200x200?text=Charger",
    },
    {
      name: "Dán cường lưỡng (3 cái)",
      price: "450.000đ",
      image: "https://via.placeholder.com/200x200?text=Screen+Protector",
    },
  ];

  return (
    <div className="product-detail-page">
      <Header />

      {/* Main Product Section */}
      <div className="product-detail-container">
        <div className="breadcrumb">
          <span onClick={() => navigate("/")}>Trang chủ</span>
          <span> / </span>
          <span onClick={() => navigate("/phones")}>Điện thoại</span>
          <span> / </span>
          <span>{product.name}</span>
        </div>

        <div className="product-main">
          {/* Images Gallery */}
          <div className="gallery-section">
            <div className="main-image-container">
              {product.badge && <span className="badge">{product.badge}</span>}
              <div className="heart-icon">❤️</div>
              <img src={product.images[mainImage]} alt={product.name} className="main-image" />
            </div>

            <div className="thumbnail-gallery">
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx}`}
                  className={`thumbnail ${idx === mainImage ? "active" : ""}`}
                  onClick={() => setMainImage(idx)}
                />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="info-section">
            <h1>{product.name}</h1>

            <div className="rating">
              <span className="stars">⭐⭐⭐⭐⭐</span>
              <span className="rating-text">{product.rating} ({product.reviews} đánh giá)</span>
            </div>

            <div className="price-section">
              <span className="price">{product.price}</span>
              <span className="original-price">{product.originalPrice}</span>
            </div>

            {/* Color Selection */}
            <div className="selection-group">
              <label>Chọn màu:</label>
              <div className="options">
                {product.colors.map((color, idx) => (
                  <div
                    key={idx}
                    className={`color-option ${selectedColor === idx ? "selected" : ""}`}
                    onClick={() => setSelectedColor(idx)}
                  >
                    <span className="color-swatch" style={{ backgroundColor: color.hex }}></span>
                    <span className="color-name">{color.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Storage Selection */}
            <div className="selection-group">
              <label>Chọn dung lượng:</label>
              <div className="options">
                {product.storage.map((size) => (
                  <button
                    key={size}
                    className={`storage-option ${selectedStorage === size ? "selected" : ""}`}
                    onClick={() => setSelectedStorage(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="availability">
              <div className="status">
                <span>🟢 Còn hàng</span>
                <span>📦 Miễn phí giao hàng</span>
                <span>✓ Bảo hành 2 năm</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button className="add-to-cart-btn" onClick={handleAddToCart}>
                🛒 Thêm vào giỏ
              </button>
              <button className="buy-now-btn">Mua ngay</button>
            </div>

            {/* Description */}
            <div className="description-box">
              <h3>Mô tả chi tiết</h3>
              <p>{product.description}</p>
            </div>
          </div>
        </div>

        {/* Specs Section */}
        <section className="specs-section">
          <h2>Thông số kỹ thuật nổi bật</h2>
          <div className="specs-grid">
            {product.specs.map((spec, idx) => (
              <div key={idx} className="spec-card">
                <span className="spec-icon">{spec.icon}</span>
                <h4>{spec.name}</h4>
                <p>{spec.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Description Detail */}
        <section className="description-detail">
          <h2>Ghi lại thực tại hơn bao giờ hết.</h2>
          <div className="description-content">
            <p>
              Ghi lại những khoảnh khắc đẹp nhất và chia sẻ chúng trên mọi thiết bị. Tất cả các tính năng chuyên nghiệp của máy quay phim ngắn lên đến 60fps với độ phân dải động, ổn định hình ảnh và xử lý chuyển động chậm hoàn hảo.
            </p>
            <div className="feature-list">
              <div>✅ Quay video 8K tại 60fps</div>
              <div>✅ Chế độ Chup đêm chuyên sâu</div>
              <div>✅ Xoá vật thể bằng AI</div>
            </div>
          </div>
          <img
            src="https://via.placeholder.com/800x400?text=Camera+Demo"
            alt="Camera demo"
            className="feature-image"
          />
        </section>

        {/* Related Products */}
        <section className="related-products">
          <h2>Khách hàng cùng mua</h2>
          <div className="products-slider">
            {relatedProducts.map((prod, idx) => (
              <div key={idx} className="related-product-card">
                <img src={prod.image} alt={prod.name} />
                <h4>{prod.name}</h4>
                <p className="price">{prod.price}</p>
                <button className="btn-add">🛒 Thêm vào giỏ</button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default ProductDetail;
