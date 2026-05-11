import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Layout/Header";
import Footer from "../../components/Layout/Footer";
import ProductCard from "../../components/Product/ProductCard";
import { ChevronRight } from "lucide-react";
import { ProductGridSkeleton } from "../../components/Common/Skeletons";

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const tagId = searchParams.get("tag") || "";
  const tagName = searchParams.get("tagName") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

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

  const fetchSearchResults = async (currentPage, isLoadMore = false) => {
    if (!query && !tagId) {
      setProducts([]);
      setLoading(false);
      return;
    }
    
    if (!isLoadMore) setLoading(true);
    setError(null);
    try {
      let apiUrl = `${import.meta.env.VITE_API_URL}/api/products?limit=12&page=${currentPage}`;
      if (query) apiUrl += `&search=${encodeURIComponent(query)}`;
      else if (tagId) apiUrl += `&tag=${encodeURIComponent(tagId)}`;
      
      const response = await axios.get(apiUrl);
      const newData = response.data.data || (Array.isArray(response.data) ? response.data : []);
      const pagination = response.data.pagination || {};

      if (isLoadMore) {
        setProducts(prev => [...prev, ...newData]);
      } else {
        setProducts(newData);
      }

      setTotalCount(pagination.total || newData.length);
      setHasMore(currentPage < (pagination.pages || 1));
    } catch (err) {
      console.error("Lỗi khi tìm kiếm:", err);
      setError("Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchSearchResults(1, false);
  }, [query, tagId]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSearchResults(nextPage, true);
  };

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
          <p className="text-[15px] text-slate-500 m-0">Tìm thấy {totalCount} sản phẩm phù hợp</p>
        </div>

        {/* NỘI DUNG */}
        {loading && page === 1 ? (
          <ProductGridSkeleton count={8} />
        ) : error ? (
          <div className="text-center py-16 bg-red-50 rounded-xl border border-red-200 text-red-500 text-lg shadow-sm">
            {error}
          </div>
        ) : products.length > 0 ? (
          <>
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

            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 px-8 py-3 rounded-full font-semibold transition-all shadow-sm disabled:opacity-50"
                >
                  {loading ? "Đang tải..." : "Xem thêm sản phẩm"}
                </button>
              </div>
            )}
          </>
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
