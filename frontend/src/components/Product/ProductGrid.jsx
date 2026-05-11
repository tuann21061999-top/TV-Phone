import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import axios from "axios";

function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProducts = async (currentPage, tab, isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);
      
      let url = `${import.meta.env.VITE_API_URL}/api/products?type=hot&limit=6&page=${currentPage}`;
      if (tab !== "all") url += `&productType=${tab}`;

      const { data } = await axios.get(url);
      const newProducts = data.data || [];
      const pagination = data.pagination || {};

      if (isLoadMore) {
        setProducts(prev => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
      }

      setTotalCount(pagination.total || 0);
      setHasMore(currentPage < (pagination.pages || 1));
    } catch (error) {
      console.error("Lỗi lấy sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1, activeTab);
  }, [activeTab]);

  useEffect(() => {
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, activeTab, true);
  };

  const handleFavoriteToggle = (productId, isLiked) => {
    setFavoriteIds(prev => {
      const next = new Set(prev);
      isLiked ? next.add(productId) : next.delete(productId);
      return next;
    });
  };

  if (loading && page === 1) return <div className="flex justify-center items-center py-20 text-gray-500 font-medium text-sm animate-pulse">Đang tải sản phẩm...</div>;

  return (
    <section className="w-full max-w-[1400px] mx-auto my-6 md:my-10 px-4 md:px-10 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-8 gap-4 md:gap-5">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 m-0 mb-1 md:mb-2">Sản phẩm nổi bật</h2>
          <p className="text-[13px] md:text-sm text-gray-500 m-0">Sản phẩm bán chạy nhất được tuyển chọn cho bạn.</p>
        </div>

        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide whitespace-nowrap">
          {["all", "device", "electronic", "accessory"].map((tab) => (
            <button
              key={tab}
              className={`border-none py-1.5 px-3.5 md:py-2 md:px-4 rounded-full text-[13px] md:text-sm font-medium cursor-pointer transition-all duration-200 shrink-0 ${activeTab === tab ? "bg-gray-800 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              onClick={() => handleTabChange(tab)}
            >
              {tab === "all" ? "Tất cả" : tab === "device" ? "Điện thoại" : tab === "electronic" ? "Điện tử" : "Phụ kiện"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-6 mb-8 md:mb-10">
        {products.map((p) => (
          <ProductCard 
            key={p._id} 
            product={p} 
            isFavorited={favoriteIds.has(p._id)} 
            onFavoriteToggle={handleFavoriteToggle} 
          />
        ))}
      </div>

      <div className="flex flex-col items-center mt-2.5 gap-4">
        {hasMore ? (
          <button 
            className="bg-white text-gray-700 border border-gray-300 py-2.5 px-6 md:py-3 md:px-8 rounded-full text-[13px] md:text-sm font-semibold cursor-pointer transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm" 
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? "Đang tải..." : `Xem thêm sản phẩm`}
          </button>
        ) : (
          products.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-[1px] bg-gray-200"></div>
              <p className="text-[13px] text-gray-400 font-medium m-0">Bạn đã xem hết {totalCount} sản phẩm</p>
              <div className="w-10 h-[1px] bg-gray-200"></div>
            </div>
          )
        )}

        {products.length === 0 && !loading && (
          <p className="text-[13px] text-gray-500 italic text-center m-0 py-10 bg-gray-50 rounded-xl w-full border border-dashed border-gray-200">
            Chưa có sản phẩm nổi bật nào trong danh mục này.
          </p>
        )}
      </div>
    </section>
  );
}

export default ProductGrid;