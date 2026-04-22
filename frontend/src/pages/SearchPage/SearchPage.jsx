import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ProductCard from "../../components/Product/ProductCard";
import { ChevronRight } from "lucide-react";

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const tagId = searchParams.get("tag") || "";
  const tagName = searchParams.get("tagName") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    // Lấy danh sách yêu thích khi load trang Search
    const token = localStorage.getItem("token");
    if (token) {
      axios.get(`${import.meta.env.VITE_API_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        const ids = new Set(res.data.map(p => p._id));
        setFavoriteIds(ids);
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query && !tagId) {
        setProducts([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        let apiUrl = `${import.meta.env.VITE_API_URL}/api/products`;
        if (query) apiUrl += `?search=${encodeURIComponent(query)}`;
        else if (tagId) apiUrl += `?tag=${encodeURIComponent(tagId)}`;
        
        const response = await axios.get(apiUrl);
        setProducts(response.data);
      } catch (err) {
        console.error("Lỗi khi tìm kiếm:", err);
        setError("Có lỗi xảy ra khi tự động tìm kiếm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, tagId]);

  const handleFavoriteToggle = (productId, isLiked) => {
    setFavoriteIds(prev => {
      const next = new Set(prev);
      isLiked ? next.add(productId) : next.delete(productId);
      return next;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <Header />
      
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-5 py-10 md:px-10">
        
        {/* BREADCRUMB */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6 flex-wrap">
          <Link to="/" className="text-slate-500 hover:text-blue-600 transition-colors no-underline">Trang chủ</Link>
          <ChevronRight size={14} />
          <span className="font-semibold text-slate-800">Tìm kiếm</span>
        </nav>
        
        {/* HEADER TÌM KIẾM */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-[28px] font-bold text-slate-900 m-0 mb-1">
            {tagName ? `Kết quả lọc theo tag: "${tagName}"` : `Kết quả tìm kiếm cho: "${query}"`}
          </h1>
          <p className="text-[15px] text-slate-500 m-0">Tìm thấy {products.length} sản phẩm phù hợp</p>
        </div>

        {/* NỘI DUNG */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200 text-slate-600 text-lg animate-pulse shadow-sm">
            Đang tải kết quả...
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-red-50 rounded-xl border border-red-200 text-red-500 text-lg shadow-sm">
            {error}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
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
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200 text-slate-600 text-lg shadow-sm px-5">
            Không tìm thấy sản phẩm nào khớp với từ khóa của bạn. Hãy thử lại với từ khóa khác nhé!
          </div>
        )}
        
      </main>

      <Footer />
    </div>
  );
}

export default SearchPage;
