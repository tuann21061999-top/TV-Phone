import { useState, useEffect } from "react";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

function ProductCard({ product, isFavorited = false, onFavoriteToggle }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(isFavorited);
  const [loadingLike, setLoadingLike] = useState(false);

  // Sync internal state if parent fetches favorite data asynchronously
  useEffect(() => {
    setLiked(isFavorited);
  }, [isFavorited]);

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning("Vui lòng đăng nhập để sử dụng tính năng yêu thích!");
      navigate("/login");
      return;
    }

    if (loadingLike) return;
    setLoadingLike(true);

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/favorites/toggle`,
        { productId: product._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLiked(data.isFavorited);
      toast.success(data.message);
      if (onFavoriteToggle) onFavoriteToggle(product._id, data.isFavorited);
    } catch {
      toast.error("Lỗi khi thực hiện yêu thích!");
    } finally {
      setLoadingLike(false);
    }
  };

  const formatPrice = (price) => price?.toLocaleString("vi-VN") + "₫";

  const getPricingInfo = () => {
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
        
        // Summing limits for discounted variants
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
      isShockDeal: isShock,
      totalLimit,
      totalSold
    };
  };

  const { basePrice, finalPrice, discountPercent, isShockDeal, totalLimit, totalSold } = getPricingInfo();
  const isDiscounted = finalPrice < basePrice;
  const quantityLeft = Math.max(0, totalLimit - totalSold);
  const progressPercent = totalLimit > 0 ? Math.min((totalSold / totalLimit) * 100, 100) : 0;

  return (
    <div
      className="bg-white border border-gray-100 rounded-xl md:rounded-2xl p-2.5 md:p-4 transition-all duration-300 cursor-pointer flex flex-col hover:shadow-[0_10px_25px_rgba(0,0,0,0.05)] hover:-translate-y-1 group h-full"
      onClick={() => navigate(`/product/${product.slug || product._id}`)}
    >
      {/* KHUNG ẢNH: Chiều cao thu gọn trên Mobile (140px) và bung rộng trên PC (220px) */}
      <div className="relative bg-slate-50 rounded-lg md:rounded-xl p-2 md:p-5 h-[140px] sm:h-[160px] md:h-[220px] flex items-center justify-center mb-2.5 md:mb-4">
        
        {/* Badges */}
        <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col gap-1 md:gap-1.5 z-10">
          {isDiscounted && discountPercent > 0 && (
            <span className="bg-red-500 text-white text-[9px] md:text-[11px] font-bold py-0.5 px-1.5 md:py-1 md:px-2 rounded">-{discountPercent}%</span>
          )}
          {product.isFeatured && !isDiscounted && (
            <span className="bg-emerald-500 text-white text-[9px] md:text-[11px] font-bold py-0.5 px-1.5 md:py-1 md:px-2 rounded">Mới</span>
          )}
        </div>

        {/* Nút thả tim thu nhỏ trên Mobile */}
        <button
          className={`absolute top-2 right-2 md:top-3 md:right-3 bg-white border-none w-7 h-7 md:w-8 md:h-8 p-0 rounded-full flex items-center justify-center cursor-pointer shadow-[0_2px_5px_rgba(0,0,0,0.05)] z-10 transition-all duration-200 md:hover:scale-110 ${liked ? "bg-red-50" : ""}`}
          onClick={handleToggleFavorite}
          title={liked ? "Bỏ yêu thích" : "Yêu thích"}
        >
          <Heart className="w-[14px] h-[14px] md:w-[18px] md:h-[18px]" color={liked ? "#ef4444" : "#6b7280"} fill={liked ? "#ef4444" : "none"} />
        </button>

        <img
          src={product.images?.[0] || product.colorImages?.[0]?.imageUrl || "/no-image.png"}
          alt={product.name}
          className="max-w-full max-h-full object-contain transition-transform duration-300 md:group-hover:scale-105"
        />
      </div>

      <div className="flex flex-col flex-1">
        {/* TÊN SP */}
        <h4 className="text-[13px] md:text-base font-semibold text-gray-800 m-0 mb-1.5 md:mb-2 line-clamp-2 overflow-hidden text-ellipsis leading-snug md:leading-normal">
          {product.name}
        </h4>

        {/* HIGHLIGHTS */}
        <div className="flex flex-col gap-1 md:gap-1.5 mb-2 md:mb-3">
          {product.highlights?.slice(0, 3).map((h, idx) => (
            <span key={idx} className="bg-gray-100 text-gray-600 text-[9.5px] md:text-[11px] py-[2px] md:py-1 px-1.5 md:px-2 rounded whitespace-nowrap overflow-hidden text-ellipsis w-fit max-w-full">
              {h}
            </span>
          ))}
        </div>

        {/* ĐÁNH GIÁ */}
        <div className="flex items-center gap-1 md:gap-1.5 mb-auto pb-2 md:pb-4">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-2.5 h-2.5 md:w-3 md:h-3"
                fill={i < Math.round(product.averageRating || 0) ? "#facc15" : "none"}
                stroke="#facc15"
                strokeWidth={2}
              />
            ))}
          </div>
          <span className="text-[10px] md:text-xs text-gray-400">({product.reviewsCount || 0})</span>
        </div>

        {/* GIÁ TIỀN VÀ FLASH SALE */}
        <div className="flex justify-between items-end mt-auto">
          <div className="flex flex-col gap-0.5 w-full">
            {isDiscounted ? (
              <>
                <span className="text-[11px] md:text-xs text-gray-400 line-through leading-none">{formatPrice(basePrice)}</span>
                <span className="text-[15px] md:text-lg font-bold text-red-500 leading-tight">{formatPrice(finalPrice)}</span>
                {totalLimit > 0 && (
                  <div className="w-full mt-1.5 md:mt-2">
                    <div className="w-full h-1 md:h-1.5 bg-red-100/50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <div className="flex justify-start text-[9px] md:text-[10px] items-center gap-1 md:gap-1.5 font-semibold text-red-500 mt-1">
                       <span className="relative flex h-1.5 w-1.5 md:h-1.5 md:w-1.5">
                         {quantityLeft > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                         <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-1.5 md:w-1.5 bg-red-500"></span>
                       </span>
                       {quantityLeft > 0 ? `Còn ${quantityLeft} suất` : "Đã hết suất"}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <span className="text-[15px] md:text-lg font-bold text-gray-900">{formatPrice(basePrice)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;