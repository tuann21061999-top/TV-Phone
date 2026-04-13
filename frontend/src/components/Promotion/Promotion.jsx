import React, { useState, useEffect } from "react";
import Countdown from "../Countdown/Countdown";
import axios from "axios";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

function Promotion() {
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
      <section className="promotion promotion-loading">
        <Loader2 className="animate-spin text-blue-500 mx-auto my-10" size={32} />
      </section>
    );
  }

  if (!bestProduct || !bestPricing) return null;

  const displayImage = bestProduct.productImage || "/no-image.png";
  
  const hasLimit = bestProduct.quantityLimit > 0;
  const soldQty = bestProduct.soldQuantity || 0;
  const progressPercent = hasLimit ? Math.min((soldQty / bestProduct.quantityLimit) * 100, 100) : 0;

  return (
    <section className="relative w-[92%] md:w-[90%] max-w-[1200px] mx-auto my-8 md:my-[60px] bg-gradient-to-br from-slate-900 to-blue-900 text-white rounded-2xl flex flex-col md:flex-row justify-between items-center overflow-hidden shadow-[0_10px_30px_rgba(30,58,138,0.3)] px-5 py-8 md:px-12 md:py-10 gap-6 md:gap-10">

      {/* Glow effect */}
      <div className="absolute -top-1/2 -left-[10%] w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-[radial-gradient(circle,rgba(59,130,246,0.4)_0%,rgba(15,23,42,0)_70%)] pointer-events-none z-[1]" />

      {/* CONTENT LEFT */}
      <div className="relative z-[2] flex-1 flex flex-col gap-3 md:gap-4 items-center md:items-start text-center md:text-left w-full">

        {/* Badge */}
        <div className="bg-white/10 border border-white/20 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[11px] md:text-[13px] font-bold tracking-wide text-yellow-400 backdrop-blur w-fit">
          HOT DEAL MỖI NGÀY
        </div>

        {/* Tiêu đề */}
        <h2 className="text-xl sm:text-2xl md:text-[32px] font-extrabold leading-tight m-0">
          {bestProduct.isShockDeal
            ? "FLASH SALE CHỚP NHOÁNG"
            : bestPricing.discountPercent > 0
            ? "Giảm Giá Khủng"
            : "Sản Phẩm Đỉnh Cao"}
        </h2>

        {/* THÔNG TIN SẢN PHẨM */}
        <div className="mt-1 md:mt-2 bg-white/5 p-3 md:p-4 rounded-xl border-l-4 border-yellow-400 w-full max-w-[320px] md:max-w-md flex flex-col items-center md:items-start">
          <h3 className="text-base md:text-lg font-semibold text-slate-200 mb-1 md:mb-1.5 line-clamp-2 md:line-clamp-1">
            {bestProduct.productName}
          </h3>

          <div className="flex items-baseline gap-2 md:gap-3 justify-center md:justify-start">
            <span className="text-[22px] sm:text-2xl md:text-[28px] font-extrabold text-yellow-400 leading-none">
              {bestPricing.finalPrice.toLocaleString()}đ
            </span>
            {bestPricing.discountPercent > 0 && (
              <span className="text-[11px] md:text-sm line-through text-slate-400 font-medium">
                {bestPricing.basePrice.toLocaleString()}đ
              </span>
            )}
          </div>
        </div>

        {/* THANH TIẾN ĐỘ (Giới hạn số lượng) */}
        {hasLimit && (
          <div className="w-full max-w-[320px] md:max-w-md mt-1 md:mt-2">
            <div className="w-full h-1.5 md:h-2 bg-slate-200/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-red-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] md:text-[12px] text-slate-300 mt-1.5 font-medium px-0.5">
              <span>Đã bán: {soldQty}</span>
              <span>Giới hạn: {bestProduct.quantityLimit}</span>
            </div>
          </div>
        )}

        {/* ĐỒNG HỒ ĐẾM NGƯỢC */}
        {bestPricing.discountPercent > 0 && (
          <div className="mt-1 md:mt-2 transform scale-[0.85] md:scale-100 origin-center md:origin-left w-full flex justify-center md:justify-start">
            <Countdown targetDate={bestPricing.targetEnd} />
          </div>
        )}

        {/* NÚT BẤM MUA NGAY */}
        <Link
          to={`/product/${bestProduct.slug || bestProduct.productId}`}
          className="mt-1 md:mt-3 inline-flex items-center justify-center bg-yellow-400 text-slate-900 font-bold px-5 py-2.5 md:px-6 md:py-3 rounded-xl hover:bg-yellow-500 hover:-translate-y-[2px] transition-all shadow-lg text-[13px] md:text-base w-full sm:w-auto max-w-[320px]"
        >
          Xem ngay kẻo lỡ
        </Link>
      </div>

      {/* IMAGE RIGHT */}
      <div className="relative z-[2] flex-1 flex justify-center items-center mt-2 md:mt-0 w-full">
        {/* Bóp nhỏ kích thước khung ảnh trên mobile */}
        <div className="relative w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] md:w-[380px] md:h-[380px] animate-[float_6s_ease-in-out_infinite]">
          
          <div className="absolute inset-0 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.2)] md:shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
            <img
              src={displayImage}
              alt={bestProduct.productName}
              className="w-[85%] h-[85%] object-contain mix-blend-multiply"
            />
          </div>

          {/* DISCOUNT BADGE (Thu nhỏ badge trên mobile) */}
          {bestPricing.discountPercent > 0 && (
            <div className="absolute -top-1 -right-1 md:-top-4 md:-right-4 w-[56px] h-[56px] md:w-[80px] md:h-[80px] bg-red-500 text-white flex items-center justify-center rounded-full text-[14px] md:text-xl font-black rotate-12 shadow-lg z-10 border-2 md:border-[3px] border-white">
              -{bestPricing.discountPercent}%
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Promotion;