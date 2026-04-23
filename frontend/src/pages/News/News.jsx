import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock3, Eye, Flame, Search, User } from "lucide-react";
import { toast } from "sonner";
import Header from "../../components/Layout/Header";
import Footer from "../../components/Layout/Footer";

const CATEGORIES = [
  "Tất cả",
  "Đánh giá",
  "Mẹo hay",
  "Thị trường",
  "Khuyến mãi",
  "Thủ thuật",
  "Custom ROM",
  "Khác",
];

const SORT_MODES = [
  { id: "latest", label: "Mới nhất" },
  { id: "hot", label: "Hot theo lượt xem" },
];

function estimateReadMinutes(news) {
  const source = [
    news?.title,
    news?.shortDescription,
    ...(news?.contentBlocks || []).map((block) => block?.value),
  ]
    .filter(Boolean)
    .join(" ");

  const words = source.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("vi-VN");
}

function News() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [sortMode, setSortMode] = useState("latest");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/news`);
        setNewsList(Array.isArray(data) ? data : []);
      } catch {
        toast.error("Không thể tải danh sách tin tức");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const nowLabel = useMemo(
    () =>
      new Date().toLocaleString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    []
  );

  const categoryCounts = useMemo(() => {
    const counts = Object.fromEntries(CATEGORIES.map((cat) => [cat, 0]));

    newsList.forEach((news) => {
      counts["Tất cả"] += 1;
      if (counts[news.category] !== undefined) {
        counts[news.category] += 1;
      }
    });

    return counts;
  }, [newsList]);

  const filteredNews = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const byCategory =
      activeCategory === "Tất cả"
        ? newsList
        : newsList.filter((news) => news.category === activeCategory);

    const byQuery = normalizedQuery
      ? byCategory.filter((news) => {
          const title = news.title?.toLowerCase() || "";
          const summary = news.shortDescription?.toLowerCase() || "";
          return title.includes(normalizedQuery) || summary.includes(normalizedQuery);
        })
      : byCategory;

    return [...byQuery].sort((a, b) => {
      const dateDiff = new Date(b.createdAt) - new Date(a.createdAt);

      if (sortMode === "hot") {
        return (b.views || 0) - (a.views || 0) || dateDiff;
      }

      return dateDiff || (b.views || 0) - (a.views || 0);
    });
  }, [activeCategory, newsList, query, sortMode]);

  const breakingNews = useMemo(
    () => [...newsList].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5),
    [newsList]
  );

  const heroNews = filteredNews[0] || null;
  const sideNews = filteredNews.slice(1, 3);
  const remainingNews = filteredNews.slice(3);
  const spotlightNews = remainingNews.slice(0, 3);
  const feedNews = remainingNews.slice(3, 13);

  const hotStories = useMemo(
    () => [...newsList].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3),
    [newsList]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50/70 text-slate-900">
        <Header />
        <main className="mx-auto w-full max-w-[1440px] px-4 pb-12 pt-6 md:px-10 md:pt-9">
          <div className="mb-6 h-44 animate-pulse rounded-3xl border border-blue-100 bg-white md:mb-8" />
          <div className="mb-6 h-14 animate-pulse rounded-2xl border border-blue-100 bg-white md:mb-8" />
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.45fr_0.9fr] md:gap-6">
            <div className="h-[360px] animate-pulse rounded-3xl border border-blue-100 bg-white md:h-[460px]" />
            <div className="grid gap-4 md:gap-5">
              <div className="h-[180px] animate-pulse rounded-2xl border border-blue-100 bg-white" />
              <div className="h-[180px] animate-pulse rounded-2xl border border-blue-100 bg-white" />
              <div className="h-[160px] animate-pulse rounded-2xl border border-blue-100 bg-white" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-blue-50/70 text-slate-900">
      <Header />

      <main className="mx-auto w-full max-w-[1440px] px-4 pb-12 pt-6 md:px-10 md:pt-9">
        <section className="mb-6 rounded-3xl border border-blue-100 bg-white p-5 shadow-[0_20px_45px_-35px_rgba(37,99,235,0.32)] md:mb-8 md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-500">
                VTNEXIS TECH DESK
              </p>
              <h1 className="m-0 text-[30px] font-extrabold leading-[1.05] text-slate-900 sm:text-[40px] md:text-[52px]">
                NEWSROOM LIVE
              </h1>
              <p className="mb-0 mt-3 max-w-[640px] text-sm text-slate-600 md:text-[15px]">
                Bản tin công nghệ theo nhịp thị trường: đánh giá, mẹo sử dụng và xu
                hướng mới được biên tập liên tục.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              <div className="rounded-2xl border border-blue-200 bg-blue-600 px-4 py-3 text-white">
                <p className="m-0 text-[11px] uppercase tracking-[0.12em] text-blue-100">Tổng tin</p>
                <p className="m-0 mt-1 text-xl font-bold">{newsList.length}</p>
              </div>
              <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-700">
                <p className="m-0 text-[11px] uppercase tracking-[0.12em] text-blue-500">Danh mục</p>
                <p className="m-0 mt-1 text-xl font-bold">{CATEGORIES.length - 1}</p>
              </div>
              <div className="col-span-2 rounded-2xl border border-blue-200 bg-white px-4 py-3 text-blue-700 sm:col-span-1">
                <p className="m-0 text-[11px] uppercase tracking-[0.12em] text-blue-500">Cập nhật</p>
                <p className="m-0 mt-1 text-[12px] font-semibold">{nowLabel}</p>
              </div>
            </div>
          </div>
        </section>

        {breakingNews.length > 0 && (
          <section className="group mb-6 overflow-hidden rounded-2xl border border-blue-100 bg-white md:mb-8">
            <div className="flex items-stretch">
              <div className="flex shrink-0 items-center gap-2 bg-blue-600 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                <Flame size={14} /> Breaking
              </div>
              <div className="min-w-0 grow overflow-hidden py-2.5">
                <div className="flex w-max animate-newsTicker whitespace-nowrap [will-change:transform] motion-reduce:animate-none group-hover:[animation-play-state:paused]">
                  {[...breakingNews, ...breakingNews].map((news, idx) => (
                    <button
                      key={`${news._id}-${idx}`}
                      type="button"
                      onClick={() => navigate(`/news/${news.slug}`)}
                      className="mx-4 inline-flex shrink-0 items-center gap-2 text-left text-[13px] font-semibold text-slate-700 transition-colors hover:text-blue-700"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      <span className="line-clamp-1">{news.title}</span>
                      <span className="text-[11px] font-medium text-blue-500">{news.views || 0} lượt xem</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mb-7 rounded-3xl border border-blue-100 bg-white p-4 md:mb-9 md:p-5">
          <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-[520px]">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm theo tiêu đề hoặc mô tả ngắn..."
                className="h-11 w-full rounded-xl border border-blue-100 bg-blue-50/60 pl-10 pr-3 text-sm outline-none transition-colors focus:border-blue-400"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {SORT_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setSortMode(mode.id)}
                  className={`rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all ${
                    sortMode === mode.id
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div className="-mx-1 overflow-x-auto px-1 pb-1">
            <div className="flex w-max gap-2 md:w-auto md:flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[12px] font-semibold transition-all ${
                    activeCategory === cat
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-blue-100 bg-white text-blue-700 hover:border-blue-300"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      activeCategory === cat ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {categoryCounts[cat] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {heroNews ? (
          <section className="mb-9">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_0.9fr] md:gap-6">
              <button
                type="button"
                onClick={() => navigate(`/news/${heroNews.slug}`)}
                className="group relative min-h-[360px] overflow-hidden rounded-3xl border border-blue-100 text-left shadow-[0_24px_48px_-35px_rgba(37,99,235,0.32)] md:min-h-[460px]"
              >
                <img
                  src={heroNews.thumbnail}
                  alt={heroNews.title}
                  fetchPriority="high"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-blue-900/45 to-blue-950/10" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-9">
                  <span className="inline-flex items-center rounded-full bg-blue-500/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-blue-100">
                    Lead Story
                  </span>
                  <h2 className="mb-2 mt-4 text-2xl font-bold leading-tight md:text-[38px]">{heroNews.title}</h2>
                  <p className="mb-4 max-w-[680px] text-sm text-white/80 md:text-[15px]">{heroNews.shortDescription}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-white/75 md:text-[13px]">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={13} /> {formatDate(heroNews.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <User size={13} /> {heroNews.author || "Admin"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Eye size={13} /> {heroNews.views || 0} lượt xem
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 size={13} /> {estimateReadMinutes(heroNews)} phút đọc
                    </span>
                  </div>
                </div>
              </button>

              <div className="grid gap-4 md:gap-5">
                {sideNews.map((news, idx) => (
                  <button
                    key={news._id}
                    type="button"
                    onClick={() => navigate(`/news/${news.slug}`)}
                    className="group flex min-h-[180px] gap-4 rounded-2xl border border-blue-100 bg-white p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="w-[120px] shrink-0 overflow-hidden rounded-xl bg-blue-100 sm:w-[150px]">
                      <img
                        src={news.thumbnail}
                        alt={news.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                      <div>
                        <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.09em] text-white">
                          #{idx + 2} trending
                        </span>
                        <h3 className="mb-1 mt-2 line-clamp-2 text-[18px] font-bold leading-snug text-slate-900">
                          {news.title}
                        </h3>
                        <p className="m-0 line-clamp-2 text-[13px] text-slate-500">{news.shortDescription}</p>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Eye size={12} /> {news.views || 0}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock3 size={12} /> {estimateReadMinutes(news)} phút đọc
                        </span>
                      </div>
                    </div>
                  </button>
                ))}

                {hotStories.length > 0 && (
                  <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
                    <h3 className="mb-3 mt-0 text-lg font-bold">Top lượt xem hôm nay</h3>
                    <div className="flex flex-col gap-2.5">
                      {hotStories.map((news, idx) => (
                        <button
                          key={news._id}
                          type="button"
                          onClick={() => navigate(`/news/${news.slug}`)}
                          className="flex items-center justify-between gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-left text-white/90 transition-colors hover:bg-white/20"
                        >
                          <span className="line-clamp-1 text-[12px] font-medium">
                            {idx + 1}. {news.title}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-white/80">
                            <Eye size={11} /> {news.views || 0}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : (
          <div className="rounded-2xl border border-blue-100 bg-white p-10 text-center text-slate-500">
            Không tìm thấy bài viết nào cho bộ lọc hiện tại.
          </div>
        )}

        {spotlightNews.length > 0 && (
          <section className="mb-10">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="m-0 text-2xl font-bold text-slate-900">Radar nổi bật</h2>
              <p className="m-0 text-sm text-slate-500">Góc nhìn nhanh từ ban biên tập</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
              {spotlightNews.map((news, idx) => (
                <button
                  key={news._id}
                  type="button"
                  onClick={() => navigate(`/news/${news.slug}`)}
                  className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white text-left shadow-sm"
                >
                  <div className="absolute right-3 top-3 rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white">
                    #{idx + 1}
                  </div>
                  <div className="h-[180px] overflow-hidden bg-blue-100">
                    <img
                      src={news.thumbnail}
                      alt={news.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-blue-600">
                      {news.category}
                    </p>
                    <h3 className="mb-2 mt-1 line-clamp-2 text-[21px] font-bold leading-tight text-slate-900">
                      {news.title}
                    </h3>
                    <p className="m-0 line-clamp-2 text-[13px] text-slate-500">{news.shortDescription}</p>
                    <div className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-600">
                      <Eye size={12} /> {news.views || 0} lượt xem
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {feedNews.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-slate-900 md:mb-5">Dòng tin công nghệ</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
              {feedNews.map((news, idx) => {
                const isLargeCard = idx % 4 === 0 || idx % 4 === 3;

                return (
                  <button
                    key={news._id}
                    type="button"
                    onClick={() => navigate(`/news/${news.slug}`)}
                    className={`group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                      isLargeCard ? "md:col-span-7" : "md:col-span-5"
                    }`}
                  >
                    <div className="flex h-full flex-col gap-3 sm:flex-row">
                      <div
                        className={`${
                          isLargeCard ? "sm:w-[44%]" : "sm:w-[38%]"
                        } shrink-0 overflow-hidden rounded-xl bg-blue-100`}
                      >
                        <img
                          src={news.thumbnail}
                          alt={news.title}
                          loading="lazy"
                          decoding="async"
                          className="h-full min-h-[150px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                        <div>
                          <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-blue-600">
                            {news.category}
                          </span>
                          <h3
                            className={`mb-2 mt-2 line-clamp-2 font-bold leading-snug text-slate-900 ${
                              isLargeCard ? "text-[24px]" : "text-[20px]"
                            }`}
                          >
                            {news.title}
                          </h3>
                          <p className="m-0 line-clamp-3 text-[14px] text-slate-500">{news.shortDescription}</p>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={13} /> {formatDate(news.createdAt)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Eye size={13} /> {news.views || 0}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock3 size={13} /> {estimateReadMinutes(news)} phút đọc
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default News;
