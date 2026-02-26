import React from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./News.css";
import {
  Calendar,
  User,
  ArrowRight,
  Globe,
  Youtube,
  Share2
} from "lucide-react";

const featuredNews = [
  {
    category: "Đánh giá",
    title: "Đánh giá chi tiết iPhone 15 Pro sau 6 tháng sử dụng",
    desc: "Liệu khung viền titan và cổng USB-C có thực sự tạo nên sự khác biệt?",
  },
  {
    category: "Mẹo hay",
    title: "10 Mẹo sử dụng Android cực hữu ích bạn không nên bỏ qua",
    desc: "Tối ưu hóa pin và tùy chỉnh giao diện chuyên nghiệp.",
  },
  {
    category: "Thị trường",
    title: "Toàn cảnh thị trường smartphone 2024: Cuộc đua AI",
    desc: "Samsung và Apple đang làm gì để giữ vững vị thế?",
  },
];

const latestNews = [
  "Lộ diện AirPods Pro 3 với tính năng theo dõi sức khỏe",
  "Google I/O 2024: Những cập nhật quan trọng về AI",
  "Nvidia RTX 50-series: Sức mạnh đồ họa vượt giới hạn",
  "Top 5 laptop mỏng nhẹ tốt nhất cho sinh viên 2024",
];

function News() {
  return (
    <div className="news-page">
      <Header />

      <div className="container">

        {/* Hero */}
        <div className="hero-news">
          <div className="hero-overlay">
            <span className="hero-tag">Xu hướng</span>
            <h1>
              Tương lai của Công nghệ: Những đột phá trong năm 2024
            </h1>
            <p>
              Khám phá những công nghệ mới nhất từ AI, Web3 đến thiết bị di động gập.
            </p>

            <div className="hero-meta">
              <span><Calendar size={14} /> 20/05/2024</span>
              <span><User size={14} /> Nguyễn Văn A</span>
            </div>
          </div>
        </div>

        {/* Featured */}
        <section className="section">
          <div className="section-header">
            <h2>Tin tức nổi bật</h2>
            <button className="view-all">
              Xem tất cả <ArrowRight size={16} />
            </button>
          </div>

          <div className="featured-grid">
            {featuredNews.map((news, index) => (
              <div key={index} className="news-card">
                <div className="news-image"></div>
                <div className="news-content">
                  <span className="news-category">
                    {news.category}
                  </span>
                  <h3>{news.title}</h3>
                  <p>{news.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Latest */}
        <section className="section">
          <h2 className="section-title">Tin công nghệ mới nhất</h2>

          <div className="latest-grid">
            {latestNews.map((title, index) => (
              <div key={index} className="latest-card">
                <div className="latest-overlay">
                  <h4>{title}</h4>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter */}
        <div className="newsletter">
          <div className="newsletter-text">
            <h2>Đăng ký nhận bản tin công nghệ</h2>
            <p>
              Nhận tin tức mới nhất và ưu đãi đặc quyền hàng tuần.
            </p>
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