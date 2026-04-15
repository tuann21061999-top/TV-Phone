import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Newspaper, ArrowRight, Calendar, ChevronRight } from "lucide-react";

function LatestNews() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/news`);
        // Lấy 4 bài viết mới nhất
        setNewsList(Array.isArray(data) ? data.slice(0, 4) : []);
      } catch (error) {
        console.error("Lỗi lấy tin tức:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading || newsList.length === 0) return null;

  const heroNews = newsList[0];
  const sideNews = newsList.slice(1, 4);

  return (
    <section className="w-full max-w-[1400px] mx-auto my-8 md:my-14 px-4 md:px-10 font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-5 md:mb-8">
        <div>
          <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 text-[11px] md:text-[12px] font-bold tracking-wide px-3 py-1 rounded-full uppercase mb-2">
            <Newspaper size={14} /> Tin tức
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 m-0">Tin công nghệ mới nhất</h2>
        </div>
        <button
          className="hidden sm:flex items-center gap-1.5 text-[13px] md:text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-4 py-2 cursor-pointer transition-all hover:bg-blue-100 hover:-translate-y-0.5"
          onClick={() => navigate("/news")}
        >
          Xem tất cả <ArrowRight size={15} />
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-4 md:gap-6">
        {/* HERO CARD */}
        <div
          onClick={() => navigate(`/news/${heroNews.slug}`)}
          className="relative rounded-2xl overflow-hidden cursor-pointer group h-[220px] sm:h-[280px] md:h-full md:min-h-[380px]"
        >
          <img
            src={heroNews.thumbnail}
            alt={heroNews.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 text-white z-10">
            <span className="bg-blue-600 px-2.5 py-1 text-[10px] md:text-[11px] font-bold rounded-full uppercase tracking-wide">
              {heroNews.category}
            </span>
            <h3 className="text-base sm:text-lg md:text-xl font-bold mt-2.5 mb-1.5 leading-snug line-clamp-2 m-0">
              {heroNews.title}
            </h3>
            <p className="text-[12px] md:text-[13px] text-white/70 m-0 line-clamp-2 hidden sm:block">
              {heroNews.shortDescription}
            </p>
            <div className="flex items-center gap-3 mt-2.5 text-[11px] md:text-[12px] text-white/60">
              <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(heroNews.createdAt).toLocaleDateString("vi-VN")}</span>
              <span>{heroNews.author}</span>
            </div>
          </div>
        </div>

        {/* SIDE CARDS */}
        <div className="flex flex-col gap-3 md:gap-4">
          {sideNews.map((news) => (
            <div
              key={news._id}
              onClick={() => navigate(`/news/${news.slug}`)}
              className="flex gap-3 md:gap-4 bg-white rounded-xl border border-slate-100 overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-slate-200 group"
            >
              <div className="w-[110px] sm:w-[130px] md:w-[140px] shrink-0 overflow-hidden">
                <img
                  src={news.thumbnail}
                  alt={news.title}
                  className="w-full h-full object-cover min-h-[90px] md:min-h-[100px] transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex-1 py-2.5 md:py-3 pr-3 md:pr-4 flex flex-col justify-center">
                <span className="text-[10px] md:text-[11px] font-bold text-blue-600 uppercase tracking-wide">{news.category}</span>
                <h4 className="text-[13px] md:text-[14px] font-semibold text-slate-800 m-0 mt-1 mb-1 line-clamp-2 leading-snug">
                  {news.title}
                </h4>
                <p className="text-[11px] md:text-[12px] text-slate-400 m-0 flex items-center gap-1">
                  <Calendar size={11} /> {new Date(news.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MOBILE: Xem tất cả */}
      <button
        className="sm:hidden w-full mt-4 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 cursor-pointer transition-all hover:bg-blue-100"
        onClick={() => navigate("/news")}
      >
        Xem tất cả tin tức <ChevronRight size={15} />
      </button>
    </section>
  );
}

export default LatestNews;
