import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import axios from "axios";
import "./AccessoryPage.css";
import {
  Star,
  ShoppingCart,
  Filter,
  Zap,
  ShieldCheck,
  SquarePercent,
  Cable,
  PcCase
} from "lucide-react";

function AccessoriesPage() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [priceRange, setPriceRange] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [sortOption, setSortOption] = useState("default");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, []);

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

  const getLowestPrice = (product) => {
    if (!product.variants?.length) return 0;
    return Math.min(...product.variants.map((v) => v.price));
  };

  const getFinalPrice = (product) => {
    const basePrice = getLowestPrice(product);

    if (!product.promotion?.discountPercent)
      return basePrice;

    const now = new Date();
    const start = new Date(product.promotion.startDate);
    const end = new Date(product.promotion.endDate);

    if (now >= start && now <= end) {
      return (
        basePrice -
        (basePrice * product.promotion.discountPercent) / 100
      );
    }

    return basePrice;
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
        const price = getFinalPrice(product);

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
          getFinalPrice(a) - getFinalPrice(b)
      );
    }

    if (sortOption === "priceDesc") {
      filtered.sort(
        (a, b) =>
          getFinalPrice(b) - getFinalPrice(a)
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
                {filteredProducts.map((product) => {
                  const basePrice =
                    getLowestPrice(product);
                  const finalPrice =
                    getFinalPrice(product);
                  const hasDiscount =
                    finalPrice < basePrice;

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
                        {hasDiscount && (
                          <span className="product-tag">
                            -{product.promotion.discountPercent}%
                          </span>
                        )}

                        <div className="product-image">
                          <img
                            src={displayImage}
                            alt={product.name}
                          />
                        </div>

                        <h3>{product.name}</h3>

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
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default AccessoriesPage;