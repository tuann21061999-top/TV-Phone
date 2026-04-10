import { useEffect, useState } from "react";
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

    // Lấy danh sách yêu thích nếu đã đăng nhập
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

  if (loading) return <div className="flex justify-center items-center py-20 text-gray-500 font-medium text-sm animate-pulse">Đang tải sản phẩm...</div>;

  return (
    <section className="w-full max-w-[1400px] mx-auto my-10 px-5 md:px-10 font-sans">
      <div className="flex justify-between items-start mb-8 flex-wrap gap-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 m-0 mb-2">Sản phẩm nổi bật</h2>
          <p className="text-sm text-gray-500 m-0">Sản phẩm bán chạy nhất được tuyển chọn cho bạn.</p>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <button
            className={`border-none py-2 px-4 rounded-full text-sm font-medium cursor-pointer transition-all duration-200 ${activeTab === "all" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            onClick={() => handleTabChange("all")}
          >
            Tất cả
          </button>
          <button
            className={`border-none py-2 px-4 rounded-full text-sm font-medium cursor-pointer transition-all duration-200 ${activeTab === "device" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            onClick={() => handleTabChange("device")}
          >
            Điện thoại
          </button>
          <button
            className={`border-none py-2 px-4 rounded-full text-sm font-medium cursor-pointer transition-all duration-200 ${activeTab === "electronic" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            onClick={() => handleTabChange("electronic")}
          >
            Điện tử
          </button>
          <button
            className={`border-none py-2 px-4 rounded-full text-sm font-medium cursor-pointer transition-all duration-200 ${activeTab === "accessory" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            onClick={() => handleTabChange("accessory")}
          >
            Phụ kiện
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {displayedProducts.map((p) => (
          <ProductCard 
            key={p._id} 
            product={p} 
            isFavorited={favoriteIds.has(p._id)} 
            onFavoriteToggle={handleFavoriteToggle} 
          />
        ))}
      </div>

      <div className="flex justify-center mt-2.5">
        {visibleCount < filteredProducts.length ? (
          <button 
            className="bg-white text-gray-700 border border-gray-300 py-3 px-6 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 hover:border-gray-400 hover:bg-gray-50" 
            onClick={handleLoadMore}
          >
            Tải thêm sản phẩm
          </button>
        ) : (
          filteredProducts.length > 0 && (
            <p className="text-sm text-gray-500 italic text-center m-0">Đã hiển thị tất cả sản phẩm trong mục này.</p>
          )
        )}

        {filteredProducts.length === 0 && (
          <p className="text-sm text-gray-500 italic text-center m-0">Không tìm thấy sản phẩm nào.</p>
        )}
      </div>
    </section>
  );
}

export default ProductGrid;