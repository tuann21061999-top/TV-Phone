import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../Product/ProductCard";
import { Flame, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function NewArrivals({ preloadedProducts, initialFavoriteIds, isProductsReady = false }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    if (Array.isArray(preloadedProducts)) {
      const latest = [...preloadedProducts]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);

      setProducts(latest);
      setLoading(!isProductsReady);
      return;
    }

    const fetchLatest = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
        const allProducts = Array.isArray(data) ? data : data.data || [];

        // Sắp xếp theo ngày tạo mới nhất và lấy 6 sản phẩm
        const latest = [...allProducts]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 6);

        setProducts(latest);
      } catch (error) {
        console.error("Lỗi lấy sản phẩm mới:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preloadedProducts, isProductsReady]);

  useEffect(() => {
    if (initialFavoriteIds instanceof Set) {
      setFavoriteIds(new Set(initialFavoriteIds));
      return;
    }

    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const ids = new Set(res.data.map((p) => p._id));
          setFavoriteIds(ids);
        })
        .catch(() => {});
    }
  }, [initialFavoriteIds]);

  const handleFavoriteToggle = (productId, isLiked) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      isLiked ? next.add(productId) : next.delete(productId);
      return next;
    });
  };

  if (loading || products.length === 0) return null;

  return (
    <section className="w-full max-w-[1400px] mx-auto my-8 md:my-14 px-4 md:px-10 font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-5 md:mb-8">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[11px] md:text-[12px] font-bold tracking-wide px-3 py-1 rounded-full uppercase mb-2">
            <Flame size={14} /> Mới về
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 m-0">Sản phẩm mới về</h2>
          <p className="text-[13px] md:text-sm text-slate-500 m-0 mt-1">Cập nhật những sản phẩm mới nhất vừa về kho</p>
        </div>
        <button
          className="hidden sm:flex items-center gap-1.5 text-[13px] md:text-sm font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-2 cursor-pointer transition-all hover:bg-emerald-100 hover:-translate-y-0.5"
          onClick={() => navigate("/search?q=")}
        >
          Xem tất cả <ArrowRight size={15} />
        </button>
      </div>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2.5 md:gap-6">
        {products.map((p) => (
          <ProductCard
            key={p._id}
            product={p}
            isFavorited={favoriteIds.has(p._id)}
            onFavoriteToggle={handleFavoriteToggle}
          />
        ))}
      </div>
    </section>
  );
}

export default NewArrivals;
