import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import axios from "axios";
import "./ElectronicPage.css";
import {
  Star,
  ShoppingCart,
  Filter,
  Headphones,
  BatteryPlus,
  Watch,
  Fan
} from "lucide-react";

function ElectronicPage() {
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
    { name: "Tai nghe", icon: <Headphones size={16} /> },
    { name: "Sạc dự phòng", icon: <BatteryPlus size={16} /> },
    { name: "Đồng hồ thông minh", icon: <Watch size={16} /> },
    { name: "Quạt tản nhiệt", icon: <Fan size={16} /> }
  ];

  /* ================= FETCH ================= */

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          "http://localhost:5000/api/products?type=electronic"
        );
        setProducts(data);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Không thể tải sản phẩm");
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
    return normalized.split(" ").slice(0, 2).join(" ");
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

    const isPromoActive =
      product.promotion?.discountPercent > 0 &&
      new Date(product.promotion.startDate) <= new Date() &&
      new Date(product.promotion.endDate) >= new Date();

    if (isPromoActive) {
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

    /* 1️⃣ CATEGORY */
    if (activeCategory !== "Tất cả") {
      const categoryKey = getFirstTwoWords(activeCategory);

      filtered = filtered.filter((product) => {
        const productKey = getFirstTwoWords(product.name);
        return productKey === categoryKey;
      });
    }

    /* 2️⃣ PRICE */
    if (priceRange !== "all") {
      filtered = filtered.filter((product) => {
        const price = getFinalPrice(product);

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
    <div className="electronics-page">
      <Header />

      <div className="electronics-container">
        <div className="electronics-header">
          <h1>Đồ điện tử</h1>
          <p>Tìm thấy {filteredProducts.length} sản phẩm</p>
        </div>

        <div className="electronics-content">
          <aside className="electronics-sidebar">
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
                <option value="under500">
                  Dưới 500.000₫
                </option>
                <option value="500to1m">
                  500.000₫ - 1.000.000₫
                </option>
                <option value="above1m">
                  Trên 1.000.000₫
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
          <section className="electronics-products">
            {loading && <div>Đang tải...</div>}
            {error && <div>{error}</div>}

            {!loading && !error && (
              <div className="product-grid">
                {filteredProducts.map((product) => {
                  const finalPrice =
                    getFinalPrice(product);

                  return (
                    <div
                      key={product._id}
                      className="product-card"
                    >
                      <Link
                        to={`/product/${product.slug || product._id}`}
                        className="product-link"
                      >
                        <div className="product-image">
                          <img
                            src={
                              product.images?.[0] ||
                              "/no-image.png"
                            }
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
                  Không tìm thấy sản phẩm phù hợp.
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