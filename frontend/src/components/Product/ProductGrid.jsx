import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import axios from "axios";

function ProductGrid({ preloadedProducts, initialFavoriteIds, isProductsReady = false }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState(new Set()); // Thêm state lưu tim

  // Trạng thái cho bộ lọc và phân trang
  const [activeTab, setActiveTab] = useState("all");
  const [visibleCount, setVisibleCount] = useState(6); // Mặc định hiển thị 6 sản phẩm (3 hàng trên mobile)

  useEffect(() => {
    if (Array.isArray(preloadedProducts)) {
      const hotProducts = preloadedProducts.filter((p) => p.isFeatured === true);
      setProducts(hotProducts);
      setLoading(!isProductsReady);
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Lấy tất cả sản phẩm
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preloadedProducts, isProductsReady]);

  useEffect(() => {
    if (initialFavoriteIds instanceof Set) {
      setFavoriteIds(new Set(initialFavoriteIds));
      return;
    }

    const token = localStorage.getItem("token");
    if (token) {
      axios.get(`${import.meta.env.VITE_API_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        const ids = new Set(res.data.map(p => p._id));
        setFavoriteIds(ids);
      }).catch(() => {});
    }
  }, [initialFavoriteIds]);

  // Lọc sản phẩm theo Tab (Tất cả, Điện thoại, Điện tử, Phụ kiện)
  const filteredProducts = products.filter(p => {
    if (activeTab === "all") return true;
    return p.productType === activeTab;
  });

  // Cắt mảng sản phẩm theo số lượng hiển thị hiện tại
  const displayedProducts = filteredProducts.slice(0, visibleCount);

  // Xử lý nút Tải thêm (mỗi lần thêm 6 sản phẩm = 3 hàng trên mobile)
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

  if (loading) return <div className="flex justify-center items-center py-20 text-gray-500 font-medium text-sm animate-pulse">Đang tải sản phẩm...</div>;

  return (
    <section className="w-full max-w-[1400px] mx-auto my-6 md:my-10 px-4 md:px-10 font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-8 gap-4 md:gap-5">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 m-0 mb-1 md:mb-2">Sản phẩm nổi bật</h2>
          <p className="text-[13px] md:text-sm text-gray-500 m-0">Sản phẩm bán chạy nhất được tuyển chọn cho bạn.</p>
        </div>

        {/* TABS - Vuốt ngang trên mobile */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide [&::-webkit-scrollbar]:hidden whitespace-nowrap">
          <button
            className={`border-none py-1.5 px-3.5 md:py-2 md:px-4 rounded-full text-[13px] md:text-sm font-medium cursor-pointer transition-all duration-200 shrink-0 ${activeTab === "all" ? "bg-gray-800 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            onClick={() => handleTabChange("all")}
          >
            Tất cả
          </button>
          <button
            className={`border-none py-1.5 px-3.5 md:py-2 md:px-4 rounded-full text-[13px] md:text-sm font-medium cursor-pointer transition-all duration-200 shrink-0 ${activeTab === "device" ? "bg-gray-800 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            onClick={() => handleTabChange("device")}
          >
            Điện thoại
          </button>
          <button
            className={`border-none py-1.5 px-3.5 md:py-2 md:px-4 rounded-full text-[13px] md:text-sm font-medium cursor-pointer transition-all duration-200 shrink-0 ${activeTab === "electronic" ? "bg-gray-800 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            onClick={() => handleTabChange("electronic")}
          >
            Điện tử
          </button>
          <button
            className={`border-none py-1.5 px-3.5 md:py-2 md:px-4 rounded-full text-[13px] md:text-sm font-medium cursor-pointer transition-all duration-200 shrink-0 ${activeTab === "accessory" ? "bg-gray-800 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            onClick={() => handleTabChange("accessory")}
          >
            Phụ kiện
          </button>
        </div>
      </div>

      {/* PRODUCT GRID - CHIA 2 CỘT TRÊN MOBILE */}
      {/* Sử dụng grid-cols-2 cho mọi màn hình, từ lg trở lên thì 3 hoặc 4 cột tùy ý */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-6 mb-8 md:mb-10">
        {displayedProducts.map((p) => (
          <ProductCard 
            key={p._id} 
            product={p} 
            isFavorited={favoriteIds.has(p._id)} 
            onFavoriteToggle={handleFavoriteToggle} 
          />
        ))}
      </div>

      {/* LOAD MORE BUTTON */}
      <div className="flex flex-col items-center mt-2.5 gap-4">
        {visibleCount < filteredProducts.length ? (
          <button 
            className="bg-white text-gray-700 border border-gray-300 py-2.5 px-6 md:py-3 md:px-8 rounded-full text-[13px] md:text-sm font-semibold cursor-pointer transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm" 
            onClick={handleLoadMore}
          >
            Xem thêm {filteredProducts.length - visibleCount} sản phẩm
          </button>
        ) : (
          filteredProducts.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-[1px] bg-gray-200"></div>
              <p className="text-[13px] text-gray-400 font-medium m-0">Bạn đã xem hết sản phẩm</p>
              <div className="w-10 h-[1px] bg-gray-200"></div>
            </div>
          )
        )}

        {filteredProducts.length === 0 && (
          <p className="text-[13px] text-gray-500 italic text-center m-0 py-10 bg-gray-50 rounded-xl w-full border border-dashed border-gray-200">
            Chưa có sản phẩm nào trong danh mục này.
          </p>
        )}
      </div>
    </section>
  );
}

export default ProductGrid;