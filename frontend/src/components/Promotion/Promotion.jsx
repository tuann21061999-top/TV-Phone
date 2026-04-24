import React, { useState, useEffect } from "react";
import Countdown from "./Countdown";
import axios from "axios";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

function Promotion({ isCompact = false }) {
  const [bestProduct, setBestProduct] = useState(null);
  const [bestPricing, setBestPricing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestPromotion = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/promotions/public/best`);
        if (data) {
          setBestProduct(data);
          
          const percent = Math.round(((data.originalPrice - data.discountedPrice) / data.originalPrice) * 100);
          setBestPricing({
            basePrice: data.originalPrice,
            finalPrice: data.discountedPrice,
            discountPercent: percent,
            targetEnd: data.promotionEnd ? new Date(data.promotionEnd) : null
          });
        }
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm khuyến mãi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestPromotion();
  }, []);

  if (loading) {
    return (
      <section className={`${isCompact ? "w-full h-full" : ""} flex items-center justify-center`}>
        <Loader2 className="animate-spin text-blue-500 mx-auto my-8" size={28} />
      </section>
    );
  }

  if (!bestProduct || !bestPricing) return null;

  const displayImage = bestProduct.productImage || "/no-image.png";
  
  const hasLimit = bestProduct.quantityLimit > 0;
  const soldQty = bestProduct.soldQuantity || 0;
  const progressPercent = hasLimit ? Math.min((soldQty / bestProduct.quantityLimit) * 100, 100) : 0;

  return (
    <section className={`relative bg-gradient-to-br from-slate-900 to-blue-900 text-white flex overflow-hidden shadow-[0_8px_24px_rgba(30,58,138,0.25)]
      ${isCompact 
        ? "w-full h-full rounded-xl flex-row items-center justify-between px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 gap-1 md:gap-4" 
        : "w-[92%] md:w-[90%] max-w-[1200px] mx-auto my-6 md:my-[50px] rounded-xl flex-col md:flex-row items-center justify-between px-4 py-5 md:px-10 md:py-8 gap-4 md:gap-8"}
    `}>

      {/* Glow effect */}
      <div className="absolute -top-1/2 -left-[10%] w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-[radial-gradient(circle,rgba(59,130,246,0.35)_0%,rgba(15,23,42,0)_70%)] pointer-events-none z-[1]" />

      {/* CONTENT LEFT */}
      <div className="relative z-[2] flex-1 flex flex-col gap-0.5 md:gap-1.5 items-start text-left w-full min-w-0 overflow-hidden">

        {/* Badge (Chỉ hiện trên desktop nếu isCompact để tiết kiệm diện tích mobile) */}
        <div className={`${isCompact ? "hidden md:flex" : "flex"} bg-white/10 border border-white/20 px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-bold tracking-wide text-yellow-400 backdrop-blur w-fit shrink-0`}>
          ⚡ FLASH SALE
        </div>

        {/* Tiêu đề */}
        <h2 className={`${isCompact ? "text-[12px] md:text-[18px]" : "text-sm md:text-[22px]"} font-extrabold leading-tight m-0 line-clamp-1 text-yellow-400 md:text-white`}>
          {bestProduct.isShockDeal
            ? "⚡ FLASH SALE"
            : bestPricing.discountPercent > 0
            ? "Giảm Giá Khủng"
            : "Sản Phẩm Đỉnh Cao"}
        </h2>

        {/* THÔNG TIN SẢN PHẨM */}
        <div className="bg-white/5 p-1 md:p-2 rounded-md border-l-2 border-yellow-400 w-full flex flex-col items-start">
          <h3 className="text-[10px] md:text-[13px] font-semibold text-slate-200 mb-0 line-clamp-1">
            {bestProduct.productName}
          </h3>
          <div className="flex items-baseline gap-1.5 mt-0.5 md:mt-1">
            <span className={`${isCompact ? "text-[13px] md:text-[18px]" : "text-[16px] md:text-[20px]"} font-extrabold text-yellow-400 leading-none`}>
              {bestPricing.finalPrice.toLocaleString()}đ
            </span>
            {bestPricing.discountPercent > 0 && (
              <span className="text-[8px] md:text-[11px] line-through text-slate-400 font-medium">
                {bestPricing.basePrice.toLocaleString()}đ
              </span>
            )}
          </div>
        </div>

        {/* THANH TIẾN ĐỘ */}
        {hasLimit && (
          <div className="w-full mt-0.5">
            <div className="w-full h-[3px] md:h-1 bg-slate-200/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-red-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[7px] md:text-[9px] text-slate-300 mt-0.5 font-medium">
              <span>Đã bán: {soldQty}</span>
              <span>Giới hạn: {bestProduct.quantityLimit}</span>
            </div>
          </div>
        )}

        {/* ĐỒNG HỒ ĐẾM NGƯỢC */}
        {bestPricing.discountPercent > 0 && (
          <div className="transform scale-[0.45] sm:scale-[0.55] md:scale-[0.7] origin-left w-full -mt-2 -mb-2.5 md:-mt-1 md:-mb-2">
            <Countdown targetDate={bestPricing.targetEnd} />
          </div>
        )}

        {/* NÚT BẤM */}
        <Link
          to={`/product/${bestProduct.slug || bestProduct.productId}`}
          className={`inline-flex items-center justify-center bg-yellow-400 text-slate-900 font-bold rounded-lg hover:bg-yellow-500 hover:-translate-y-[1px] transition-all shadow-md shrink-0 no-underline
            ${isCompact ? "px-2.5 py-1 text-[9px] md:text-[13px] md:px-5 md:py-1.5" : "px-4 py-2 text-[11px] md:text-[13px] mt-1"}`}
        >
          Xem ngay kẻo lỡ
        </Link>
      </div>

      {/* IMAGE RIGHT */}
      <div className={`relative z-[2] flex justify-center items-center shrink-0`}>
        <div className={`relative animate-[float_6s_ease-in-out_infinite] 
          ${isCompact ? "w-[75px] h-[75px] sm:w-[90px] sm:h-[90px] md:w-[140px] md:h-[140px]" : "w-[140px] h-[140px] md:w-[260px] md:h-[260px]"}
        `}>
          
          <div className="absolute inset-0 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-[0_6px_16px_rgba(0,0,0,0.18)]">
            <img
              src={displayImage}
              alt={bestProduct.productName}
              className="w-[82%] h-[82%] object-contain mix-blend-multiply"
            />
          </div>

          {/* DISCOUNT BADGE */}
          {bestPricing.discountPercent > 0 && (
            <div className={`absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 bg-red-500 text-white flex items-center justify-center rounded-full font-black rotate-12 shadow-md z-10 border-[1.5px] border-white
              ${isCompact ? "w-[30px] h-[30px] text-[8px] md:w-[44px] md:h-[44px] md:text-[11px]" : "w-[36px] h-[36px] text-[9px] md:w-[56px] md:h-[56px] md:text-[13px]"}`}>
              -{bestPricing.discountPercent}%
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Promotion;