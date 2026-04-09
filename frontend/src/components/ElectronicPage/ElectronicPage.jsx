import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import axios from "axios";
import { toast } from "sonner";
import {
  Star,
  ShoppingCart,
  Filter,
  Headphones,
  BatteryPlus,
  Watch,
  Fan,
  HeartPlus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

function ElectronicPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [activeCategory, setActiveCategory] = useState(location.state?.category || "Tất cả");
  const [priceRange, setPriceRange] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [sortOption, setSortOption] = useState("default");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const brandQuery = params.get("brand");
    if (brandQuery) {
      setBrandFilter(brandQuery);
    } else {
      setBrandFilter("all");
    }
  }, [location.search]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  const categories = [
    { name: "Tất cả", icon: null },
    { name: "Tai nghe", icon: <Headphones size={16} /> },
    { name: "Sạc dự phòng", icon: <BatteryPlus size={16} /> },
    { name: "Đồng hồ", icon: <Watch size={16} /> },
    { name: "Quạt tản nhiệt", icon: <Fan size={16} /> }
  ];

  /* ================= FETCH ================= */

  useEffect(() => {
    if (location.state?.category) {
      setActiveCategory(location.state.category);
    }
  }, [location.state?.category]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          "http://localhost:5000/api/products?productType=electronic"
        );
        const electronics = data.filter(p => p.productType === "electronic");
        setProducts(electronics);
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Không thể tải sản phẩm");
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
    e.preventDefault();
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



  /* ================= HELPERS ================= */

  const formatPrice = (price) =>
    price?.toLocaleString("vi-VN") + "₫";

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

  /* ================= GET BRANDS ================= */

  const brands = useMemo(() => {
    return [
      ...new Set(products.map((p) => p.brand).filter(Boolean))
    ];
  }, [products]);

  /* ================= FILTER LOGIC ================= */

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    /* 1️⃣ CATEGORY */
    if (activeCategory !== "Tất cả") {
      filtered = filtered.filter((product) => {
        // Lấy đúng tên danh mục của sản phẩm từ Database
        const catName = product.categoryId?.name || product.categoryName || "";
        // So sánh tuyệt đối (bỏ qua chữ hoa/thường và khoảng trắng)
        return catName.trim().toLowerCase() === activeCategory.trim().toLowerCase();
      });
    }

    /* 2️⃣ PRICE */
    if (priceRange !== "all") {
      filtered = filtered.filter((product) => {
        const price = getPricingInfo(product).finalPrice;

        if (priceRange === "under500")
          return price < 500000;

        if (priceRange === "500to1m")
          return price >= 500000 && price <= 1000000;

        if (priceRange === "above1m")
          return price > 1000000;

        return true;
      });
    }

    /* 3️⃣ RATING */
    if (ratingFilter !== "all") {
      filtered = filtered.filter(
        (p) =>
          Math.round(p.averageRating || 0) >=
          parseInt(ratingFilter)
      );
    }

    /* 4️⃣ BRAND */
    if (brandFilter !== "all") {
      filtered = filtered.filter(
        (p) => p.brand === brandFilter
      );
    }

    /* 5️⃣ SORT */
    if (sortOption === "priceAsc") {
      filtered.sort(
        (a, b) =>
          getPricingInfo(a).finalPrice - getPricingInfo(b).finalPrice
      );
    }

    if (sortOption === "priceDesc") {
      filtered.sort(
        (a, b) =>
          getPricingInfo(b).finalPrice - getPricingInfo(a).finalPrice
      );
    }

    if (sortOption === "rating") {
      filtered.sort(
        (a, b) =>
          (b.averageRating || 0) -
          (a.averageRating || 0)
      );
    }

    return filtered;
  }, [
    products,
    activeCategory,
    priceRange,
    ratingFilter,
    brandFilter,
    sortOption
  ]);

  const resetFilters = () => {
    setActiveCategory("Tất cả");
    setPriceRange("all");
    setRatingFilter("all");
    setBrandFilter("all");
    setSortOption("default");
  };

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
  }, [activeCategory, priceRange, ratingFilter, brandFilter, sortOption]);

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#f5f7fa] font-sans">
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

      <div className="w-[90%] max-w-[1600px] mx-auto py-8 px-4 md:px-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 pb-4">
          <Link to="/" className="hover:text-blue-600 transition-colors no-underline">Trang chủ</Link>
          <ChevronRight size={14} />
          <span className="font-medium text-gray-800">Đồ điện tử</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đồ điện tử</h1>
          <p className="text-gray-500 m-0">Tìm thấy {filteredProducts.length} sản phẩm</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* SIDEBAR */}
          <aside className="w-full md:w-[250px] bg-white p-5 rounded-lg shadow-sm sticky top-[100px] max-h-[calc(100vh-120px)] overflow-y-auto shrink-0">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 m-0 mb-5">
              <Filter size={18} /> Bộ lọc
            </h3>

            {/* CATEGORY */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3 m-0">Danh mục</h4>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  className={`flex items-center gap-2 w-full p-2 border-none rounded-md cursor-pointer transition-colors mb-2 text-sm font-medium ${activeCategory === cat.name
                      ? "bg-blue-600 text-white"
                      : "bg-[#f3f3f3] text-gray-700 hover:bg-gray-200"
                    }`}
                  onClick={() => {
                    setActiveCategory(cat.name);
                    setBrandFilter("all");
                  }}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            {/* PRICE */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-2 m-0">Khoảng giá</h4>
              <select
                className="w-full p-2.5 border border-gray-200 rounded-md bg-white text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm cursor-pointer"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="under500">Dưới 500.000₫</option>
                <option value="500to1m">500.000₫ - 1.000.000₫</option>
                <option value="above1m">Trên 1.000.000₫</option>
              </select>
            </div>

            {/* RATING */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-2 m-0">Đánh giá</h4>
              <select
                className="w-full p-2.5 border border-gray-200 rounded-md bg-white text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm cursor-pointer"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="4">4★ trở lên</option>
                <option value="3">3★ trở lên</option>
              </select>
            </div>

            {/* BRAND */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-2 m-0">Hãng</h4>
              <select
                className="w-full p-2.5 border border-gray-200 rounded-md bg-white text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm cursor-pointer"
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* SORT */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-2 m-0">Sắp xếp</h4>
              <select
                className="w-full p-2.5 border border-gray-200 rounded-md bg-white text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm cursor-pointer"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="default">Mặc định</option>
                <option value="priceAsc">Giá tăng dần</option>
                <option value="priceDesc">Giá giảm dần</option>
                <option value="rating">Đánh giá cao nhất</option>
              </select>
            </div>

            <button
              className="w-full py-2 bg-gray-100 text-gray-600 font-semibold border-none rounded-md hover:bg-gray-200 hover:text-gray-800 transition-colors cursor-pointer"
              onClick={resetFilters}
            >
              Reset bộ lọc
            </button>
          </aside>

          {/* PRODUCTS */}
          <section className="flex-1">
            {loading && <div className="text-gray-500 font-medium">Đang tải...</div>}
            {error && <div className="text-red-500 font-medium">{error}</div>}

            {!loading && !error && (
              /* ĐÂY LÀ ĐOẠN GRID 3x3 Y HỆT TRANG ACCESSORY */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {currentProducts.map((product) => {
                  const { basePrice, finalPrice, discountPercent, totalLimit, totalSold } = getPricingInfo(product);
                  const hasDiscount = finalPrice < basePrice;
                  const quantityLeft = Math.max(0, totalLimit - totalSold);
                  const progressPercent = totalLimit > 0 ? Math.min((totalSold / totalLimit) * 100, 100) : 0;

                  const displayImage =
                    product.colorImages?.find((img) => img.isDefault)?.imageUrl ||
                    product.colorImages?.[0]?.imageUrl ||
                    product.images?.[0] ||
                    "/no-image.png";

                  return (
                    <div
                      key={product._id}
                      className="bg-white p-5 rounded-xl relative text-center flex flex-col h-full shadow-sm hover:shadow-md transition-shadow duration-300 group"
                    >
                      <Link
                        to={`/product/${product.slug || product._id}`}
                        className="flex flex-col flex-grow no-underline text-inherit"
                      >
                        {hasDiscount && discountPercent > 0 && (
                          <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                            -{discountPercent}%
                          </span>
                        )}

                        <div className="h-[150px] mb-4 relative flex items-center justify-center rounded-lg">
                          <button
                            className={`absolute top-2 right-2 z-20 bg-white/90 border-none rounded-full w-8 h-8 p-0 flex items-center justify-center cursor-pointer shadow-sm transition-all duration-300 hover:scale-110 hover:bg-white hover:shadow-md active:scale-125 ${favoriteIds.has(product._id) ? "bg-red-50 animate-heartPop" : ""
                              }`}
                            onClick={(e) => handleToggleFavorite(e, product._id)}
                            title={favoriteIds.has(product._id) ? "Bỏ yêu thích" : "Yêu thích"}
                          >
                            <HeartPlus
                              size={18}
                              color={favoriteIds.has(product._id) ? "#ef4444" : "#6b7280"}
                              fill={favoriteIds.has(product._id) ? "#ef4444" : "none"}
                            />
                          </button>
                          <img
                            src={displayImage}
                            alt={product.name}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <h3 className="text-[15px] font-semibold text-gray-800 mb-2 m-0 line-clamp-2 h-[45px]">
                          {product.name}
                        </h3>

                        <div className="flex flex-wrap justify-center gap-1 my-1.5 min-h-[28px]">
                          {product.highlights?.map((text, idx) => (
                            <span
                              key={idx}
                              className="bg-slate-100 text-slate-600 text-[11px] px-2 py-1 rounded"
                            >
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

                        <div className="mt-auto mb-3 font-bold text-red-500 text-lg w-full flex flex-col items-center">
                          <div className="flex items-baseline justify-center">
                            {formatPrice(finalPrice)}
                            {hasDiscount && (
                              <span className="ml-2 text-sm font-normal text-gray-400 line-through">
                                {formatPrice(basePrice)}
                              </span>
                            )}
                          </div>
                          
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
                      </Link>

                      <button 
                        className="bg-blue-600 text-white border-none py-2.5 px-4 cursor-pointer rounded-lg flex items-center justify-center w-full hover:bg-blue-700 transition-colors font-medium mt-2"
                        onClick={() => navigate(`/product/${product.slug || product._id}`)}
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && filteredProducts.length === 0 && (
              <div className="bg-white p-10 rounded-xl text-center text-gray-500 shadow-sm border border-dashed border-gray-200">
                Không tìm thấy đồ điện tử nào phù hợp.
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10 flex-wrap">
                <button
                  className="w-10 h-10 rounded-lg border border-slate-200 bg-white text-slate-600 font-semibold flex items-center justify-center cursor-pointer transition-all hover:border-blue-600 hover:text-blue-600 disabled:bg-slate-50 disabled:text-slate-300 disabled:border-slate-100 disabled:cursor-not-allowed"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <ChevronLeft size={18} />
                </button>

                {getPaginationNumbers().map((item, index) => (
                  <button
                    key={index}
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center font-semibold transition-all duration-200 ${currentPage === item
                        ? "bg-blue-600 text-white border-blue-600 cursor-pointer"
                        : item === "..."
                          ? "bg-transparent border-transparent text-slate-500 cursor-default"
                          : "bg-white text-slate-600 border-slate-200 hover:border-blue-600 hover:text-blue-600 cursor-pointer"
                      }`}
                    onClick={() => typeof item === "number" && setCurrentPage(item)}
                    disabled={item === "..."}
                  >
                    {item}
                  </button>
                ))}

                <button
                  className="w-10 h-10 rounded-lg border border-slate-200 bg-white text-slate-600 font-semibold flex items-center justify-center cursor-pointer transition-all hover:border-blue-600 hover:text-blue-600 disabled:bg-slate-50 disabled:text-slate-300 disabled:border-slate-100 disabled:cursor-not-allowed"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
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

export default ElectronicPage;