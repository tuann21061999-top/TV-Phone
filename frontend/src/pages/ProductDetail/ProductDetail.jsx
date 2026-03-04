import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ProductReview from "../../components/Review/ProductReview";
import { toast } from "sonner";
import {
  Cpu,
  ChevronRight,
  ShoppingCart
} from "lucide-react";
import "./ProductDetail.css";

function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedMem, setSelectedMem] = useState("");
  const [selectedCondition, setSelectedCondition] = useState(""); // ✅ thêm

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
      } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  /* ==============================
     ✅ Kiểm tra sản phẩm có cần chọn RAM/ROM không
     (device = điện thoại → cần, accessory/electronic → không cần)
  ============================== */
  const needsMemorySelection = useMemo(() => {
    if (!product) return true; // Mặc định cần
    return product.productType === "device";
  }, [product]);

  /* ==============================
     1️⃣ Ảnh chính
  ============================== */
  const mainImage = useMemo(() => {
    if (!product) return "";

    if (selectedColor) {
      const colorObj = product.colorImages.find(
        c => c.colorName === selectedColor
      );
      return colorObj?.imageUrl || "";
    }

    const defaultColor = product.colorImages.find(c => c.isDefault);
    return defaultColor?.imageUrl || product.colorImages[0]?.imageUrl;
  }, [product, selectedColor]);

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
        v.isActive &&
        v.quantity > 0
    );
  }, [product, selectedColor, selectedMem, needsMemorySelection]);

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
      v => v.isActive && v.quantity > 0
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
  }, [product, selectedColor, selectedMem, needsMemorySelection]);

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
  const priceDisplay = () => {
    if (!needsMemorySelection) {
      // Phụ kiện/Electronic: chỉ cần chọn color
      if (!selectedColor) return "Vui lòng chọn màu sắc";
      return currentVariant
        ? currentVariant.price.toLocaleString() + "đ"
        : "Hết hàng";
    }
    // Device: cần chọn cả color + RAM/ROM
    if (!selectedColor || !selectedMem) return "Vui lòng chọn cấu hình";
    if (product.condition === "used" && !selectedCondition) return "Vui lòng chọn tình trạng";
    return currentVariant
      ? currentVariant.price.toLocaleString() + "đ"
      : "Hết hàng";
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
          </div>

          {/* INFO */}
          <div className="product-info-panel">
            <h1>{product.name}</h1>

            <div className="price-display">
              <span className="current-price">
                {priceDisplay()}
              </span>
            </div>

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
            {product.condition === "used" &&
              product.conditionLevel &&
              product.conditionLevel.length > 0 && (
                <div className="selection-group">
                  <label>Tình trạng:</label>
                  <div className="options-grid">
                    {product.conditionLevel.map(level => (
                      <button
                        key={level}
                        className={`opt-btn
                          ${selectedCondition === level ? "active" : ""}
                        `}
                        onClick={() =>
                          setSelectedCondition(
                            selectedCondition === level ? "" : level
                          )
                        }
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
                    price: currentVariant.price,
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
            </div>
          </div>
        </div>
      </div>

      {/* THÔNG SỐ KỸ THUẬT */}
      <div className="specs-section">
        <h3 className="specs-title">
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
              Chưa có thông số kỹ thuật
            </div>
          )}
        </div>
      </div>
      <ProductReview productId={product._id} />
      <Footer />
    </div>
  );
}

export default ProductDetail;