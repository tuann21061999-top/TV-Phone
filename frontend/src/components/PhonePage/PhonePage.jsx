/* eslint-disable no-unused-vars */
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import "./PhonePage.css";
import {
  Star,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  HeartPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  const [batteryRange, setBatteryRange] = useState("all");

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

    product.variants.forEach(v => {
      const now = new Date();
      let currentActivePrice = v.price;
      let currentDiscountPercent = 0;

      if (v.discountPrice != null && v.promotionEnd && new Date(v.promotionEnd) > now) {
        currentActivePrice = v.discountPrice;
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
      discountPercent: bestDiscountPercent
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

    if (batteryRange !== "all") {
      result = result.filter((p) => {
        const mah = extractBatteryValue(p);
        if (batteryRange === "small") return mah > 0 && mah < 4000;
        if (batteryRange === "medium") return mah >= 4000 && mah <= 5000;
        if (batteryRange === "large") return mah > 5000;
        return true;
      });
    }

    return result;
  }, [products, selectedBrands, selectedStorages, batteryRange]);

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
  }, [selectedBrands, selectedStorages, batteryRange]);

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

  return (
    <div className="phone-page">
      <Header />

      <div className="phone-container">
        <div className="phone-header">
          <h1>Điện thoại Di động</h1>
          <p>Tìm thấy {filteredProducts.length} sản phẩm</p>
        </div>

        <div className="phone-content">
          {/* SIDEBAR */}
          <aside className="phone-sidebar">
            <div className="sidebar-header">
              <Filter size={20} />
              <h2>Bộ lọc sản phẩm</h2>
            </div>

            <div className="filter-group">
              <h3>Thương hiệu</h3>
              <div className="filter-options">
                {availableBrands.map((brand) => (
                  <label key={brand}>
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() =>
                        setSelectedBrands((prev) =>
                          prev.includes(brand)
                            ? prev.filter((b) => b !== brand)
                            : [...prev, brand]
                        )
                      }
                    />
                    {brand}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h3>Bộ nhớ trong</h3>
              <div className="filter-options">
                {availableStorages.map((storage) => (
                  <label key={storage}>
                    <input
                      type="checkbox"
                      checked={selectedStorages.includes(storage)}
                      onChange={() =>
                        setSelectedStorages((prev) =>
                          prev.includes(storage)
                            ? prev.filter((s) => s !== storage)
                            : [...prev, storage]
                        )
                      }
                    />
                    {storage}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h3>Dung lượng Pin</h3>
              <div className="filter-options">
                {["all", "small", "medium", "large"].map((range) => (
                  <label key={range}>
                    <input
                      type="radio"
                      name="battery"
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
              className="reset-filter"
              onClick={() => {
                setSelectedBrands([]);
                setSelectedStorages([]);
                setBatteryRange("all");
              }}
            >
              <RotateCcw size={16} />
              Xóa bộ lọc
            </button>
          </aside>

          {/* PRODUCT GRID */}
          <section className="phone-products">
            {loading ? (
              <div className="loading">Đang tải sản phẩm...</div>
            ) : (
              <div className="product-grid">
                {currentProducts.map((product) => {
                  const { basePrice, finalPrice, discountPercent } = getPricingInfo(product);
                  const isDiscount = finalPrice < basePrice;

                  const displayImage = product.colorImages?.find(img => img.isDefault)?.imageUrl
                    || product.colorImages?.[0]?.imageUrl
                    || "/no-image.png";

                  return (
                    <div key={product._id} className="product-card">
                      <div className="product-tags">
                        {product.isFeatured && <span className="tag-hot">HOT</span>}
                        {isDiscount && discountPercent > 0 && <span className="discount-badge">-{discountPercent}%</span>}
                      </div>

                      <div
                        className="product-image"
                        onClick={() => navigate(`/product/${product.slug || product._id}`)}
                      >
                        <button
                          className={`wishlist-btn ${favoriteIds.has(product._id) ? "liked" : ""}`}
                          onClick={(e) => handleToggleFavorite(e, product._id)}
                          title={favoriteIds.has(product._id) ? "Bỏ yêu thích" : "Yêu thích"}
                        >
                          <HeartPlus size={18} fill="none" stroke={favoriteIds.has(product._id) ? "#ef4444" : "#6b7280"} />
                        </button>
                        <img src={displayImage} alt={product.name} />
                      </div>

                      <h3 onClick={() => navigate(`/product/${product.slug || product._id}`)}>
                        {product.name}
                      </h3>

                      {/* Đã thêm class highlight-item */}
                      <div className="product-highlights">
                        {product.highlights?.map((text, idx) => (
                          <span key={idx} className="highlight-item">{text}</span>
                        ))}
                      </div>

                      <div className="product-rating">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < Math.round(product.averageRating || 0) ? "#fbbf24" : "none"}
                            stroke={i < Math.round(product.averageRating || 0) ? "#fbbf24" : "#d1d5db"}
                          />
                        ))}
                        <span className="rating-count">({product.averageRating || 0})</span>
                      </div>

                      <div className="product-price">
                        {isDiscount ? (
                          <>
                            <span className="old">{formatPrice(basePrice)}</span>
                            <span className="new">{formatPrice(finalPrice)}</span>
                          </>
                        ) : (
                          <span className="new">{formatPrice(basePrice)}</span>
                        )}
                      </div>

                      <button
                        className="add-cart"
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <ChevronLeft size={18} />
                </button>

                {getPaginationNumbers().map((item, index) => (
                  <button
                    key={index}
                    className={`${currentPage === item ? "active" : ""} ${item === '...' ? "dots" : ""}`}
                    onClick={() => typeof item === 'number' && setCurrentPage(item)}
                    disabled={item === '...'}
                  >
                    {item}
                  </button>
                ))}

                <button
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

export default PhonePage;