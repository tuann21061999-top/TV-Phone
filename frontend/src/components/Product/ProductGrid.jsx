import { useEffect, useState } from "react";
import "./Product.css";
import ProductCard from "./ProductCard";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";

function ProductGrid({ type }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const itemsPerView = 4; // Số lượng hiển thị mỗi khung hình

  // Tiêu đề tương ứng
  const titles = {
    device: "Điện thoại nổi bật",
    electronic: "Đồ điện tử",
    accessory: "Phụ kiện giá tốt",
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/products?productType=${type}`);
        // Giả sử API trả về mảng trực tiếp hoặc nằm trong res.data.data
        const data = Array.isArray(res.data) ? res.data : res.data.data;
        setProducts(data || []);
      } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [type]);

  // Logic chuyển slide:
  // Chúng ta di chuyển theo từng đơn vị sản phẩm thay vì di chuyển theo cụm 100% 
  // để tránh việc trang cuối bị trống nếu số lượng không chia hết cho 4.
  const nextSlide = () => {
    if (currentIndex < products.length - itemsPerView) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) return <div className="loading">Đang tải sản phẩm...</div>;
  if (products.length === 0) return null;

  return (
    <section className="product-section">
      <div className="section-header">
        <h2>{titles[type] || "Sản phẩm"}</h2>
        <button className="view-all-btn">Xem tất cả</button>
      </div>

      <div className="slider-wrapper">
        {/* Nút Trái: Chỉ hiện khi không ở vị trí đầu tiên */}
        <button 
          className={`nav-btn left ${currentIndex === 0 ? "hidden" : ""}`} 
          onClick={prevSlide}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={24} />
        </button>

        <div className="slider-container">
          <div
            className="slider-track"
            style={{
              // Di chuyển bằng % của một item lẻ (100 / 4 = 25%)
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            }}
          >
            {products.map((p) => (
              <div
                key={p._id}
                className="slide-item"
                style={{
                  flex: `0 0 ${100 / itemsPerView}%`,
                }}
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>

        {/* Nút Phải: Chỉ hiện khi chưa chạm đến giới hạn hiển thị cuối cùng */}
        <button 
          className={`nav-btn right ${currentIndex >= products.length - itemsPerView ? "hidden" : ""}`} 
          onClick={nextSlide}
          disabled={currentIndex >= products.length - itemsPerView}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* DOTS (Tùy chọn: Thường Slider có nút rồi thì bỏ Dot cho đỡ rối) */}
      {products.length > itemsPerView && (
        <div className="dots">
          {Array.from({ length: products.length - itemsPerView + 1 }).map((_, index) => (
            <span
              key={index}
              className={`dot ${currentIndex === index ? "active" : ""}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ProductGrid;