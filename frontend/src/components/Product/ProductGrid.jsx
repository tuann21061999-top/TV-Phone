import { useEffect, useState } from "react";
import "./Product.css";
import ProductCard from "./ProductCard";
import axios from "axios";

function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState(new Set()); // Thêm state lưu tim

  // Trạng thái cho bộ lọc và phân trang
  const [activeTab, setActiveTab] = useState("all");
  const [visibleCount, setVisibleCount] = useState(6); // Mặc định hiển thị 6 sản phẩm (2 hàng)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Lấy tất cả sản phẩm
        const res = await axios.get("http://localhost:5000/api/products");
        const allProducts = Array.isArray(res.data) ? res.data : res.data.data || [];

        // Chỉ lấy các sản phẩm HOT (Nổi bật)
        const hotProducts = allProducts.filter(p => p.isFeatured === true);
        setProducts(hotProducts);
      } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();

    // Lấy danh sách yêu thích nếu đã đăng nhập
    const token = localStorage.getItem("token");
    if (token) {
      axios.get("http://localhost:5000/api/favorites", {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        const ids = new Set(res.data.map(p => p._id));
        setFavoriteIds(ids);
      }).catch(() => {});
    }
  }, []);

  // Lọc sản phẩm theo Tab (Tất cả, Điện thoại, Điện tử, Phụ kiện)
  const filteredProducts = products.filter(p => {
    if (activeTab === "all") return true;
    // So sánh trường productType trong database với tab đang chọn
    return p.productType === activeTab;
  });

  // Cắt mảng sản phẩm theo số lượng hiển thị hiện tại
  const displayedProducts = filteredProducts.slice(0, visibleCount);

  // Xử lý nút Tải thêm
  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + 6);
  };

  // Reset số lượng hiển thị khi đổi tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setVisibleCount(6); // Quay về hiển thị 6 cái đầu tiên của tab mới
  };

  const handleFavoriteToggle = (productId, isLiked) => {
    setFavoriteIds(prev => {
      const next = new Set(prev);
      isLiked ? next.add(productId) : next.delete(productId);
      return next;
    });
  };

  if (loading) return <div className="loading">Đang tải sản phẩm...</div>;

  return (
    <section className="product-grid-section">
      <div className="grid-header">
        <div className="grid-header-text">
          <h2>Sản phẩm nổi bật</h2>
          <p>Sản phẩm bán chạy nhất được tuyển chọn cho bạn.</p>
        </div>
        <div className="grid-filters">
          <button
            className={`filter-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => handleTabChange("all")}
          >
            Tất cả
          </button>
          <button
            className={`filter-btn ${activeTab === "device" ? "active" : ""}`}
            onClick={() => handleTabChange("device")}
          >
            Điện thoại
          </button>
          <button
            className={`filter-btn ${activeTab === "electronic" ? "active" : ""}`}
            onClick={() => handleTabChange("electronic")}
          >
            Điện tử
          </button>
          <button
            className={`filter-btn ${activeTab === "accessory" ? "active" : ""}`}
            onClick={() => handleTabChange("accessory")}
          >
            Phụ kiện
          </button>
        </div>
      </div>

      <div className="grid-container">
        {displayedProducts.map((p) => (
          <ProductCard 
            key={p._id} 
            product={p} 
            isFavorited={favoriteIds.has(p._id)} 
            onFavoriteToggle={handleFavoriteToggle} 
          />
        ))}
      </div>

      <div className="load-more-container">
        {visibleCount < filteredProducts.length ? (
          <button className="load-more-btn" onClick={handleLoadMore}>
            Tải thêm sản phẩm
          </button>
        ) : (
          filteredProducts.length > 0 && (
            <p className="no-more-msg">Đã hiển thị tất cả sản phẩm trong mục này.</p>
          )
        )}

        {filteredProducts.length === 0 && (
          <p className="no-more-msg">Không tìm thấy sản phẩm nào.</p>
        )}
      </div>
    </section>
  );
}

export default ProductGrid;