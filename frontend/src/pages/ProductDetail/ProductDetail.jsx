import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ProductReview from "../../components/Review/ProductReview";
import ProductCard from "../../components/Product/ProductCard";

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

function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedMem, setSelectedMem] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [favoriteIds, setFavoriteIds] = useState(new Set()); // Lưu mọi ID yêu thích
  const [isFavorited, setIsFavorited] = useState(false); // Lưu riêng cho sản phẩm chính
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
        // Tự động chọn Option đầu tiên có sẵn
        if (data && data.variants && data.variants.length > 0) {
          const firstValidVariant = data.variants.find(v => v.isActive && v.quantity > 0 && (data.condition !== "used" || (data.conditionLevel && v.condition === data.conditionLevel[0])));
          if (firstValidVariant) {
            setSelectedColor(firstValidVariant.colorName || "");

            const needsOpt = data.productType === "device" || data.variants.some(v => v.storage && v.storage.trim() !== "" && v.storage !== "Phiên bản mặc định" && v.storage !== "N/A");
            if (needsOpt) {
              const memStr = firstValidVariant.size ? `${firstValidVariant.size}/${firstValidVariant.storage}` : firstValidVariant.storage;
              setSelectedMem(memStr || "");
            } else {
              setSelectedMem("");
            }

            if (data.condition === "used" && data.conditionLevel?.length > 0) {
              setSelectedCondition(data.conditionLevel[0]);
            }
          } else {
            setSelectedColor("");
            setSelectedMem("");
            setSelectedCondition("");
          }
        } else {
          setSelectedColor("");
          setSelectedMem("");
          setSelectedCondition("");
        }

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
        const favIds = new Set(res.data.map(p => p._id));
        setFavoriteIds(favIds);
        setIsFavorited(favIds.has(product._id));
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
      
      // Update cả UI chính lẫn tập favoriteIds
      setIsFavorited(data.isFavorited);
      setFavoriteIds(prev => {
        const next = new Set(prev);
        data.isFavorited ? next.add(product._id) : next.delete(product._id);
        return next;
      });
      toast.success(data.message);
    } catch {
      toast.error("Lỗi khi thực hiện yêu thích!");
    }
  };

  const handleCardFavoriteToggle = (productId, isLiked) => {
    setFavoriteIds(prev => {
      const next = new Set(prev);
      isLiked ? next.add(productId) : next.delete(productId);
      if (product && productId === product._id) {
        setIsFavorited(isLiked);
      }
      return next;
    });
  };

  /* ==============================
     ✅ Kiểm tra sản phẩm có cần chọn RAM/ROM không
     (device = điện thoại → cần, accessory/electronic → không cần)
  ============================== */
  const needsOptionSelection = useMemo(() => {
    if (!product) return true;
    if (product.productType === "device") return true;
    // Phụ kiện / Điện tử: Cần chọn Option nếu có option tuỳ chỉnh khác mặc định
    return product.variants.some(v => v.storage && v.storage.trim() !== "" && v.storage !== "Phiên bản mặc định" && v.storage !== "N/A");
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
  // 2️⃣ Variant hiện tại
  const currentVariant = useMemo(() => {
    if (!product || !selectedColor) return null;

    if (!needsOptionSelection) {
      return product.variants.find(
        v => v.colorName === selectedColor && v.isActive && v.quantity > 0
      );
    }

    if (!selectedMem) return null;

    let size = "";
    let storage = "";
    if (selectedMem.includes("/")) {
      const parts = selectedMem.split("/");
      size = parts[0].trim();
      storage = parts[1].trim();
    } else {
      storage = selectedMem.trim();
    }

    return product.variants.find(
      v =>
        v.colorName === selectedColor &&
        (size === "" || (v.size || "").trim() === size) &&
        (v.storage || "").trim() === storage &&
        (product.condition !== "used" || v.condition === selectedCondition) &&
        v.isActive &&
        v.quantity > 0
    );
  }, [product, selectedColor, selectedMem, selectedCondition, needsOptionSelection]);

  /* ==============================
     3️⃣ Filter 2 chiều
     ✅ Cập nhật: chỉ tạo memory options cho device (phone)
  ============================== */
  // 3️⃣ Filter 2 chiều
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

    if (!needsOptionSelection) {
      const validColors = validVariants.map(v => v.colorName);
      return {
        allColors,
        allMemories: [],
        validColors: [...new Set(validColors)],
        validMemories: []
      };
    }

    const allMemories = [
      ...new Set(validVariants.map(v => v.size ? `${v.size}/${v.storage}` : v.storage))
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
        .map(v => v.size ? `${v.size}/${v.storage}` : v.storage);

      return {
        allColors,
        allMemories,
        validColors: allColors,
        validMemories
      };
    }

    if (!selectedColor && selectedMem) {
      const validColors = validVariants
        .filter(v => (v.size ? `${v.size}/${v.storage}` : v.storage) === selectedMem)
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
      .map(v => v.size ? `${v.size}/${v.storage}` : v.storage);

    const validColors = validVariants
      .filter(v => (v.size ? `${v.size}/${v.storage}` : v.storage) === selectedMem)
      .map(v => v.colorName);

    return {
      allColors,
      allMemories,
      validColors,
      validMemories
    };
  }, [product, selectedColor, selectedMem, selectedCondition, needsOptionSelection]);

  if (loading) return <div className="flex justify-center items-center py-20 text-slate-500 font-medium animate-pulse">Đang tải...</div>;
  if (!product)
    return <div className="flex justify-center items-center py-20 text-red-500 font-medium">Không tìm thấy sản phẩm</div>;

  const canBuy = needsOptionSelection
    ? currentVariant && (product.condition !== "used" || selectedCondition)
    : currentVariant && (product.condition !== "used" || selectedCondition);

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
    if (!needsOptionSelection) {
      if (!selectedColor) return <span className="text-xl font-bold text-slate-400">Vui lòng chọn màu sắc</span>;
      if (!currentVariant) return <span className="text-xl font-bold text-slate-400">Hết hàng</span>;
    } else {
      if (!selectedColor || !selectedMem) return <span className="text-xl font-bold text-slate-400">Vui lòng chọn phân loại</span>;
      if (product.condition === "used" && !selectedCondition) return <span className="text-xl font-bold text-slate-400">Vui lòng chọn tình trạng</span>;
      if (!currentVariant) return <span className="text-xl font-bold text-slate-400">Hết hàng</span>;
    }

    if (priceData.isDiscount) {
      return (
        <div className="flex items-baseline gap-3">
          <span className="text-3xl lg:text-[32px] font-extrabold text-red-500">{priceData.sale.toLocaleString()}đ</span>
          <span className="text-lg lg:text-[20px] font-medium text-slate-400 line-through">{priceData.base.toLocaleString()}đ</span>
        </div>
      );
    }
    return <span className="text-3xl lg:text-[32px] font-extrabold text-blue-600">{priceData.base.toLocaleString()}đ</span>;
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
    <div className="bg-slate-50 min-h-screen font-sans pb-20">
      <Header />

      {/* TOP HEADER BAR */}
      {product && (
        <div className="hidden md:block z-40 bg-white border-b border-slate-200 shadow-sm transition-all">
          <div className="max-w-[1400px] mx-auto px-10 flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <img src={mainImage} alt={product.name} className="h-10 w-10 object-contain" />
              <div className="flex flex-col">
                <h2 className="m-0 text-sm font-bold text-slate-800 truncate max-w-[200px]">{product.name}</h2>
                <span className="text-xs font-bold text-blue-600">{priceData?.base?.toLocaleString() || 0}đ</span>
              </div>
            </div>
            <div className="flex items-center gap-6 h-full">
              <span className="text-blue-600 font-semibold border-b-2 border-blue-600 h-full flex items-center text-sm cursor-pointer px-2">Tổng quan</span>
              <Link to={`/product/${slug}/specs`} className="text-slate-600 font-medium hover:text-blue-600 h-full flex items-center text-sm no-underline transition-colors px-2">Thông số kỹ thuật chi tiết</Link>
              <Link to={`/product/${slug}/reviews`} className="text-slate-600 font-medium hover:text-blue-600 h-full flex items-center text-sm no-underline transition-colors px-2">Đánh giá</Link>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-[1400px] mx-auto px-5 md:px-10 py-5">
        
        {/* BREADCRUMB */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6 flex-wrap">
          <Link to="/" className="text-slate-500 hover:text-blue-600 transition-colors no-underline">Trang chủ</Link> <ChevronRight size={14} />
          
          {product.productType === "device" && <><Link to="/phones" className="text-slate-500 hover:text-blue-600 transition-colors no-underline">Điện thoại</Link> <ChevronRight size={14} /></>}
          {product.productType === "electronic" && <><Link to="/electronics" className="text-slate-500 hover:text-blue-600 transition-colors no-underline">Đồ điện tử</Link> <ChevronRight size={14} /></>}
          {product.productType === "accessory" && <><Link to="/accessories" className="text-slate-500 hover:text-blue-600 transition-colors no-underline">Phụ kiện</Link> <ChevronRight size={14} /></>}
          
          <Link to={`/${product.productType === "device" ? "phones" : product.productType === "electronic" ? "electronics" : "accessories"}?brand=${encodeURIComponent(product.brand)}`} className="text-slate-500 hover:text-blue-600 transition-colors no-underline">
            {product.brand}
          </Link> <ChevronRight size={14} />
          
          <span className="font-semibold text-slate-800">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* IMAGE GALLERY */}
          <div className="w-full min-w-0">
            <div className="w-full aspect-square bg-white rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden relative">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-contain p-5 md:p-8 transition-transform duration-300 hover:scale-105"
              />
            </div>
            
            {/* THUMBNAILS - DETAIL IMAGES */}
            {product.detailImages && product.detailImages.length > 0 && (
              <div className="flex items-center mt-4 w-full gap-1.5">
                {product.detailImages.length > 4 && (
                  <button className="bg-transparent border-none w-8 h-full flex items-center justify-center cursor-pointer z-10 text-slate-300 hover:text-slate-500 transition-colors shrink-0 p-0" onClick={() => scrollThumbnails('left')}>
                    <ChevronLeft size={32} strokeWidth={1.5} />
                  </button>
                )}

                <div className="flex gap-2.5 py-0.5 overflow-x-auto scroll-smooth flex-1 min-w-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" ref={thumbnailsRef}>
                  {product.detailImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className={`w-[75px] h-[75px] rounded-lg flex items-center justify-center bg-white p-1.5 cursor-pointer shrink-0 transition-colors border ${activeImage === imgUrl ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300'}`}
                      onClick={() => setActiveImage(imgUrl)}
                    >
                      <img
                        src={imgUrl}
                        alt={`${product.name} chi tiết ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>

                {product.detailImages.length > 4 && (
                  <button className="bg-transparent border-none w-8 h-full flex items-center justify-center cursor-pointer z-10 text-slate-300 hover:text-slate-500 transition-colors shrink-0 p-0" onClick={() => scrollThumbnails('right')}>
                    <ChevronRight size={32} strokeWidth={1.5} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* PRODUCT INFO PANEL */}
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-[28px] font-bold text-slate-800 m-0 mb-2 leading-tight">{product.name}</h1>

            <div className="my-5 flex items-baseline gap-4">
              {priceDisplay()}
            </div>

            {/* HIGHLIGHTS */}
            <div className="flex flex-col gap-2.5 my-4 mb-6">
              {product.highlights?.map((h, i) => (
                <div key={i} className="text-sm text-green-600 flex items-start gap-1.5 font-medium leading-snug">
                  <span className="shrink-0">✓</span> {h}
                </div>
              ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-8 mb-8 items-start">
              <div className="flex-[3] w-full">
                {/* ✅ CONDITION LEVEL (Máy cũ) */}
                {product.condition === "used" && product.conditionLevel && product.conditionLevel.length > 0 && (
                    <div className="mb-6">
                      <label className="block font-bold text-slate-700 text-sm mb-2">Tình trạng:</label>
                      <div className="flex flex-wrap gap-2.5">
                        {product.conditionLevel.map(level => {
                          const validConds = product.variants.filter(v => v.isActive && v.quantity > 0).map(v => v.condition);
                          const isValid = validConds.includes(level);
                          return (
                            <button
                              key={level}
                              className={`py-2 px-4 border-[1.5px] rounded-lg font-semibold text-[13px] transition-all duration-200 
                                ${selectedCondition === level ? "border-blue-600 bg-blue-50 text-blue-600" : ""}
                                ${!isValid ? "opacity-40 cursor-not-allowed bg-slate-50 border-dashed border-slate-200 text-slate-500" : ""}
                                ${isValid && selectedCondition !== level ? "border-slate-200 bg-white text-slate-700 hover:border-slate-300 cursor-pointer" : ""}
                              `}
                              onClick={() => isValid && setSelectedCondition(selectedCondition === level ? "" : level)}
                            >
                              {level}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* 🌟 PHIÊN BẢN (SIBLING PRODUCTS) & TÙY CHỌN NỘI BỘ */}
                {product.productType !== "device" && product.siblings && product.siblings.length > 0 ? (
                  <div className="mb-6">
                    <label className="block font-bold text-slate-700 text-sm mb-2">Phân loại:</label>
                    <div className="flex flex-wrap gap-2.5">
                      {/* Current Product Options */}
                      {needsOptionSelection ? filterOptions.allMemories.map(mem => {
                        const isValid = filterOptions.validMemories.includes(mem);
                        return (
                          <button
                            key={`local-${mem}`}
                            className={`py-2 px-4 border-[1.5px] rounded-lg font-semibold text-[13px] transition-all duration-200 
                              ${selectedMem === mem ? "border-blue-600 bg-blue-50 text-blue-600" : ""}
                              ${!isValid ? "opacity-40 cursor-not-allowed bg-slate-50 border-dashed border-slate-200 text-slate-500" : ""}
                              ${isValid && selectedMem !== mem ? "border-slate-200 bg-white text-slate-700 hover:border-slate-300 cursor-pointer" : ""}
                            `}
                            onClick={() => setSelectedMem(selectedMem === mem ? "" : mem)}
                          >
                            {mem}
                          </button>
                        );
                      }) : (
                        <button className="py-2 px-4 border-[1.5px] border-blue-600 bg-blue-50 text-blue-600 rounded-lg font-semibold text-[13px] cursor-pointer">
                          {product.variants?.[0]?.storage && product.variants[0].storage !== "Phiên bản mặc định" ? product.variants[0].storage : "Mặc định"}
                        </button>
                      )}

                      {/* Sibling Options */}
                      {product.siblings.map(sib => {
                        const sibVari = sib.variants || [];
                        const sibOpts = [...new Set(sibVari.map(v => v.size ? `${v.size}/${v.storage}` : v.storage).filter(o => o && o !== "Phiên bản mặc định"))];

                        if (sibOpts.length > 0) {
                          return sibOpts.map((opt, idx) => (
                            <button
                              key={`sib-${sib._id}-${idx}`}
                              className="py-2 px-4 border-[1.5px] border-slate-200 bg-white text-slate-700 rounded-lg font-semibold text-[13px] cursor-pointer transition-all hover:border-slate-300"
                              onClick={() => { setLoading(true); navigate(`/product/${sib.slug}`); }}
                            >
                              {opt}
                            </button>
                          ));
                        } else {
                          return (
                            <button
                              key={`sib-${sib._id}`}
                              className="py-2 px-4 border-[1.5px] border-slate-200 bg-white text-slate-700 rounded-lg font-semibold text-[13px] cursor-pointer transition-all hover:border-slate-300"
                              onClick={() => { setLoading(true); navigate(`/product/${sib.slug}`); }}
                            >
                              {sib.name}
                            </button>
                          );
                        }
                      })}
                    </div>
                  </div>
                ) : (
                  /* TÙY CHỌN (Option nội bộ) thông thường */
                  needsOptionSelection && (
                    <div className="mb-6">
                      <label className="block font-bold text-slate-700 text-sm mb-2">{product.productType === "device" ? "RAM/ROM:" : "Phân loại:"}</label>
                      <div className="flex flex-wrap gap-2.5">
                        {filterOptions.allMemories.map(mem => {
                          const isValid = filterOptions.validMemories.includes(mem);
                          return (
                            <button
                              key={mem}
                              className={`py-2 px-4 border-[1.5px] rounded-lg font-semibold text-[13px] transition-all duration-200 
                                ${selectedMem === mem ? "border-blue-600 bg-blue-50 text-blue-600" : ""}
                                ${!isValid ? "opacity-40 cursor-not-allowed bg-slate-50 border-dashed border-slate-200 text-slate-500" : ""}
                                ${isValid && selectedMem !== mem ? "border-slate-200 bg-white text-slate-700 hover:border-slate-300 cursor-pointer" : ""}
                              `}
                              onClick={() => setSelectedMem(selectedMem === mem ? "" : mem)}
                            >
                              {mem}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )
                )}

                {/* COLOR */}
                <div className="mb-6">
                  <label className="block font-bold text-slate-700 text-sm mb-2">Màu sắc:</label>
                  <div className="flex flex-wrap gap-2.5">
                    {filterOptions.allColors.map(color => {
                      const isValid = filterOptions.validColors.includes(color);
                      return (
                        <button
                          key={color}
                          className={`py-2 px-4 border-[1.5px] rounded-lg font-semibold text-[13px] transition-all duration-200 
                            ${selectedColor === color ? "border-blue-600 bg-blue-50 text-blue-600" : ""}
                            ${!isValid ? "opacity-40 cursor-not-allowed bg-slate-50 border-dashed border-slate-200 text-slate-500" : ""}
                            ${isValid && selectedColor !== color ? "border-slate-200 bg-white text-slate-700 hover:border-slate-300 cursor-pointer" : ""}
                          `}
                          onClick={() => setSelectedColor(selectedColor === color ? "" : color)}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* COMMITMENTS SECTION */}
              <div className="flex-[2] border border-slate-200 rounded-xl p-5 bg-slate-50 flex flex-col gap-4 w-full h-max">
                {product.productType === "device" && (
                  <>
                    <div className="flex items-center gap-3 text-[13.5px] text-slate-700 font-medium"><ShieldCheck size={20} className="text-blue-600 shrink-0" /><span>Bảo hành chính hãng 12 tháng</span></div>
                    <div className="flex items-center gap-3 text-[13.5px] text-slate-700 font-medium"><RefreshCcw size={20} className="text-blue-600 shrink-0" /><span>1 đổi 1 trong 30 ngày nếu có lỗi NSX</span></div>
                    <div className="flex items-center gap-3 text-[13.5px] text-slate-700 font-medium"><Truck size={20} className="text-blue-600 shrink-0" /><span>Giao hàng siêu tốc trong 2h</span></div>
                    <div className="flex items-center gap-3 text-[13.5px] text-slate-700 font-medium"><CreditCard size={20} className="text-blue-600 shrink-0" /><span>Trả góp 0% qua thẻ tín dụng</span></div>
                  </>
                )}
                {product.productType === "electronic" && (
                  <>
                    <div className="flex items-center gap-3 text-[13.5px] text-slate-700 font-medium"><ShieldCheck size={20} className="text-blue-600 shrink-0" /><span>Bảo hành chính hãng 24 tháng</span></div>
                    <div className="flex items-center gap-3 text-[13.5px] text-slate-700 font-medium"><Wrench size={20} className="text-blue-600 shrink-0" /><span>Miễn phí lắp đặt tại nhà</span></div>
                    <div className="flex items-center gap-3 text-[13.5px] text-slate-700 font-medium"><HeadphonesIcon size={20} className="text-blue-600 shrink-0" /><span>Hỗ trợ kỹ thuật 24/7</span></div>
                    <div className="flex items-center gap-3 text-[13.5px] text-slate-700 font-medium"><RefreshCcw size={20} className="text-blue-600 shrink-0" /><span>Đổi trả tận nhà trong 7 ngày</span></div>
                  </>
                )}
                {product.productType === "accessory" && (
                  <>
                    <div className="flex items-center gap-3 text-[13.5px] text-slate-700 font-medium"><RefreshCcw size={20} className="text-blue-600 shrink-0" /><span>Bảo hành 6 tháng lỗi 1 đổi 1</span></div>
                    <div className="flex items-center gap-3 text-[13.5px] text-slate-700 font-medium"><ThumbsUp size={20} className="text-blue-600 shrink-0" /><span>Tương thích hoàn toàn với thiết bị</span></div>
                    <div className="flex items-center gap-3 text-[13.5px] text-slate-700 font-medium"><Truck size={20} className="text-blue-600 shrink-0" /><span>Giao hàng toàn quốc siêu tốc</span></div>
                    <div className="flex items-center gap-3 text-[13.5px] text-slate-700 font-medium"><PackageCheck size={20} className="text-blue-600 shrink-0" /><span>Kiểm tra hàng trước khi thanh toán</span></div>
                  </>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-4 mt-8 flex-wrap lg:flex-nowrap">
              <button
                className="flex-[2] md:flex-1 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl border-none font-bold text-[15px] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(37,99,235,0.2)]"
                disabled={!canBuy}
                onClick={() => {
                  const checkoutItem = {
                    productId: product._id,
                    variantId: currentVariant._id,
                    name: product.name,
                    image: mainImage,
                    price: priceData.sale,
                    quantity: 1,
                    color: selectedColor,
                    size: currentVariant.size,
                    storage: currentVariant.storage,
                    condition: product.condition || "new",
                    conditionLevel: selectedCondition || null
                  };
                  navigate('/checkout', {
                    state: { isBuyNow: true, items: [checkoutItem] }
                  });
                }}
              >
                MUA NGAY
              </button>
              
              <button
                className="flex-[2] md:flex-1 bg-white hover:bg-blue-50 border-2 border-blue-600 text-blue-600 p-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!canBuy}
                onClick={handleAddToCart}
              >
                <ShoppingCart size={20} /> Thêm vào giỏ
              </button>
              
              <button
                className={`w-[54px] h-[54px] rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all duration-300 flex-shrink-0 bg-white hover:border-red-300 hover:bg-red-50 ${isFavorited ? "border-red-500 bg-red-50 animate-[heartPop_0.35s_ease]" : "border-slate-200"}`}
                onClick={handleToggleFavorite}
                title={isFavorited ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
              >
                <HeartPlus size={22} fill={isFavorited ? "#ef4444" : "none"} stroke={isFavorited ? "#ef4444" : "#64748b"} className="transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* THÔNG TIN CHI TIẾT & THÔNG SỐ KỸ THUẬT */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 mt-12 mb-12">
          {/* MÔ TẢ SẢN PHẨM */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
            <h3 className="flex items-center gap-2 mb-5 text-[18px] font-bold text-slate-800 pb-4 border-b border-slate-100">
              <FileText size={20} className="text-blue-600" /> Đặc điểm nổi bật
            </h3>
            <div className="text-slate-600 leading-[1.8] text-[15px]">
              {product.description ? (
                <div className="whitespace-pre-line">
                  {product.description}
                </div>
              ) : (
                <div className="text-slate-400 italic py-5 text-center">Đang cập nhật thông tin chi tiết...</div>
              )}
            </div>
          </div>

          {/* THÔNG SỐ KỸ THUẬT NỔI BẬT */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 h-fit">
            <h3 className="flex items-center gap-2 mb-5 text-[18px] font-bold text-slate-800 pb-4 border-b border-slate-100">
              <Cpu size={20} className="text-blue-600" /> Thông số kỹ thuật
            </h3>

            <div className="border border-slate-100 rounded-xl overflow-hidden">
              {product.specs && Object.keys(product.specs).length > 0 ? (
                Object.entries(product.specs).map(([key, value]) => (
                  <div className="flex items-start gap-5 py-3.5 px-5 border-b border-slate-100 even:bg-slate-50 last:border-0" key={key}>
                    <span className="font-medium text-slate-800 w-[35%] shrink-0 text-[14px]">{key}</span>
                    <span className="text-slate-600 text-left flex-1 text-[14px]">{value}</span>
                  </div>
                ))
              ) : (
                <div className="p-5 text-center text-slate-400 italic">
                  Đang cập nhật thông số kỹ thuật...
                </div>
              )}
            </div>

            {/* Nút xem chi tiết thông số */}
            {(product.detailedSpecs && Object.keys(product.detailedSpecs).length > 0 && Object.values(product.detailedSpecs).some(val => val !== null && val !== "" && (typeof val !== 'object' || Object.keys(val).length > 0))) || (product.specs && Object.keys(product.specs).length > 0) ? (
              <div className="mt-6 text-center">
                <Link to={`/product/${product.slug || product._id}/specs`} className="inline-flex items-center justify-center gap-2 bg-slate-50 text-blue-600 py-3 px-6 rounded-xl font-semibold no-underline transition-all border border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 w-full md:w-auto">
                  <Cpu size={18} /> Xem cấu hình chi tiết
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        {/* SẢN PHẨM TƯƠNG THÍCH / PHỤ KIỆN ĐI KÈM */}
        {product.compatibleWith && product.compatibleWith.length > 0 && (
          <div className="py-10 border-t border-slate-200">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">
              Phụ kiện đi kèm / Tương thích
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
              {product.compatibleWith.map(cp => (
                <ProductCard key={cp._id} product={cp} />
              ))}
            </div>
          </div>
        )}

        {/* SẢN PHẨM LIÊN QUAN (Khớp Brand) */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="py-10 border-t border-slate-200">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">
              Sản phẩm liên quan
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
              {product.relatedProducts.map(rp => (
                <ProductCard 
                  key={rp._id} 
                  product={rp} 
                  isFavorited={favoriteIds.has(rp._id)}
                  onFavoriteToggle={handleCardFavoriteToggle}
                />
              ))}
            </div>
          </div>
        )}

        {/* CÓ THỂ BẠN SẼ THÍCH (Khớp Tags) */}
        {product.recommendedProducts && product.recommendedProducts.length > 0 && (
          <div className="py-10 pt-0">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">
              Có thể bạn sẽ thích
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
              {product.recommendedProducts.map(rp => (
                <ProductCard 
                  key={rp._id} 
                  product={rp} 
                  isFavorited={favoriteIds.has(rp._id)}
                  onFavoriteToggle={handleCardFavoriteToggle}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div >
  );
}

export default ProductDetail;