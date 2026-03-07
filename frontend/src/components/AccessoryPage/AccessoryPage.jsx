import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import axios from "axios";
import { toast } from "sonner";
import "./AccessoryPage.css";
import {
  Star,
  ShoppingCart,
  Filter,
  Zap,
  ShieldCheck,
  SquarePercent,
  Cable,
  PcCase,
  HeartPlus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

function AccessoriesPage() {
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  const categories = [
    { name: "Tất cả", icon: null },
    { name: "Ốp lưng", icon: <PcCase size={16} /> },
    { name: "Cường lực", icon: <ShieldCheck size={16} /> },
    { name: "Củ sạc", icon: <Zap size={16} /> },
    { name: "Cáp sạc", icon: <Cable size={16} /> },
    { name: "Dán lưng", icon: <SquarePercent size={16} /> }
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
          "http://localhost:5000/api/products?productType=accessory"
        );

        const accessories = data.filter(
          (p) => p.productType === "accessory"
        );

        setProducts(accessories);
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Không thể tải sản phẩm phụ kiện");
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

  /* ================= NORMALIZE ================= */

  const normalizeText = (text) => {
    if (!text) return "";

    return text
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const getFirstTwoWords = (text) => {
    const normalized = normalizeText(text);
    if (!normalized) return "";

    const words = normalized.split(" ");
    return words.slice(0, 2).join(" ");
  };

  /* ================= HELPERS ================= */

  const formatPrice = (price) =>
    price?.toLocaleString("vi-VN") + "₫";

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

  /* ================= GET BRANDS ================= */

  const brands = useMemo(() => {
    return [
      ...new Set(products.map((p) => p.brand).filter(Boolean))
    ];
  }, [products]);

  /* ================= FILTER LOGIC ================= */

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    /* 1️⃣ CATEGORY – SO KHỚP 2 TỪ ĐẦU */
    if (activeCategory !== "Tất cả") {
      const categoryKey = getFirstTwoWords(activeCategory);

      filtered = filtered.filter((item) => {
        const rawCategory =
          item.categoryId?.name || item.categoryId;

        const productKey =
          getFirstTwoWords(rawCategory);

        return productKey === categoryKey;
      });
    }

    /* 2️⃣ PRICE */
    if (priceRange !== "all") {
      filtered = filtered.filter((product) => {
        const price = getPricingInfo(product).finalPrice;

        if (priceRange === "under100")
          return price < 100000;

        if (priceRange === "100to300")
          return price >= 100000 && price <= 300000;

        if (priceRange === "above300")
          return price > 300000;

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
    <div className="accessories-page">
      <Header />

      <div className="accessories-container">
        <div className="accessories-header">
          <h1>Phụ kiện Công nghệ</h1>
          <p>Tìm thấy {filteredProducts.length} sản phẩm</p>
        </div>

        <div className="accessories-content">
          {/* SIDEBAR */}
          <aside className="accessories-sidebar">
            <h3>
              <Filter size={18} /> Bộ lọc
            </h3>

            {/* CATEGORY */}
            <div className="filter-group">
              <h4>Danh mục</h4>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  className={
                    activeCategory === cat.name
                      ? "category-btn active"
                      : "category-btn"
                  }
                  onClick={() =>
                    setActiveCategory(cat.name)
                  }
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            {/* PRICE */}
            <div className="filter-group">
              <h4>Khoảng giá</h4>
              <select
                value={priceRange}
                onChange={(e) =>
                  setPriceRange(e.target.value)
                }
              >
                <option value="all">Tất cả</option>
                <option value="under100">Dưới 100.000₫</option>
                <option value="100to300">
                  100.000₫ - 300.000₫
                </option>
                <option value="above300">
                  Trên 300.000₫
                </option>
              </select>
            </div>

            {/* RATING */}
            <div className="filter-group">
              <h4>Đánh giá</h4>
              <select
                value={ratingFilter}
                onChange={(e) =>
                  setRatingFilter(e.target.value)
                }
              >
                <option value="all">Tất cả</option>
                <option value="4">4★ trở lên</option>
                <option value="3">3★ trở lên</option>
              </select>
            </div>

            {/* BRAND */}
            <div className="filter-group">
              <h4>Hãng</h4>
              <select
                value={brandFilter}
                onChange={(e) =>
                  setBrandFilter(e.target.value)
                }
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
            <div className="filter-group">
              <h4>Sắp xếp</h4>
              <select
                value={sortOption}
                onChange={(e) =>
                  setSortOption(e.target.value)
                }
              >
                <option value="default">Mặc định</option>
                <option value="priceAsc">
                  Giá tăng dần
                </option>
                <option value="priceDesc">
                  Giá giảm dần
                </option>
                <option value="rating">
                  Đánh giá cao nhất
                </option>
              </select>
            </div>

            <button
              className="reset-btn"
              onClick={resetFilters}
            >
              Reset bộ lọc
            </button>
          </aside>

          {/* PRODUCTS */}
          <section className="accessories-products">
            {loading && <div>Đang tải...</div>}
            {error && <div>{error}</div>}

            {!loading && !error && (
              <div className="product-grid">
                {currentProducts.map((product) => {
                  const { basePrice, finalPrice, discountPercent } = getPricingInfo(product);
                  const hasDiscount = finalPrice < basePrice;

                  const displayImage =
                    product.colorImages?.find(
                      (img) => img.isDefault
                    )?.imageUrl ||
                    product.colorImages?.[0]
                      ?.imageUrl ||
                    "/no-image.png";

                  return (
                    <div
                      key={product._id}
                      className="product-card"
                    >
                      <Link
                        to={`/product/${product.slug || product._id}`}
                        className="product-link"
                      >
                        {hasDiscount && discountPercent > 0 && (
                          <span className="product-tag">
                            -{discountPercent}%
                          </span>
                        )}

                        <div className="product-image">
                          <button
                            className={`wishlist-btn ${favoriteIds.has(product._id) ? "liked" : ""}`}
                            onClick={(e) => handleToggleFavorite(e, product._id)}
                            title={favoriteIds.has(product._id) ? "Bỏ yêu thích" : "Yêu thích"}
                          >
                            <HeartPlus size={18} fill="none" stroke={favoriteIds.has(product._id) ? "#ef4444" : "#6b7280"} />
                          </button>
                          <img
                            src={displayImage}
                            alt={product.name}
                          />
                        </div>

                        <h3>{product.name}</h3>

                        <div className="product-highlights-small" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '5px 0' }}>
                          {product.highlights?.map((text, idx) => (
                            <span key={idx} style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px', padding: '4px 8px', borderRadius: '4px' }}>{text}</span>
                          ))}
                        </div>

                        <div className="product-price">
                          {formatPrice(finalPrice)}
                        </div>
                      </Link>

                      <button className="add-cart">
                        <ShoppingCart size={16} />
                        Thêm vào giỏ
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading &&
              filteredProducts.length === 0 && (
                <div className="no-products">
                  Không tìm thấy sản phẩm.
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

export default AccessoriesPage;