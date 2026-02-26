import React from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./ContactPage.css";
import {
  Search,
  MapPin,
  Phone,
  Mail,
  Send,
  Navigation,
  Plus,
  Minus,
  Clock
} from "lucide-react";

function ContactPage() {
  return (
    <div className="contact-page">
      <Header />

      <div className="contact-container">
        <div className="breadcrumb">
        </div>

        {/* Title */}
        <div className="contact-header">
          <h1>Liên hệ với chúng tôi</h1>
          <p>
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn 24/7.
            Hãy gửi lời nhắn nếu bạn có bất kỳ thắc mắc nào.
          </p>
        </div>

        <div className="contact-layout">

          {/* LEFT SIDE */}
          <div className="contact-left">

            {/* Info Cards */}
            <div className="contact-cards">
              <div className="contact-card">
                <MapPin size={20} />
                <h3>Địa chỉ</h3>
                <p>123 Đường Lê Lợi, Quận 1, TP.HCM</p>
              </div>

              <div className="contact-card">
                <Phone size={20} />
                <h3>Hotline</h3>
                <p>1900 1234 567</p>
                <span>Hỗ trợ 24/7</span>
              </div>

              <div className="contact-card">
                <Mail size={20} />
                <h3>Email</h3>
                <p>support@mobilestore.vn</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form">
              <h2>Gửi tin nhắn cho chúng tôi</h2>

              <form>
                <div className="form-row">
                  <div className="form-group">
                    <label>Họ và tên</label>
                    <input type="text" placeholder="Nguyễn Văn A" />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" placeholder="name@example.com" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Chủ đề</label>
                  <input type="text" placeholder="Vấn đề cần hỗ trợ" />
                </div>

                <div className="form-group">
                  <label>Lời nhắn</label>
                  <textarea rows="5" placeholder="Chúng tôi có thể giúp gì cho bạn?" />
                </div>

                <button type="button" className="send-btn">
                  <Send size={18} />
                  Gửi tin nhắn
                </button>
              </form>
            </div>

          </div>

          {/* RIGHT SIDE - MAP */}
          <div className="contact-right">
            <h3>Vị trí của chúng tôi</h3>

            <div className="map-wrapper">

              <div className="map-search">
                <Search size={14} />
                <input placeholder="Tìm cửa hàng..." />
              </div>

              <div className="map-controls">
                <button><Plus size={16} /></button>
                <button><Minus size={16} /></button>
                <button><Navigation size={16} /></button>
              </div>

              <div className="map-card">
                <div className="status">
                  <span className="dot"></span>
                  Cửa hàng trung tâm
                </div>
                <p>
                  <Clock size={12} />
                  Mở cửa: 08:00 - 21:00 hàng ngày
                </p>
              </div>

              <div className="map-marker">
                MobileStore Lê Lợi
              </div>

            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ContactPage;