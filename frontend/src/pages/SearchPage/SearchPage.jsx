import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ProductCard from "../../components/Product/ProductCard";
import "./SearchPage.css";

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="search-page-container">
      <Header />
      <div className="search-content">
        <h1 className="search-title">Kết quả tìm kiếm cho: "{query}"</h1>
        <p className="search-subtitle">Tìm thấy {products.length} sản phẩm phù hợp</p>

        {loading ? (
          <div className="search-loading">Đang tải kết quả...</div>
        ) : error ? (
          <div className="search-error">{error}</div>
        ) : products.length > 0 ? (
          <div className="search-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
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
