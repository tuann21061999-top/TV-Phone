
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import {
  Star,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  Heart,
} from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "sonner";

function PhonePage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  // Filter states
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedStorages, setSelectedStorages] = useState([]);
  const [selectedRams, setSelectedRams] = useState([]);
  const [batteryRange, setBatteryRange] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const brandQuery = params.get("brand");
    if (brandQuery) {
      setSelectedBrands([brandQuery]);
    } else {
      setSelectedBrands([]);
    }
  }, [location.search]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "http://localhost:5000/api/products?productType=device"
        );

        const devices = res.data.filter(p => p.productType === "device");
        setProducts(devices);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Fetch favorites nếu đã đăng nhập
    const token = localStorage.getItem("token");
    if (token) {
      axios.get("http://localhost:5000/api/favorites", {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        const ids = new Set(res.data.map(p => p._id));
        setFavoriteIds(ids);
      }).catch(() => { });
    }
  }, []);

  const handleToggleFavorite = async (e, productId) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning("Vui lòng đăng nhập để sử dụng tính năng yêu thích!");
      navigate("/login");
      return;
    }
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/favorites/toggle",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFavoriteIds(prev => {
        const next = new Set(prev);
        data.isFavorited ? next.add(productId) : next.delete(productId);
        return next;
      });
      toast.success(data.message);
    } catch {
      toast.error("Lỗi khi thực hiện yêu thích!");
    }
  };

  /* ================= HELPER FUNCTIONS ================= */
  const formatPrice = (price) => price?.toLocaleString("vi-VN") + "₫";

  const getPricingInfo = (product) => {
    if (!product.variants?.length) return { basePrice: 0, finalPrice: 0, discountPercent: 0 };

    let bestBasePrice = Infinity;
    let bestFinalPrice = Infinity;
    let bestDiscountPercent = 0;
    
    let isShock = false;
    let totalLimit = 0;
    let totalSold = 0;

    product.variants.forEach(v => {
      const now = new Date();
      let currentActivePrice = v.price;
      let currentDiscountPercent = 0;

      if (v.discountPrice != null && v.promotionEnd && new Date(v.promotionEnd) > now) {
        currentActivePrice = v.discountPrice;
        if (v.isShockDeal) isShock = true;
        
        if (v.quantityLimit > 0) {
            totalLimit += v.quantityLimit;
            totalSold += (v.soldQuantity || 0);
        }

        if (v.discountType === "percentage") {
          currentDiscountPercent = v.discountValue;
        } else if (v.discountType === "fixed") {
          currentDiscountPercent = Math.round((v.discountValue / v.price) * 100);
        }
      }

      if (currentActivePrice < bestFinalPrice) {
        bestFinalPrice = currentActivePrice;
        bestBasePrice = v.price;
        bestDiscountPercent = currentDiscountPercent;
      }
    });

    return {
      basePrice: bestBasePrice === Infinity ? 0 : bestBasePrice,
      finalPrice: bestFinalPrice === Infinity ? 0 : bestFinalPrice,
      discountPercent: bestDiscountPercent,
      totalLimit,
      totalSold
    };
  };

  const extractBatteryValue = (product) => {
    if (!product.specs) return 0;
    const batteryMatch = Object.values(product.specs)
      .join(" ")
      .match(/(\d+)\s*mAh/i);
    return batteryMatch ? parseInt(batteryMatch[1]) : 0;
  };

  /* ================= FILTER LOGIC ================= */
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand));
    }

    if (selectedStorages.length > 0) {
      result = result.filter((p) =>
        p.variants?.some((v) => selectedStorages.includes(v.storage))
      );
    }

    if (selectedRams.length > 0) {
      result = result.filter((p) =>
        p.variants?.some((v) => selectedRams.includes(v.size))
      );
    }

    if (batteryRange !== "all") {
      result = result.filter((p) => {
        const mah = extractBatteryValue(p);
        if (batteryRange === "small") return mah > 0 && mah < 4000;
        if (batteryRange === "medium") return mah >= 4000 && mah <= 5000;
        if (batteryRange === "large") return mah > 5000;
        return true;
      });
    }

    if (priceRange !== "all") {
      result = result.filter((p) => {
        const { finalPrice } = getPricingInfo(p);
        if (priceRange === "under2") return finalPrice > 0 && finalPrice < 2000000;
        if (priceRange === "2to5") return finalPrice >= 2000000 && finalPrice <= 5000000;
        if (priceRange === "5to10") return finalPrice > 5000000 && finalPrice <= 10000000;
        if (priceRange === "10to20") return finalPrice > 10000000 && finalPrice <= 20000000;
        if (priceRange === "above20") return finalPrice > 20000000;
        return true;
      });
    }

    return result;
  }, [products, selectedBrands, selectedStorages, selectedRams, batteryRange, priceRange]);

  /* ================= PAGINATION ================= */
  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const getPaginationNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBrands, selectedStorages, selectedRams, batteryRange, priceRange]);

  /* ================= DERIVED DATA ================= */
  const availableBrands = useMemo(() => {
    return [...new Set(products.map((p) => p.brand))].sort();
  }, [products]);

  const availableStorages = useMemo(() => {
    const allStorages = products.flatMap((p) =>
      p.variants?.map((v) => v.storage).filter(Boolean)
    );
    return [...new Set(allStorages)].sort((a, b) => parseInt(a) - parseInt(b));
  }, [products]);

  const availableRams = useMemo(() => {
    const allRams = products.flatMap((p) =>
      p.variants?.map((v) => v.size).filter(Boolean)
    );
    return [...new Set(allRams)].sort((a, b) => parseInt(a) - parseInt(b));
  }, [products]);

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Header />

      {/* CSS Nhúng cho animation nảy tim */}
      <style>
        {`
          @keyframes heartPop {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
          }
          .animate-heartPop {
            animation: heartPop 0.35s ease;
          }
        `}
      </style>

      <div className="w-full max-w-[1400px] mx-auto py-5 px-5 sm:py-10 sm:px-10">
        <nav className="flex items-center gap-2 text-sm text-slate-500 pb-4">
          <Link to="/" className="hover:text-blue-600 transition-colors no-underline text-inherit">Trang chủ</Link>
          <ChevronRight size={14} />
          <span className="font-semibold text-slate-700">Điện thoại Di động</span>
        </nav>

        <div className="mb-[30px]">
          <h1 className="text-[28px] font-bold text-slate-800 m-0 mb-2">Điện thoại Di động</h1>
          <p className="text-slate-500 m-0 text-[15px]">Tìm thấy {filteredProducts.length} sản phẩm</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-[30px] items-start">
          {/* SIDEBAR BỘ LỌC */}
          <aside className="w-full lg:w-[280px] shrink-0 p-6 bg-white rounded-xl border border-slate-200 shadow-sm lg:sticky lg:top-6 relative">
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100 text-slate-800">
              <Filter size={20} />
              <h2 className="text-[18px] font-bold m-0">Bộ lọc sản phẩm</h2>
            </div>

            {/* THƯƠNG HIỆU */}
            <div className="mb-6 pb-6 border-b border-slate-100">
              <h3 className="text-[14px] font-bold text-slate-800 mb-4 uppercase tracking-wide m-0">Thương hiệu</h3>
              {/* Chỉ dùng grid-cols-2 cho mọi màn hình để chia 2 cột */}
              <div className="grid grid-cols-2 gap-3">
                {availableBrands.map((brand) => (
                  <label key={brand} className="flex items-center gap-2.5 text-[14px] cursor-pointer text-slate-600 hover:text-blue-600 transition-colors">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-blue-600 cursor-pointer shrink-0"
                      checked={selectedBrands.includes(brand)}
                      onChange={() =>
                        setSelectedBrands((prev) =>
                          prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
                        )
                      }
                    />
                    <span className="truncate">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* MỨC GIÁ */}
            <div className="mb-6 pb-6 border-b border-slate-100">
              <h3 className="text-[14px] font-bold text-slate-800 mb-4 uppercase tracking-wide m-0">Mức giá</h3>
              <div className="flex flex-col gap-3 max-[1024px]:flex-row max-[1024px]:flex-wrap">
                {[
                  { id: "all", label: "Tất cả" },
                  { id: "under2", label: "Dưới 2 triệu" },
                  { id: "2to5", label: "Từ 2 - 5 triệu" },
                  { id: "5to10", label: "Từ 5 - 10 triệu" },
                  { id: "10to20", label: "Từ 10 - 20 triệu" },
                  { id: "above20", label: "Trên 20 triệu" }
                ].map((range) => (
                  <label key={range.id} className="flex items-center gap-2.5 text-[14px] cursor-pointer text-slate-600 hover:text-blue-600 transition-colors">
                    <input
                      type="radio"
                      name="priceRange"
                      className="w-4 h-4 accent-blue-600 cursor-pointer shrink-0"
                      checked={priceRange === range.id}
                      onChange={() => setPriceRange(range.id)}
                    />
                    {range.label}
                  </label>
                ))}
              </div>
            </div>

            {/* RAM */}
            <div className="mb-6 pb-6 border-b border-slate-100">
              <h3 className="text-[14px] font-bold text-slate-800 mb-4 uppercase tracking-wide m-0">RAM</h3>
              <div className="grid grid-cols-2 gap-2 max-[1024px]:flex max-[1024px]:flex-row max-[1024px]:flex-wrap">
                {availableRams.map((ram) => (
                  <label key={ram} className="flex items-center gap-2.5 text-[14px] cursor-pointer text-slate-600 hover:text-blue-600 transition-colors">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-blue-600 cursor-pointer shrink-0"
                      checked={selectedRams.includes(ram)}
                      onChange={() =>
                        setSelectedRams((prev) =>
                          prev.includes(ram) ? prev.filter((r) => r !== ram) : [...prev, ram]
                        )
                      }
                    />
                    {ram}
                  </label>
                ))}
              </div>
            </div>

            {/* BỘ NHỚ TRONG */}
            <div className="mb-6 pb-6 border-b border-slate-100">
              <h3 className="text-[14px] font-bold text-slate-800 mb-4 uppercase tracking-wide m-0">Bộ nhớ trong</h3>
              <div className="grid grid-cols-2 gap-2 max-[1024px]:flex max-[1024px]:flex-row max-[1024px]:flex-wrap">
                {availableStorages.map((storage) => (
                  <label key={storage} className="flex items-center gap-2.5 text-[14px] cursor-pointer text-slate-600 hover:text-blue-600 transition-colors">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-blue-600 cursor-pointer shrink-0"
                      checked={selectedStorages.includes(storage)}
                      onChange={() =>
                        setSelectedStorages((prev) =>
                          prev.includes(storage) ? prev.filter((s) => s !== storage) : [...prev, storage]
                        )
                      }
                    />
                    {storage}
                  </label>
                ))}
              </div>
            </div>

            {/* DUNG LƯỢNG PIN */}
            <div className="mb-6 pb-6 border-b border-slate-100 last:border-0 last:mb-4 last:pb-0">
              <h3 className="text-[14px] font-bold text-slate-800 mb-4 uppercase tracking-wide m-0">Dung lượng Pin</h3>
              <div className="flex flex-col gap-3 max-[1024px]:flex-row max-[1024px]:flex-wrap">
                {["all", "small", "medium", "large"].map((range) => (
                  <label key={range} className="flex items-center gap-2.5 text-[14px] cursor-pointer text-slate-600 hover:text-blue-600 transition-colors">
                    <input
                      type="radio"
                      name="battery"
                      className="w-4 h-4 accent-blue-600 cursor-pointer shrink-0"
                      checked={batteryRange === range}
                      onChange={() => setBatteryRange(range)}
                    />
                    {range === "all" && "Tất cả"}
                    {range === "small" && "Dưới 4000 mAh"}
                    {range === "medium" && "4000 - 5000 mAh"}
                    {range === "large" && "Trên 5000 mAh"}
                  </label>
                ))}
              </div>
            </div>

            <button
              className="w-full flex items-center justify-center gap-2 p-3 border border-red-200 bg-red-50 text-red-500 rounded-lg font-semibold text-[14px] cursor-pointer transition-all hover:bg-red-500 hover:text-white hover:border-red-500"
              onClick={() => {
                setSelectedBrands([]);
                setSelectedStorages([]);
                setSelectedRams([]);
                setBatteryRange("all");
                setPriceRange("all");
              }}
            >
              <RotateCcw size={16} />
              Xóa bộ lọc
            </button>
          </aside>

          {/* PRODUCT GRID */}
          <section className="flex-1 min-w-0">
            {loading ? (
              <div className="text-center p-10 text-[16px] text-slate-500">Đang tải sản phẩm...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {currentProducts.map((product) => {
                  const { basePrice, finalPrice, discountPercent, totalLimit, totalSold } = getPricingInfo(product);
                  const isDiscount = finalPrice < basePrice;
                  const displayImage = product.colorImages?.find(img => img.isDefault)?.imageUrl || product.colorImages?.[0]?.imageUrl || "/no-image.png";
                  const quantityLeft = Math.max(0, totalLimit - totalSold);
                  const progressPercent = totalLimit > 0 ? Math.min((totalSold / totalLimit) * 100, 100) : 0;

                  return (
                    <div key={product._id} className="bg-white p-4 rounded-xl text-center transition-all duration-300 flex flex-col border border-slate-200 relative hover:-translate-y-1 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] hover:border-slate-300 group h-full">

                      {/* Tags */}
                      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
                        {product.isFeatured && <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-1 rounded tracking-[0.5px]">HOT</span>}
                        {isDiscount && discountPercent > 0 && <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-1 rounded tracking-[0.5px]">-{discountPercent}%</span>}
                      </div>

                      {/* Wishlist Button */}
                      <button
                        className={`absolute top-2 right-2 z-20 bg-white/85 border-none rounded-full w-8 h-8 p-0 flex items-center justify-center cursor-pointer transition-all duration-250 ease-out shadow-[0_2px_6px_rgba(0,0,0,0.1)] hover:bg-white hover:scale-[1.15] hover:shadow-[0_3px_10px_rgba(0,0,0,0.15)] ${favoriteIds.has(product._id) ? "bg-red-50 animate-heartPop" : ""
                          }`}
                        onClick={(e) => handleToggleFavorite(e, product._id)}
                        title={favoriteIds.has(product._id) ? "Bỏ yêu thích" : "Yêu thích"}
                      >
                        <Heart size={18} color={favoriteIds.has(product._id) ? "#ef4444" : "#6b7280"} fill={favoriteIds.has(product._id) ? "#ef4444" : "none"} />
                      </button>

                      {/* --- FIX LỖI ẢNH BỊ PHÓNG TO NẰM Ở ĐÂY --- */}
                      <div
                        className="h-[150px] sm:h-[200px] w-full flex items-center justify-center mb-4 cursor-pointer overflow-hidden rounded-lg relative"
                        onClick={() => navigate(`/product/${product.slug || product._id}`)}
                      >
                        <img
                          src={displayImage}
                          alt={product.name}
                          className="max-w-full max-h-full p-2 object-contain object-center transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>

                      <h3
                        onClick={() => navigate(`/product/${product.slug || product._id}`)}
                        className="text-[15px] font-semibold text-slate-800 mb-3 m-0 cursor-pointer line-clamp-2 overflow-hidden min-h-[42px] transition-colors group-hover:text-blue-600"
                      >
                        {product.name}
                      </h3>

                      {/* Highlights */}
                      <div className="flex justify-center gap-1.5 mb-3 flex-wrap min-h-[24px]">
                        {product.highlights?.map((text, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-600 text-[11px] font-semibold px-2 py-1 rounded-md whitespace-nowrap transition-all duration-200 group-hover:bg-blue-50 group-hover:text-blue-600">
                            {text}
                          </span>
                        ))}
                      </div>

                      {/* Rating */}
                      <div className="flex items-center justify-center gap-[2px] mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < Math.round(product.averageRating || 0) ? "#fbbf24" : "none"}
                            stroke={i < Math.round(product.averageRating || 0) ? "#fbbf24" : "#d1d5db"}
                          />
                        ))}
                        <span className="text-[12px] text-slate-500 ml-1">({product.reviewsCount || 0} đánh giá)</span>
                      </div>

                      {/* Price */}
                      <div className="mt-auto mb-4 flex flex-col items-center min-h-[44px] justify-end">
                        {isDiscount ? (
                          <div className="flex flex-col items-center w-full">
                            <span className="text-[13px] text-slate-400 line-through mb-0.5">{formatPrice(basePrice)}</span>
                            <span className="text-red-500 font-bold text-[16px] sm:text-[18px]">{formatPrice(finalPrice)}</span>
                            {totalLimit > 0 && (
                              <div className="w-full mt-2">
                                <div className="w-full h-1.5 bg-red-100/50 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full" style={{ width: `${progressPercent}%` }} />
                                </div>
                                <div className="flex justify-center text-[10px] items-center gap-1.5 font-semibold text-red-500 mt-1">
                                   <span className="relative flex h-1.5 w-1.5">
                                     {quantityLeft > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                                     <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                   </span>
                                   {quantityLeft > 0 ? `Còn ${quantityLeft} suất` : "Đã hết suất"}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-red-500 font-bold text-[16px] sm:text-[18px]">{formatPrice(basePrice)}</span>
                        )}
                      </div>

                      <button
                        className="p-2.5 w-full border border-slate-200 rounded-lg bg-white text-blue-600 cursor-pointer font-semibold text-[14px] flex items-center justify-center gap-2 transition-all duration-200 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                        onClick={() => navigate(`/product/${product.slug || product._id}`)}
                      >
                        <ShoppingCart size={16} />
                        Xem chi tiết
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && filteredProducts.length === 0 && (
              <div className="bg-white p-10 text-center text-slate-500 rounded-xl shadow-sm border border-dashed border-slate-200 mt-5">
                <span className="block text-4xl mb-3">🔍</span>
                Không tìm thấy điện thoại nào phù hợp.
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10 flex-wrap">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="w-10 h-10 rounded-lg border border-slate-200 bg-white text-slate-600 font-semibold flex items-center justify-center cursor-pointer transition-all hover:border-blue-600 hover:text-blue-600 disabled:bg-slate-50 disabled:text-slate-300 disabled:border-slate-200 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                </button>

                {getPaginationNumbers().map((item, index) => (
                  <button
                    key={index}
                    onClick={() => typeof item === 'number' && setCurrentPage(item)}
                    disabled={item === '...'}
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center font-semibold transition-all duration-200 ${currentPage === item
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : item === "..."
                        ? "bg-transparent border-transparent text-slate-500 cursor-default"
                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-600 hover:text-blue-600 cursor-pointer"
                      }`}
                  >
                    {item}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="w-10 h-10 rounded-lg border border-slate-200 bg-white text-slate-600 font-semibold flex items-center justify-center cursor-pointer transition-all hover:border-blue-600 hover:text-blue-600 disabled:bg-slate-50 disabled:text-slate-300 disabled:border-slate-200 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default PhonePage;