import React, { useState, useEffect } from "react";
import Countdown from "../Countdown/Countdown";
import axios from "axios";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Xóa bỏ getProductPricing do không được sử dụng

function Promotion() {
  const [bestProduct, setBestProduct] = useState(null);
  const [bestPricing, setBestPricing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestPromotion = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/promotions/public/best");
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
        <Loader2 className="spinner" size={32} />
      </section>
    );
  }

  // Nếu không có sản phẩm nào
  if (!bestProduct || !bestPricing) return null;

  const displayImage = bestProduct.productImage || "/no-image.png";
  
  // Tính thẻ progress bar
  const hasLimit = bestProduct.quantityLimit > 0;
  const soldQty = bestProduct.soldQuantity || 0;
  const progressPercent = hasLimit ? Math.min((soldQty / bestProduct.quantityLimit) * 100, 100) : 0;

  return (
    <section className="relative w-[90%] max-w-[1200px] mx-auto my-[60px] bg-gradient-to-br from-slate-900 to-blue-900 text-white rounded-2xl flex flex-col md:flex-row justify-between items-center overflow-hidden shadow-[0_10px_40px_rgba(30,58,138,0.4)] px-6 md:px-12 py-10 gap-10">

      {/* Glow effect */}
      <div className="absolute -top-1/2 -left-[10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(59,130,246,0.4)_0%,rgba(15,23,42,0)_70%)] pointer-events-none z-[1]" />

      {/* CONTENT */}
      <div className="relative z-[2] flex-1 flex flex-col gap-4 items-start md:items-start text-center md:text-left">

        <div className="bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-[13px] font-bold tracking-wide text-yellow-400 backdrop-blur">
          HOT DEAL MỖI NGÀY
        </div>

        <h2 className="text-2xl md:text-[32px] font-extrabold leading-tight">
          {bestProduct.isShockDeal
            ? "FLASH SALE CHỚP NHOÁNG"
            : bestPricing.discountPercent > 0
            ? "Giảm Giá Khủng"
            : "Sản Phẩm Đỉnh Cao"}
        </h2>

        {/* PRODUCT INFO */}
        <div className="mt-2 bg-white/5 p-4 rounded-xl border-l-4 border-yellow-400 w-full max-w-md">
          <h3 className="text-lg font-semibold text-slate-200 mb-1">
            {bestProduct.productName}
          </h3>

          <div className="flex items-baseline gap-3 justify-center md:justify-start">
            <span className="text-2xl md:text-[28px] font-extrabold text-yellow-400">
              {bestPricing.finalPrice.toLocaleString()}đ
            </span>
            {bestPricing.discountPercent > 0 && (
              <span className="text-sm line-through text-slate-400">
                {bestPricing.basePrice.toLocaleString()}đ
              </span>
            )}
          </div>
        </div>

        {/* PROGRESS */}
        {hasLimit && (
          <div className="w-full max-w-md mt-2">
            <div className="w-full h-2 bg-slate-200/30 rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-red-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[12px] text-slate-300 mt-1">
              <span>Đã bán: {soldQty}</span>
              <span>Giới hạn: {bestProduct.quantityLimit}</span>
            </div>
          </div>
        )}

        {/* COUNTDOWN */}
        {bestPricing.discountPercent > 0 && (
          <div className="mt-2">
            <Countdown targetDate={bestPricing.targetEnd} />
          </div>
        )}

        {/* BUTTON */}
        <Link
          to={`/product/${bestProduct.slug || bestProduct.productId}`}
          className="mt-3 inline-block bg-yellow-400 text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-yellow-500 hover:-translate-y-[2px] transition-all shadow-lg"
        >
          Xem ngay kẻo lỡ
        </Link>
      </div>

      {/* IMAGE (Đã FIX lỗi viền vuông) */}
      <div className="relative z-[2] flex-1 flex justify-center items-center mt-6 md:mt-0">
        {/* Thẻ bọc ngoài cùng chứa animation và kích thước */}
        <div className="relative w-[300px] md:w-[380px] h-[300px] md:h-[380px] animate-[float_6s_ease-in-out_infinite]">
          
          {/* Thẻ tròn chứa ảnh, được thêm overflow-hidden để cắt gọn nền vuông */}
          <div className="absolute inset-0 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
            <img
              src={displayImage}
              alt={bestProduct.productName}
              className="w-[85%] h-[85%] object-contain mix-blend-multiply"
            />
          </div>

          {/* DISCOUNT BADGE (Đặt ngang hàng với hình tròn để không bị overflow-hidden cắt mất) */}
          {bestPricing.discountPercent > 0 && (
            <div className="absolute -top-4 -right-4 w-[80px] h-[80px] bg-red-500 text-white flex items-center justify-center rounded-full text-xl font-black rotate-12 shadow-lg z-10">
              -{bestPricing.discountPercent}%
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Promotion;