import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { Calendar, User, Eye, ChevronRight, Clock } from "lucide-react";
import { toast } from "sonner";
import "./NewsDetail.css";

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

    if (loading) return <div className="loading" style={{ textAlign: "center", marginTop: "100px" }}>Đang tải bài viết...</div>;
    if (!article) return <div className="error" style={{ textAlign: "center", marginTop: "100px" }}>Không tìm thấy bài viết</div>;

    const createdDate = new Date(article.createdAt);
    const dateStr = createdDate.toLocaleDateString("vi-VN");
    const timeStr = createdDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

    return (
        <div className="news-detail-page">
            <Header />

            <div className="news-detail-container">
                <nav className="breadcrumb">
                    <Link to="/">Trang chủ</Link> <ChevronRight size={14} color="#94a3b8" />
                    <Link to="/news">Tin tức</Link> <ChevronRight size={14} color="#94a3b8" />
                    <span className="current">{article.title}</span>
                </nav>

                <article className="article-wrapper">
                    <header className="article-header">
                        <span className="article-category">{article.category}</span>
                        <h1 className="article-title">{article.title}</h1>

                        <div className="article-meta">
                            <span className="meta-item"><User size={16} /> {article.author}</span>
                            <span className="meta-item"><Calendar size={16} /> {dateStr}</span>
                            <span className="meta-item"><Clock size={16} /> {timeStr}</span>
                            <span className="meta-item"><Eye size={16} /> {article.views} lượt xem</span>
                        </div>
                    </header>

                    {/* Thumbnail */}
                    <div className="article-thumbnail">
                        <img src={article.thumbnail} alt={article.title} />
                    </div>

                    {/* Content Blocks */}
                    <div className="article-body">
                        {article.contentBlocks?.map((block, idx) => (
                            <div key={idx} className="content-block">
                                {block.type === "text" ? (
                                    <div className="block-text" dangerouslySetInnerHTML={{ __html: block.value }} />
                                ) : (
                                    <div className="block-image">
                                        <img src={block.value} alt={`Hình ${idx + 1}`} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Linked Product */}
                    {article.relatedProduct && (
                        <div className="linked-product-section">
                            <h3>📱 Sản phẩm liên quan</h3>
                            <div
                                className="linked-product-card"
                                onClick={() => navigate(`/product/${article.relatedProduct.slug}`)}
                            >
                                <img
                                    src={article.relatedProduct.colorImages?.[0]?.images?.[0] || ""}
                                    alt={article.relatedProduct.name}
                                    className="linked-product-img"
                                />
                                <div className="linked-product-info">
                                    <strong>{article.relatedProduct.name}</strong>
                                    <span className="view-product-link">Xem sản phẩm →</span>
                                </div>
                            </div>
                        </div>
                    )}
                </article>

                {/* Related Articles */}
                {relatedArticles.length > 0 && (
                    <section className="related-articles-section">
                        <h2>Bài viết liên quan</h2>
                        <div className="related-grid">
                            {relatedArticles.map((ra) => (
                                <div key={ra._id} className="related-card" onClick={() => navigate(`/news/${ra.slug}`)}>
                                    <div className="related-thumb" style={{ backgroundImage: `url(${ra.thumbnail})` }} />
                                    <div className="related-info">
                                        <span className="related-category">{ra.category}</span>
                                        <h4>{ra.title}</h4>
                                        <p className="related-date">{new Date(ra.createdAt).toLocaleDateString("vi-VN")}</p>
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
