import "./Footer.css";
import { Twitter, Instagram, Linkedin, Zap, Smartphone, MapPin, Phone, Mail } from "lucide-react";

function Footer() {
  return (
    <footer className="footer">
      {/* Vành đai ánh sáng (Aesthetic Glow) */}
      <div className="footer-glow-left"></div>
      <div className="footer-glow-right"></div>

      {/* Trang trí điện thoại lơ lửng góc phải (Abstract) */}
      <div className="floating-phone-wrapper">
        <Smartphone className="floating-phone-icon" strokeWidth={1} />
      </div>

      <div className="footer-container">
        <div className="footer-grid">

          {/* Cột 1: Thông tin thương hiệu */}
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <Zap size={24} />
              <span>TechNova</span>
            </div>
            <p className="footer-desc">
              Tương lai công nghệ trong tầm tay bạn. Khám phá các thiết bị di động và đồ điện tử đẳng cấp nhất cùng TechNova.
            </p>
            <div className="socials">
              <a href="#"><Twitter size={18} /></a>
              <a href="#"><Instagram size={18} /></a>
              <a href="#"><Linkedin size={18} /></a>
            </div>
          </div>

          {/* Cột 2: Khám phá */}
          <div className="footer-col">
            <h3>Khám phá siêu phẩm</h3>
            <a href="/phones">Điện thoại di động</a>
            <a href="/electronics">Máy tính & Đồ điện tử</a>
            <a href="/accessories">Phụ kiện công nghệ</a>
            <a href="/promotions">Săn sale chớp nhoáng</a>
          </div>

          {/* Cột 3: Liên hệ */}
          <div className="footer-col">
            <h3>Kết nối với chúng tôi</h3>
            <div className="contact-info">
              <div className="contact-item">
                <MapPin size={18} />
                <span>123 Đường Công Nghệ, Quận 1, TP.HCM</span>
              </div>
              <div className="contact-item">
                <Phone size={18} />
                <span>Hotline: 1900 1234 (Miễn phí)</span>
              </div>
              <div className="contact-item">
                <Mail size={18} />
                <span>Email: contact@technova.vn</span>
              </div>
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          <p>© 2024 TechNova Inc. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Chính sách bảo mật</a>
            <a href="#">Điều khoản bảo hành</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;