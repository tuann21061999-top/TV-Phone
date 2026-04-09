import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { Calendar, User, Eye, ChevronRight, Clock } from "lucide-react";
import { toast } from "sonner";

function NewsDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`http://localhost:5000/api/news/${slug}`);
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

    if (loading) return (
    <div className="text-center mt-24 text-slate-500">Đang tải bài viết...</div>
    );
    if (!article) return (
    <div className="text-center mt-24 text-slate-500">Không tìm thấy bài viết</div>
    );

    const createdDate = new Date(article.createdAt);
    const dateStr = createdDate.toLocaleDateString("vi-VN");
    const timeStr = createdDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });


    return (
    <div className="bg-slate-50 min-h-screen">
        <Header />

        <div className="max-w-[820px] mx-auto px-5 py-10">

        {/* BREADCRUMB */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6 flex-wrap">
            <Link to="/" className="text-blue-500 no-underline hover:underline">Trang chủ</Link>
            <ChevronRight size={14} color="#94a3b8" />
            <Link to="/news" className="text-blue-500 no-underline hover:underline">Tin tức</Link>
            <ChevronRight size={14} color="#94a3b8" />
            <span className="text-slate-800 font-medium truncate max-w-[300px]">{article.title}</span>
        </nav>

        {/* ARTICLE */}
        <article className="bg-white rounded-2xl p-10 shadow-sm md:p-5">

            {/* HEADER */}
            <header>
            <span className="inline-block bg-blue-50 text-blue-500 px-3.5 py-1.5 rounded-full text-[13px] font-semibold mb-4">
                {article.category}
            </span>
            <h1 className="text-[30px] md:text-[22px] font-extrabold text-slate-900 leading-[1.35] mb-5">
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

            {/* CONTENT BLOCKS */}
            <div className="mt-4 space-y-6">
            {article.contentBlocks?.map((block, idx) => (
                <div key={idx}>
                {block.type === "text" ? (
                    <div
                    className="text-[17px] leading-[1.8] text-slate-600
                        [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-3
                        [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-slate-800 [&_h3]:mt-6 [&_h3]:mb-2.5
                        [&_p]:mb-4
                        [&_ul]:pl-6 [&_ul]:mb-4
                        [&_ol]:pl-6 [&_ol]:mb-4
                        [&_li]:mb-1.5
                        [&_a]:text-blue-500 [&_a]:underline"
                    dangerouslySetInnerHTML={{ __html: block.value }}
                    />
                ) : (
                    <div className="text-center">
                    <img
                        src={block.value} alt={`Hình ${idx + 1}`}
                        className="max-w-full rounded-xl shadow-sm"
                    />
                    </div>
                )}
                </div>
            ))}
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
        </article>

        {/* RELATED ARTICLES */}
        {relatedArticles.length > 0 && (
            <section className="mt-12">
            <h2 className="text-xl font-bold text-slate-800 mb-5">Bài viết liên quan</h2>
            <div className="grid grid-cols-2 md:grid-cols-2 sm:grid-cols-1 gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
                {relatedArticles.map((ra) => (
                <div
                    key={ra._id}
                    onClick={() => navigate(`/news/${ra.slug}`)}
                    className="bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md"
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
