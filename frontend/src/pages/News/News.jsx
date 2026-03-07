import React, { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./News.css";
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
        const { data } = await axios.get("http://localhost:5000/api/news");
        setNewsList(data);
      } catch (error) {
        toast.error("Không thể tải danh sách tin tức");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) return <div className="loading" style={{ textAlign: "center", marginTop: "100px" }}>Đang tải tin tức...</div>;

  const filtered = activeCategory === "Tất cả"
    ? newsList
    : newsList.filter((n) => n.category === activeCategory);

  const heroNews = filtered.length > 0 ? filtered[0] : null;
  const featuredNews = filtered.slice(0, 3);
  const latestNews = filtered.slice(3, 9);

  return (
    <div className="news-page">
      <Header />

      <div className="container" style={{ maxWidth: "1200px" }}>

        {/* Category Tabs */}
        <div className="news-category-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`cat-tab ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Hero */}
        {heroNews && (
          <div className="hero-news" style={{ backgroundImage: `url(${heroNews.thumbnail})`, cursor: "pointer" }} onClick={() => navigate(`/news/${heroNews.slug}`)}>
            <div className="hero-overlay">
              <span className="hero-tag">{heroNews.category}</span>
              <h1>{heroNews.title}</h1>
              <p>{heroNews.shortDescription}</p>
              <div className="hero-meta">
                <span><Calendar size={14} /> {new Date(heroNews.createdAt).toLocaleDateString("vi-VN")}</span>
                <span><User size={14} /> {heroNews.author}</span>
              </div>
            </div>
          </div>
        )}

        {/* Featured */}
        {featuredNews.length > 0 && (
          <section className="section">
            <div className="section-header"><h2>Tin tức nổi bật</h2></div>
            <div className="featured-grid">
              {featuredNews.map((news) => (
                <div key={news._id} className="news-card" onClick={() => navigate(`/news/${news.slug}`)} style={{ cursor: "pointer" }}>
                  <div className="news-image" style={{ backgroundImage: `url(${news.thumbnail})` }}></div>
                  <div className="news-content">
                    <span className="news-category">{news.category}</span>
                    <h3>{news.title}</h3>
                    <p>{news.shortDescription}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Latest */}
        {latestNews.length > 0 && (
          <section className="section">
            <h2 className="section-title">Tin công nghệ mới nhất</h2>
            <div className="latest-grid">
              {latestNews.map((news) => (
                <div key={news._id} className="latest-card" style={{ backgroundImage: `url(${news.thumbnail})`, cursor: "pointer" }} onClick={() => navigate(`/news/${news.slug}`)}>
                  <div className="latest-overlay">
                    <h4>{news.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
            <p>Không tìm thấy bài viết nào cho danh mục này.</p>
          </div>
        )}

        {/* Newsletter */}
        <div className="newsletter">
          <div className="newsletter-text">
            <h2>Đăng ký nhận bản tin công nghệ</h2>
            <p>Nhận tin tức mới nhất và ưu đãi đặc quyền hàng tuần.</p>
          </div>
          <div className="newsletter-form">
            <input type="email" placeholder="Email của bạn" />
            <button>Đăng ký</button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default News;