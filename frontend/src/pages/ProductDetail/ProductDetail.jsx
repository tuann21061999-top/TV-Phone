import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ProductReview from "../../components/Review/ProductReview";
import { toast } from "sonner";
import {
  Cpu,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  HeartPlus,
  ShieldCheck,
  RefreshCcw,
  Truck,
  CreditCard,
  Wrench,
  HeadphonesIcon,
  ThumbsUp,
  PackageCheck,
  FileText
} from "lucide-react";
import "./ProductDetail.css";
import "../SpecDetail/SpecDetail.css"; // Dùng chung CSS cho sticky header

function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedMem, setSelectedMem] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeImage, setActiveImage] = useState(null);

  const thumbnailsRef = useRef(null);

  const scrollThumbnails = (direction) => {
    if (thumbnailsRef.current) {
      const scrollAmount = direction === "left" ? -210 : 210; // Scroll width roughly equal to 3 images
      thumbnailsRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:5000/api/products/${slug}`
        );
        const data = res.data.data || res.data;
        setProduct(data);

        // reset lựa chọn
        setSelectedColor("");
        setSelectedMem("");
        setSelectedCondition("");
        setActiveImage(null);

        // Ghi nhận lịch sử xem sản phẩm nếu user đã đăng nhập
        const token = localStorage.getItem("token");
        if (token && data && data._id) {
          axios.post(
            "http://localhost:5000/api/view-history/record",
            { productId: data._id, productName: data.name },
            { headers: { Authorization: `Bearer ${token}` } }
          ).catch(err => console.error("Lỗi lưu lịch sử xem:", err));
        }
      } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // Fetch trạng thái yêu thích của sản phẩm hiện tại
  useEffect(() => {
    if (!product) return;
    const token = localStorage.getItem("token");
    if (token) {
      axios.get("http://localhost:5000/api/favorites", {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        const favIds = res.data.map(p => p._id);
        setIsFavorited(favIds.includes(product._id));
      }).catch(() => { });
    }
  }, [product]);

  const handleToggleFavorite = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning("Vui lòng đăng nhập để sử dụng tính năng yêu thích!");
      navigate("/login");
      return;
    }
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/favorites/toggle",
        { productId: product._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsFavorited(data.isFavorited);
      toast.success(data.message);
    } catch {
      toast.error("Lỗi khi thực hiện yêu thích!");
    }
  };

  /* ==============================
     ✅ Kiểm tra sản phẩm có cần chọn RAM/ROM không
     (device = điện thoại → cần, accessory/electronic → không cần)
  ============================== */
  const needsMemorySelection = useMemo(() => {
    if (!product) return true; // Mặc định cần
    return product.productType === "device";
  }, [product]);

  // Khi đổi màu sắc, reset activeImage về null để hiện ảnh màu
  useEffect(() => {
    setActiveImage(null);
  }, [selectedColor]);

  /* ==============================
     1️⃣ Ảnh chính
  ============================== */
  const mainImage = useMemo(() => {
    if (activeImage) return activeImage;
    if (!product) return "";

    if (selectedColor) {
      const colorObj = product.colorImages.find(
        c => c.colorName === selectedColor
      );
      return colorObj?.imageUrl || "";
    }

    const defaultColor = product.colorImages.find(c => c.isDefault);
    return defaultColor?.imageUrl || product.colorImages[0]?.imageUrl;
  }, [product, selectedColor, activeImage]);

  /* ==============================
     2️⃣ Variant hiện tại
     ✅ Cập nhật logic: phụ kiện/electronic chỉ cần chọn màu
  ============================== */
  const currentVariant = useMemo(() => {
    if (!product || !selectedColor) return null;

    // Phụ kiện / Đồ điện tử: chỉ cần chọn MÀU → tìm variant theo color
    if (!needsMemorySelection) {
      return product.variants.find(
        v => v.colorName === selectedColor && v.isActive && v.quantity > 0
      );
    }

    // Điện thoại: cần chọn cả MÀU + RAM/ROM
    if (!selectedMem) return null;

    const [size, storage] = selectedMem
      .split("/")
      .map(s => s.trim());

    return product.variants.find(
      v =>
        v.colorName === selectedColor &&
        v.size.trim() === size &&
        v.storage.trim() === storage &&
        (product.condition !== "used" || v.condition === selectedCondition) &&
        v.isActive &&
        v.quantity > 0
    );
  }, [product, selectedColor, selectedMem, selectedCondition, needsMemorySelection]);

  /* ==============================
     3️⃣ Filter 2 chiều
     ✅ Cập nhật: chỉ tạo memory options cho device (phone)
  ============================== */
  const filterOptions = useMemo(() => {
    if (!product)
      return {
        allColors: [],
        allMemories: [],
        validColors: [],
        validMemories: []
      };

    const validVariants = product.variants.filter(
      v => v.isActive && v.quantity > 0 &&
        (product.condition !== "used" || !selectedCondition || v.condition === selectedCondition)
    );

    const allColors = product.colorImages.map(c => c.colorName);

    // Phụ kiện/Electronic: không cần memory options
    if (!needsMemorySelection) {
      const validColors = validVariants.map(v => v.colorName);
      return {
        allColors,
        allMemories: [],
        validColors: [...new Set(validColors)],
        validMemories: []
      };
    }

    // Device (phone): logic filter 2 chiều bình thường
    const allMemories = [
      ...new Set(validVariants.map(v => `${v.size}/${v.storage}`))
    ];

    if (!selectedColor && !selectedMem) {
      return {
        allColors,
        allMemories,
        validColors: allColors,
        validMemories: allMemories
      };
    }

    if (selectedColor && !selectedMem) {
      const validMemories = validVariants
        .filter(v => v.colorName === selectedColor)
        .map(v => `${v.size}/${v.storage}`);

      return {
        allColors,
        allMemories,
        validColors: allColors,
        validMemories
      };
    }

    if (!selectedColor && selectedMem) {
      const validColors = validVariants
        .filter(v => `${v.size}/${v.storage}` === selectedMem)
        .map(v => v.colorName);

      return {
        allColors,
        allMemories,
        validColors,
        validMemories: allMemories
      };
    }

    const validMemories = validVariants
      .filter(v => v.colorName === selectedColor)
      .map(v => `${v.size}/${v.storage}`);

    const validColors = validVariants
      .filter(v => `${v.size}/${v.storage}` === selectedMem)
      .map(v => v.colorName);

    return {
      allColors,
      allMemories,
      validColors,
      validMemories
    };
  }, [product, selectedColor, selectedMem, selectedCondition, needsMemorySelection]);

  if (loading) return <div className="loading-state">Đang tải...</div>;
  if (!product)
    return <div className="error-state">Không tìm thấy sản phẩm</div>;

  /* ==============================
     ✅ canBuy: cho phụ kiện/electronic, chỉ cần chọn color
  ============================== */
  const canBuy = needsMemorySelection
    ? currentVariant && (product.condition !== "used" || selectedCondition)
    : currentVariant && (product.condition !== "used" || selectedCondition);

  /* ==============================
     ✅ Hiển thị giá: phụ kiện chỉ cần chọn color
  ============================== */
  const getActivePrice = () => {
    if (!currentVariant) return null;
    const now = new Date();
    if (
      currentVariant.discountPrice != null &&
      currentVariant.promotionEnd &&
      new Date(currentVariant.promotionEnd) > now
    ) {
      return {
        base: currentVariant.price,
        sale: currentVariant.discountPrice,
        isDiscount: true
      };
    }
    return { base: currentVariant.price, sale: currentVariant.price, isDiscount: false };
  };

  const priceData = getActivePrice();

  const priceDisplay = () => {
    if (!needsMemorySelection) {
      if (!selectedColor) return "Vui lòng chọn màu sắc";
      if (!currentVariant) return "Hết hàng";
    } else {
      if (!selectedColor || !selectedMem) return "Vui lòng chọn cấu hình";
      if (product.condition === "used" && !selectedCondition) return "Vui lòng chọn tình trạng";
      if (!currentVariant) return "Hết hàng";
    }

    if (priceData.isDiscount) {
      return (
        <div className="price-wrapper">
          <span className="current-price text-danger">{priceData.sale.toLocaleString()}đ</span>
          <span className="old-price-detail">{priceData.base.toLocaleString()}đ</span>
        </div>
      );
    }
    return <span className="current-price">{priceData.base.toLocaleString()}đ</span>;
  };

  const handleAddToCart = async () => {
    if (!canBuy) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để mua hàng!");
        return;
      }
      if (!currentVariant?._id) {
        toast.error("Cấu hình không hợp lệ!");
        return;
      }
      const cartData = {
        productId: product._id.toString(),
        variantId: currentVariant._id.toString(),
        quantity: 1,
        condition: product.condition || "new",
        conditionLevel: selectedCondition || null
      };
      const res = await axios.post(
        "http://localhost:5000/api/cart/add",
        cartData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.status === 200) {
        toast.success("Đã thêm vào giỏ hàng thành công!");
        setTimeout(() => navigate("/cart"), 1000);
      }
    } catch (error) {
      console.error("Lỗi thêm vào giỏ:", error);
      toast.error(error.response?.data?.message || "Không thể thêm vào giỏ hàng");
    }
  };
  return (
    <div className="product-detail-page">
      <Header />

      {/* STICKY TOP HEADER BAR */}
      {product && (
        <div className="spec-sticky-header">
          <div className="spec-container sticky-content">
            <div className="sticky-product-info">
              <img src={mainImage} alt={product.name} />
              <div>
                <h2 className="sticky-title">{product.name}</h2>
                <span className="sticky-price">{priceData?.base?.toLocaleString() || 0}đ</span>
              </div>
            </div>
            <div className="sticky-nav">
              <span className="nav-link active">Tổng quan</span>
              <Link to={`/product/${slug}/specs`} className="nav-link">Thông số kỹ thuật</Link>
              <Link to={`/product/${slug}/reviews`} className="nav-link">Đánh giá</Link>
            </div>
          </div>
        </div>
      )}

      <div className="product-detail-container">
        <nav className="breadcrumb">
          <Link to="/">Trang chủ</Link> <ChevronRight size={14} />
          <span>{product.brand}</span> <ChevronRight size={14} />
          <span className="current">{product.name}</span>
        </nav>

        <div className="product-top">
          {/* IMAGE */}
          <div className="product-images-gallery">
            <div className="main-image-container">
              <img
                src={mainImage}
                alt={product.name}
                className="main-image"
              />
            </div>
            {/* THUMBNAILS - DETAIL IMAGES */}
            {product.detailImages && product.detailImages.length > 0 && (
              <div className="thumbnail-slider-wrapper">
                {product.detailImages.length > 4 && (
                  <button className="slider-btn" onClick={() => scrollThumbnails('left')}>
                    <ChevronLeft size={32} strokeWidth={1} />
                  </button>
                )}

                <div className="detail-thumbnails" ref={thumbnailsRef}>
                  {product.detailImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '4px',
                        border: activeImage === imgUrl ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
                        cursor: 'pointer',
                        flexShrink: 0,
                        width: '75px',
                        height: '75px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#fff'
                      }}
                      onClick={() => setActiveImage(imgUrl)}
                    >
                      <img
                        src={imgUrl}
                        alt={`${product.name} chi tiết ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain' // Contain to prevent cropping like in the screenshot
                        }}
                      />
                    </div>
                  ))}
                </div>

                {product.detailImages.length > 4 && (
                  <button className="slider-btn" onClick={() => scrollThumbnails('right')}>
                    <ChevronRight size={32} strokeWidth={1} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="product-info-panel">
            <h1>{product.name}</h1>

            <div className="price-display">
              {priceDisplay()}
            </div>

            {/* HIGHLIGHTS */}
            <div className="product-highlights-detail">
              {product.highlights?.map((h, i) => (
                <div key={i} className="highlight-item-detail">✓ {h}</div>
              ))}
            </div>

            <div className="config-and-commitments">
              <div className="config-section">
                {/* ✅ CONDITION LEVEL (Máy cũ) */}
                {product.condition === "used" &&
                  product.conditionLevel &&
                  product.conditionLevel.length > 0 && (
                    <div className="selection-group">
                      <label>Tình trạng:</label>
                      <div className="options-grid">
                        {product.conditionLevel.map(level => {
                          const validConds = product.variants.filter(v => v.isActive && v.quantity > 0).map(v => v.condition);
                          const isValid = validConds.includes(level);
                          return (
                            <button
                              key={level}
                              className={`opt-btn
                                ${selectedCondition === level ? "active" : ""}
                                ${!isValid ? "disabled" : ""}
                              `}
                              onClick={() =>
                                isValid && setSelectedCondition(
                                  selectedCondition === level ? "" : level
                                )
                              }
                            >
                              {level}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* RAM/ROM — Chỉ hiển thị cho DEVICE (điện thoại) */}
                {needsMemorySelection && (
                  <div className="selection-group">
                    <label>RAM/ROM:</label>
                    <div className="options-grid">
                      {filterOptions.allMemories.map(mem => {
                        const isValid =
                          filterOptions.validMemories.includes(mem);

                        return (
                          <button
                            key={mem}
                            className={`opt-btn
                              ${selectedMem === mem ? "active" : ""}
                              ${!isValid ? "disabled" : ""}
                            `}
                            onClick={() =>
                              setSelectedMem(
                                selectedMem === mem ? "" : mem
                              )
                            }
                          >
                            {mem}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* COLOR */}
                <div className="selection-group">
                  <label>Màu sắc:</label>
                  <div className="options-grid">
                    {filterOptions.allColors.map(color => {
                      const isValid =
                        filterOptions.validColors.includes(color);

                      return (
                        <button
                          key={color}
                          className={`opt-btn
                            ${selectedColor === color ? "active" : ""}
                            ${!isValid ? "disabled" : ""}
                          `}
                          onClick={() =>
                            setSelectedColor(
                              selectedColor === color ? "" : color
                            )
                          }
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ✅ CONDITION LEVEL (Máy cũ) */}
              </div>

              {/* COMMITMENTS SECTION */}
              <div className="commitments-section">
                {product.productType === "device" && (
                  <>
                    <div className="commitment-item">
                      <ShieldCheck size={24} />
                      <span>Bảo hành chính hãng 12 tháng</span>
                    </div>
                    <div className="commitment-item">
                      <RefreshCcw size={24} />
                      <span>1 đổi 1 trong 30 ngày nếu có lỗi NSX</span>
                    </div>
                    <div className="commitment-item">
                      <Truck size={24} />
                      <span>Giao hàng siêu tốc trong 2h</span>
                    </div>
                    <div className="commitment-item">
                      <CreditCard size={24} />
                      <span>Trả góp 0% qua thẻ tín dụng</span>
                    </div>
                  </>
                )}
                {product.productType === "electronic" && (
                  <>
                    <div className="commitment-item">
                      <ShieldCheck size={24} />
                      <span>Bảo hành chính hãng 24 tháng</span>
                    </div>
                    <div className="commitment-item">
                      <Wrench size={24} />
                      <span>Miễn phí lắp đặt tại nhà</span>
                    </div>
                    <div className="commitment-item">
                      <HeadphonesIcon size={24} />
                      <span>Hỗ trợ kỹ thuật 24/7</span>
                    </div>
                    <div className="commitment-item">
                      <RefreshCcw size={24} />
                      <span>Đổi trả tận nhà trong 7 ngày</span>
                    </div>
                  </>
                )}
                {product.productType === "accessory" && (
                  <>
                    <div className="commitment-item">
                      <RefreshCcw size={24} />
                      <span>Bảo hành 6 tháng lỗi 1 đổi 1</span>
                    </div>
                    <div className="commitment-item">
                      <ThumbsUp size={24} />
                      <span>Tương thích hoàn toàn với thiết bị</span>
                    </div>
                    <div className="commitment-item">
                      <Truck size={24} />
                      <span>Giao hàng toàn quốc siêu tốc</span>
                    </div>
                    <div className="commitment-item">
                      <PackageCheck size={24} />
                      <span>Kiểm tra hàng trước khi thanh toán</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="action-buttons">
              <button
                className="buy-now"
                disabled={!canBuy}
                onClick={() => {
                  // KHI BẤM MUA NGAY, ĐÓNG GÓI ĐẦY ĐỦ DỮ LIỆU CỦA VARIANT
                  const checkoutItem = {
                    productId: product._id,
                    variantId: currentVariant._id,
                    name: product.name,
                    image: mainImage,
                    price: priceData.sale,
                    quantity: 1,

                    // THÊM ĐẦY ĐỦ THUỘC TÍNH NÀY CHO CHECKOUT PAGE
                    color: selectedColor, // Mảng màu
                    size: currentVariant.size, // BẮT BUỘC PHẢI CÓ CHO ĐIỆN THOẠI (RAM) VÀ PHỤ KIỆN
                    storage: currentVariant.storage, // BẮT BUỘC PHẢI CÓ CHO ĐIỆN THOẠI (ROM)

                    condition: product.condition || "new",
                    conditionLevel: selectedCondition || null
                  };

                  navigate('/checkout', {
                    state: {
                      isBuyNow: true,
                      items: [checkoutItem]
                    }
                  });
                }}
              >
                MUA NGAY
              </button>
              <button
                className="add-to-cart" onClick={handleAddToCart}
                disabled={!canBuy}
              >
                <ShoppingCart size={20} /> Thêm vào giỏ
              </button>
              <button
                className={`btn-favorite-detail ${isFavorited ? "liked" : ""}`}
                onClick={handleToggleFavorite}
                title={isFavorited ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
              >
                <HeartPlus size={20} fill="none" stroke={isFavorited ? "#ef4444" : "#6b7280"} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* THÔNG TIN CHI TIẾT & THÔNG SỐ KỸ THUẬT */}
      <div className="product-bottom-details">
        {/* MÔ TẢ SẢN PHẨM */}
        <div className="description-section">
          <h3 className="section-title">
            <FileText size={18} /> Đặc điểm nổi bật
          </h3>
          <div className="description-content">
            {product.description ? (
              <div className="desc-text" style={{ whiteSpace: 'pre-line' }}>
                {product.description}
              </div>
            ) : (
              <div className="no-info">chưa có thông tin phù hợp</div>
            )}
          </div>
        </div>

        {/* THÔNG SỐ KỸ THUẬT */}
        <div className="specs-section">
          <h3 className="section-title">
            <Cpu size={18} /> Thông số kỹ thuật
          </h3>

          <div className="specs-table">
            {product.specs && Object.keys(product.specs).length > 0 ? (
              Object.entries(product.specs).map(([key, value]) => (
                <div className="spec-row" key={key}>
                  <span className="spec-key">{key}</span>
                  <span className="spec-value">{value}</span>
                </div>
              ))
            ) : (
              <div className="no-specs">
                chưa có thông tin phù hợp
              </div>
            )}
          </div>

          {/* Nút xem chi tiết thông số */}
          {(product.detailedSpecs && 
           Object.keys(product.detailedSpecs).length > 0 && 
           Object.values(product.detailedSpecs).some(val => val !== null && val !== "" && (typeof val !== 'object' || Object.keys(val).length > 0))) || 
           (product.specs && Object.keys(product.specs).length > 0) ? (
            <div className="view-detailed-specs-action" style={{ marginTop: '20px', textAlign: 'center' }}>
              <Link to={`/product/${product.slug || product._id}/specs`} className="btn-view-spec-detail">
                <Cpu size={18} /> Xem cấu hình chi tiết
              </Link>
            </div>
          ) : null}
        </div>
      </div>
      <Footer />
    </div >
  );
}

export default ProductDetail;