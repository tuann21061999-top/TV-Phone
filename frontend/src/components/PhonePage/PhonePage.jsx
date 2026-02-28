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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";

function PhonePage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedStorages, setSelectedStorages] = useState([]);
  const [batteryRange, setBatteryRange] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Gọi API chỉ lấy thiết bị di động
        const res = await axios.get(
          "http://localhost:5000/api/products?productType=device"
        );
        
        // Đảm bảo chỉ lấy các sản phẩm có productType là device (double-check)
        const devices = res.data.filter(p => p.productType === "device");
        setProducts(devices);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /* ================= HELPER FUNCTIONS ================= */
  const formatPrice = (price) =>
    price?.toLocaleString("vi-VN") + "₫";

  const getLowestPrice = (product) => {
    if (!product.variants?.length) return 0;
    return Math.min(...product.variants.map((v) => v.price));
  };

  const getFinalPrice = (product) => {
    const basePrice = getLowestPrice(product);
    if (!product.promotion?.discountPercent) return basePrice;

    const now = new Date();
    const start = new Date(product.promotion.startDate);
    const end = new Date(product.promotion.endDate);

    if (now >= start && now <= end) {
      return basePrice - (basePrice * product.promotion.discountPercent) / 100;
    }
    return basePrice;
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
              <Filter size={18} />
              <h3>Bộ lọc</h3>
            </div>

            <div className="filter-group">
              <h3>Thương hiệu</h3>
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

            <div className="filter-group">
              <h3>Bộ nhớ trong</h3>
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

            <div className="filter-group">
              <h3>Dung lượng Pin</h3>
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

            <button
              className="reset-filter"
              onClick={() => {
                setSelectedBrands([]);
                setSelectedStorages([]);
                setBatteryRange("all");
              }}
            >
              <RotateCcw size={14} />
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
                  const base = getLowestPrice(product);
                  const final = getFinalPrice(product);
                  const isDiscount = final < base;
                  
                  // Lấy ảnh mặc định từ colorImages theo Schema mới
                  const displayImage = product.colorImages?.find(img => img.isDefault)?.imageUrl 
                                      || product.colorImages?.[0]?.imageUrl 
                                      || "/no-image.png";

                  return (
                    <div key={product._id} className="product-card">
                      {/* Tags: Featured hoặc Condition */}
                      <div className="product-tags">
                        {product.isFeatured && <span className="tag-hot">HOT</span>}
                        
                      </div>

                      <div
                        className="product-image"
                        onClick={() => navigate(`/product/${product.slug || product._id}`)}
                      >
                        <img src={displayImage} alt={product.name} />
                      </div>

                      <h3 onClick={() => navigate(`/product/${product.slug || product._id}`)}>
                        {product.name}
                      </h3>

                      <div className="product-highlights">
                        {product.highlights?.slice(0, 2).map((text, idx) => (
                          <span key={idx}>{text}</span>
                        ))}
                      </div>

                      <div className="product-rating">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < Math.round(product.averageRating || 0) ? "gold" : "none"}
                            stroke="gold"
                          />
                        ))}
                        <span>({product.averageRating || 0})</span>
                      </div>

                      <div className="product-price">
                        {isDiscount ? (
                          <>
                            <span className="old">{formatPrice(base)}</span>
                            <span className="new">{formatPrice(final)}</span>
                          </>
                        ) : (
                          <span className="new">{formatPrice(base)}</span>
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

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={currentPage === i + 1 ? "active" : ""}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
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