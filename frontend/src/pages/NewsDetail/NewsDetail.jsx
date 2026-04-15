import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { Calendar, User, Eye, ChevronRight, Clock, List, ArrowUp } from "lucide-react";
import { toast } from "sonner";

function NewsDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTocId, setActiveTocId] = useState("");

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/news/${slug}`);
                setArticle(data.article);
                setRelatedArticles(data.relatedArticles || []);
            } catch (error) {
                toast.error("Không tìm thấy bài viết");
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
        window.scrollTo(0, 0);
    }, [slug]);

    // Tạo mục lục từ các heading blocks
    const tocItems = useMemo(() => {
        if (!article?.contentBlocks) return [];
        return article.contentBlocks
            .map((block, idx) => {
                if (block.type === "heading" && block.value?.trim()) {
                    return { id: `section-${idx}`, title: block.value.trim(), idx };
                }
                return null;
            })
            .filter(Boolean);
    }, [article]);

    // Theo dõi scroll để highlight mục lục đang xem
    useEffect(() => {
        if (tocItems.length === 0) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveTocId(entry.target.id);
                    }
                });
            },
            { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
        );
        tocItems.forEach((item) => {
            const el = document.getElementById(item.id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [tocItems]);

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    if (loading) return (
        <div className="text-center mt-24 text-slate-500 font-['Inter',sans-serif]">Đang tải bài viết...</div>
    );
    if (!article) return (
        <div className="text-center mt-24 text-slate-500 font-['Inter',sans-serif]">Không tìm thấy bài viết</div>
    );

    const createdDate = new Date(article.createdAt);
    const dateStr = createdDate.toLocaleDateString("vi-VN");
    const timeStr = createdDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

    const hasToc = tocItems.length > 0;

    return (
    <div className="bg-slate-50 min-h-screen font-['Inter',sans-serif]">
        <Header />

        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-10">

        {/* BREADCRUMB */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-5 flex-wrap">
            <Link to="/" className="text-blue-500 no-underline hover:underline">Trang chủ</Link>
            <ChevronRight size={14} color="#94a3b8" />
            <Link to="/news" className="text-blue-500 no-underline hover:underline">Tin tức</Link>
            <ChevronRight size={14} color="#94a3b8" />
            <span className="text-slate-800 font-medium truncate max-w-[300px]">{article.title}</span>
        </nav>

        {/* LAYOUT: Article + TOC Sidebar */}
        <div className={`flex gap-8 ${hasToc ? "flex-col lg:flex-row" : ""}`}>

            {/* MAIN ARTICLE */}
            <article className={`bg-white rounded-2xl p-5 md:p-10 shadow-sm border border-slate-100 ${hasToc ? "flex-1 min-w-0" : "max-w-[820px] mx-auto w-full"}`}>

                {/* HEADER */}
                <header>
                <span className="inline-block bg-blue-50 text-blue-600 px-3.5 py-1.5 rounded-full text-[13px] font-semibold mb-4">
                    {article.category}
                </span>
                <h1 className="text-[22px] md:text-[30px] font-extrabold text-slate-900 leading-[1.35] mb-5 tracking-[-0.01em]">
                    {article.title}
                </h1>
                <div className="flex items-center gap-5 text-slate-500 text-sm border-b border-slate-100 pb-5 flex-wrap">
                    {[
                    { icon: <User size={16} />,      text: article.author },
                    { icon: <Calendar size={16} />,  text: dateStr },
                    { icon: <Clock size={16} />,     text: timeStr },
                    { icon: <Eye size={16} />,       text: `${article.views} lượt xem` },
                    ].map(({ icon, text }) => (
                    <span key={text} className="flex items-center gap-1.5">{icon} {text}</span>
                    ))}
                </div>
                </header>

                {/* THUMBNAIL */}
                <div className="my-7 rounded-xl overflow-hidden">
                <img
                    src={article.thumbnail} alt={article.title}
                    className="w-full max-h-[450px] object-contain bg-slate-100"
                />
                </div>

                {/* INLINE TOC (Mobile only - hiện trước nội dung) */}
                {hasToc && (
                    <div className="lg:hidden mb-8 bg-blue-50/60 border border-blue-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <List size={18} className="text-blue-600" />
                            <h3 className="m-0 text-[15px] font-bold text-slate-800">Mục lục bài viết</h3>
                        </div>
                        <ul className="list-none p-0 m-0 flex flex-col gap-1">
                            {tocItems.map((item, i) => (
                                <li key={item.id}>
                                    <button
                                        type="button"
                                        onClick={() => scrollToSection(item.id)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer border-none bg-transparent
                                            ${activeTocId === item.id ? "text-blue-600 bg-blue-100/80 font-semibold" : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"}`}
                                    >
                                        {i + 1}. {item.title}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* CONTENT BLOCKS */}
                <div className="mt-4 space-y-5">
                {article.contentBlocks?.map((block, idx) => {
                    // Block loại heading -> mục chính
                    if (block.type === "heading") {
                        const tocId = `section-${idx}`;
                        return (
                            <h2
                                key={idx}
                                id={tocId}
                                className="text-[20px] md:text-[24px] font-bold text-slate-900 leading-snug mt-10 mb-3 pb-2 border-b-2 border-blue-500/30 scroll-mt-24"
                            >
                                {block.value}
                            </h2>
                        );
                    }
                    
                    if (block.type === "text") {
                        return (
                            <div
                                key={idx}
                                className="text-[16px] md:text-[17px] leading-[1.85] text-slate-600
                                    [&_h2]:text-[20px] [&_h2]:md:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-3
                                    [&_h3]:text-[18px] [&_h3]:md:text-xl [&_h3]:font-semibold [&_h3]:text-slate-800 [&_h3]:mt-6 [&_h3]:mb-2.5
                                    [&_p]:mb-4
                                    [&_ul]:pl-6 [&_ul]:mb-4
                                    [&_ol]:pl-6 [&_ol]:mb-4
                                    [&_li]:mb-1.5
                                    [&_a]:text-blue-500 [&_a]:underline
                                    [&_strong]:text-slate-800 [&_strong]:font-semibold"
                                dangerouslySetInnerHTML={{ __html: block.value }}
                            />
                        );
                    }

                    // Image block
                    return (
                        <div key={idx} className="text-center my-2">
                            <img
                                src={block.value} alt={`Hình ${idx + 1}`}
                                className="max-w-full rounded-xl shadow-sm mx-auto"
                            />
                        </div>
                    );
                })}
                </div>

                {/* LINKED PRODUCT */}
                {article.relatedProduct && (
                <div className="mt-10 pt-7 border-t border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">📱 Sản phẩm liên quan</h3>
                    <div
                    onClick={() => navigate(`/product/${article.relatedProduct.slug}`)}
                    className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer transition-all hover:border-blue-400 hover:shadow-[0_4px_12px_rgba(59,130,246,0.12)]"
                    >
                    <img
                        src={article.relatedProduct.colorImages?.[0]?.images?.[0] || ""}
                        alt={article.relatedProduct.name}
                        className="w-20 h-20 object-contain rounded-lg bg-white"
                    />
                    <div className="flex flex-col gap-1.5">
                        <strong className="text-base text-slate-800">{article.relatedProduct.name}</strong>
                        <span className="text-[13px] text-blue-500 font-medium">Xem sản phẩm →</span>
                    </div>
                    </div>
                </div>
                )}

                {/* Nút về đầu trang */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="flex items-center gap-2 text-[13px] text-slate-500 hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-none font-medium"
                    >
                        <ArrowUp size={16} /> Về đầu trang
                    </button>
                </div>
            </article>

            {/* TOC SIDEBAR (Desktop only) */}
            {hasToc && (
                <aside className="hidden lg:block w-[260px] shrink-0">
                    <div className="sticky top-20 bg-white rounded-xl border border-slate-200 shadow-sm p-5 max-h-[calc(100vh-120px)] overflow-y-auto">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                            <List size={18} className="text-blue-600 shrink-0" />
                            <h3 className="m-0 text-[14px] font-bold text-slate-800">Mục lục</h3>
                        </div>
                        <ul className="list-none p-0 m-0 flex flex-col gap-0.5">
                            {tocItems.map((item, i) => (
                                <li key={item.id}>
                                    <button
                                        type="button"
                                        onClick={() => scrollToSection(item.id)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all cursor-pointer border-none bg-transparent leading-snug
                                            ${activeTocId === item.id 
                                                ? "text-blue-600 bg-blue-50 font-semibold border-l-[3px] border-blue-600 pl-[9px]" 
                                                : "text-slate-600 hover:text-blue-600 hover:bg-slate-50 font-medium"}`}
                                    >
                                        {i + 1}. {item.title}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>
            )}

        </div>

        {/* RELATED ARTICLES */}
        {relatedArticles.length > 0 && (
            <section className="mt-12">
            <h2 className="text-xl font-bold text-slate-800 mb-5">Bài viết liên quan</h2>
            <div className="grid grid-cols-2 md:grid-cols-2 sm:grid-cols-1 gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
                {relatedArticles.map((ra) => (
                <div
                    key={ra._id}
                    onClick={() => navigate(`/news/${ra.slug}`)}
                    className="bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md border border-slate-100"
                >
                    <div
                    className="h-[140px] bg-cover bg-center bg-slate-200"
                    style={{ backgroundImage: `url(${ra.thumbnail})` }}
                    />
                    <div className="p-3.5">
                    <span className="inline-block text-[11px] font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-[10px] mb-2">
                        {ra.category}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-800 leading-snug mb-1.5 line-clamp-2">{ra.title}</h4>
                    <p className="text-xs text-slate-400 m-0">{new Date(ra.createdAt).toLocaleDateString("vi-VN")}</p>
                    </div>
                </div>
                ))}
            </div>
            </section>
        )}
        </div>

        <Footer />
    </div>
    );
}

export default NewsDetail;
