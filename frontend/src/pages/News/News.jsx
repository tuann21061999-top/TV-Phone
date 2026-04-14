import React, { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Calendar, User } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["Tất cả", "Đánh giá", "Mẹo hay", "Thị trường", "Khuyến mãi", "Thủ thuật", "Custom ROM", "Khác"];

function News() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/news`);
        setNewsList(data);
      } catch (error) {
        toast.error("Không thể tải danh sách tin tức");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const filtered = activeCategory === "Tất cả"
    ? newsList
    : newsList.filter((n) => n.category === activeCategory);

  const heroNews = filtered.length > 0 ? filtered[0] : null;
  const featuredNews = filtered.slice(0, 3);
  const latestNews = filtered.slice(3, 9);

  if (loading) return (
    <div className="text-center mt-24 text-slate-500">Đang tải tin tức...</div>
  );

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />

      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-10 py-6 md:py-10">

        {/* ── CATEGORY TABS: scroll ngang trên mobile ── */}
        <div className="overflow-x-auto pb-2 mb-6 md:mb-8 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          <div className="flex gap-2.5 w-max md:w-auto md:flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-[18px] py-2 rounded-full border text-[13px] font-medium cursor-pointer transition-all shrink-0
                  ${activeCategory === cat
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── HERO: chiều cao linh hoạt, padding nhỏ hơn trên mobile ── */}
        {heroNews && (
          <div
            onClick={() => navigate(`/news/${heroNews.slug}`)}
            className="h-[260px] sm:h-[340px] md:h-[420px] rounded-2xl md:rounded-3xl bg-cover bg-center relative mb-10 md:mb-16 overflow-hidden cursor-pointer"
            style={{ backgroundImage: `url(${heroNews.thumbnail})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-5 md:p-10 text-white">
              <span className="bg-blue-600 px-3 py-1.5 text-[11px] font-semibold rounded-full w-fit mb-3 md:mb-4">
                {heroNews.category}
              </span>
              <h1 className="text-base sm:text-lg md:text-2xl font-bold m-0 mb-1 md:mb-2 leading-snug">
                {heroNews.title}
              </h1>
              <p className="text-[12px] sm:text-sm text-white/80 m-0 mb-3 md:mb-4 line-clamp-2">
                {heroNews.shortDescription}
              </p>
              <div className="flex gap-4 md:gap-5 text-[11px] md:text-xs text-white/70">
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="md:w-3.5 md:h-3.5" />
                  {new Date(heroNews.createdAt).toLocaleDateString("vi-VN")}
                </span>
                <span className="flex items-center gap-1">
                  <User size={13} className="md:w-3.5 md:h-3.5" />
                  {heroNews.author}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── FEATURED: 1 cột trên mobile, khoảng cách nhỏ hơn ── */}
        {featuredNews.length > 0 && (
          <section className="mb-10 md:mb-16">
            <div className="flex justify-between items-center mb-5 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-slate-800 m-0">Tin tức nổi bật</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {featuredNews.map((news) => (
                <div
                  key={news._id}
                  onClick={() => navigate(`/news/${news.slug}`)}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div
                    className="h-[160px] sm:h-[180px] bg-slate-200 bg-cover bg-center"
                    style={{ backgroundImage: `url(${news.thumbnail})` }}
                  />
                  <div className="p-4 md:p-5">
                    <span className="text-[11px] font-bold text-blue-600">{news.category}</span>
                    <h3 className="text-sm sm:text-base font-semibold text-slate-800 my-1.5 md:my-2 line-clamp-2">
                      {news.title}
                    </h3>
                    <p className="text-[12px] sm:text-[13px] text-slate-500 m-0 line-clamp-2">
                      {news.shortDescription}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── LATEST: 2 cột trên mobile, 4 cột trên md ── */}
        {latestNews.length > 0 && (
          <section className="mb-10 md:mb-16">
            <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-5 md:mb-6">Tin công nghệ mới nhất</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {latestNews.map((news) => (
                <div
                  key={news._id}
                  onClick={() => navigate(`/news/${news.slug}`)}
                  className="aspect-[3/4] rounded-[14px] sm:rounded-[18px] bg-cover bg-center bg-slate-300 relative overflow-hidden cursor-pointer"
                  style={{ backgroundImage: `url(${news.thumbnail})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3 sm:p-5">
                    <h4 className="text-white text-[11px] sm:text-sm font-semibold m-0 line-clamp-2 leading-snug">
                      {news.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── EMPTY STATE ── */}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p>Không tìm thấy bài viết nào cho danh mục này.</p>
          </div>
        )}

        {/* ── NEWSLETTER: stack dọc trên mobile ── */}
        <div className="bg-blue-50 rounded-2xl md:rounded-3xl px-5 md:px-10 py-7 md:py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-2">Đăng ký nhận bản tin công nghệ</h2>
            <p className="text-sm text-slate-500 m-0">Nhận tin tức mới nhất và ưu đãi đặc quyền hàng tuần.</p>
          </div>
          <div className="flex gap-2.5 flex-col sm:flex-row w-full md:w-auto">
            <input
              type="email"
              placeholder="Email của bạn"
              className="px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm w-full sm:min-w-[200px] md:min-w-[250px] focus:border-blue-400 transition-colors"
            />
            <button className="px-5 py-3 rounded-xl border-none bg-blue-600 hover:bg-blue-800 text-white font-semibold text-sm cursor-pointer transition-colors w-full sm:w-auto">
              Đăng ký
            </button>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}

export default News;
