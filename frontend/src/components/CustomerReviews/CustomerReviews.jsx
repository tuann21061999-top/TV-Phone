import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Star, Quote, ChevronLeft, ChevronRight, MessageSquareHeart } from "lucide-react";

function CustomerReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchTopReviews = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/reviews/top`);
        setReviews(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Lỗi lấy reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopReviews();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  if (loading || reviews.length === 0) return null;

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={13}
        className={i < rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}
      />
    ));
  };

  const COLORS = [
    "from-blue-500 to-cyan-400",
    "from-violet-500 to-purple-400",
    "from-rose-500 to-pink-400",
    "from-emerald-500 to-teal-400",
    "from-amber-500 to-orange-400",
    "from-indigo-500 to-blue-400",
    "from-fuchsia-500 to-pink-400",
    "from-sky-500 to-cyan-400",
  ];

  return (
    <section className="w-full max-w-[1400px] mx-auto my-8 md:my-14 px-4 md:px-10 font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-5 md:mb-8">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-600 text-[11px] md:text-[12px] font-bold tracking-wide px-3 py-1 rounded-full uppercase mb-2">
            <MessageSquareHeart size={14} /> Đánh giá
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 m-0">Khách hàng nói gì</h2>
          <p className="text-[13px] md:text-sm text-slate-500 m-0 mt-1">Những đánh giá chân thực từ khách hàng đã mua sắm tại V&T Nexis</p>
        </div>
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center cursor-pointer transition-all hover:bg-slate-50 hover:border-slate-300 hover:text-blue-600"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center cursor-pointer transition-all hover:bg-slate-50 hover:border-slate-300 hover:text-blue-600"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* CAROUSEL */}
      <div
        ref={scrollRef}
        className="flex gap-3 md:gap-5 overflow-x-auto pb-4 scroll-smooth scrollbar-hide [&::-webkit-scrollbar]:hidden snap-x"
      >
        {reviews.map((review, idx) => (
          <div
            key={review._id || idx}
            className="snap-start shrink-0 w-[280px] sm:w-[300px] md:w-[340px] bg-white rounded-2xl border border-slate-100 p-5 md:p-6 flex flex-col gap-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-slate-200 relative"
          >
            {/* QUOTE ICON */}
            <div className={`absolute top-4 right-4 w-8 h-8 rounded-lg bg-gradient-to-br ${COLORS[idx % COLORS.length]} flex items-center justify-center opacity-15`}>
              <Quote size={16} className="text-white" />
            </div>

            {/* STARS */}
            <div className="flex gap-0.5">
              {renderStars(review.rating)}
            </div>

            {/* COMMENT */}
            <p className="text-[13px] md:text-[14px] text-slate-700 leading-relaxed m-0 line-clamp-3 flex-1">
              "{review.comment}"
            </p>

            {/* FOOTER: User + Product */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 mt-auto">
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${COLORS[idx % COLORS.length]} flex items-center justify-center text-white text-[13px] font-bold shrink-0`}>
                {review.username?.charAt(0)?.toUpperCase() || "K"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-800 m-0 truncate">{review.username}</p>
                <p className="text-[11px] text-slate-400 m-0 truncate">{review.productName}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CustomerReviews;
