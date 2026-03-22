import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ProductCard from "../../components/Product/ProductCard";
import { ChevronRight } from "lucide-react";
import "./SearchPage.css";

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState(new Set()); // Thêm state lưu tim

  useEffect(() => {
    // Lấy danh sách yêu thích khi load trang Search
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

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setProducts([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:5000/api/products?search=${encodeURIComponent(query)}`);
        setProducts(response.data);
      } catch (err) {
        console.error("Lỗi khi tìm kiếm:", err);
        setError("Có lỗi xảy ra khi tự động tìm kiếm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  const handleFavoriteToggle = (productId, isLiked) => {
    setFavoriteIds(prev => {
      const next = new Set(prev);
      isLiked ? next.add(productId) : next.delete(productId);
      return next;
    });
  };

  return (
    <div className="search-page-container">
      <Header />
      <div className="search-content">
        <nav className="breadcrumb" style={{ paddingBottom: "15px" }}>
          <Link to="/">Trang chủ</Link>
          <ChevronRight size={14} />
          <span>Tìm kiếm</span>
        </nav>
        <h1 className="search-title">Kết quả tìm kiếm cho: "{query}"</h1>
        <p className="search-subtitle">Tìm thấy {products.length} sản phẩm phù hợp</p>

        {loading ? (
          <div className="search-loading">Đang tải kết quả...</div>
        ) : error ? (
          <div className="search-error">{error}</div>
        ) : products.length > 0 ? (
          <div className="search-grid">
            {products.map((product) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                isFavorited={favoriteIds.has(product._id)}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        ) : (
          <div className="search-empty">
            Không tìm thấy sản phẩm nào khớp với từ khóa của bạn. Hãy thử lại với từ khóa khác nhé!
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default SearchPage;
