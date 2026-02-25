import "./Footer.css";
import { Twitter, Instagram, Linkedin, Send, Zap } from "lucide-react";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-grid">

          {/* Column 1 */}
          <div className="footer-col">
            <div className="footer-logo">
              <Zap size={22} />
              <span>TechNova</span>
            </div>

            <p className="footer-desc">
              Điểm đến tin cậy cho các thiết bị công nghệ và phụ kiện mới nhất.
              TechNova mang tương lai công nghệ đến gần bạn hơn.
            </p>

            <div className="socials">
              <a href="#"><Twitter size={18} /></a>
              <a href="#"><Instagram size={18} /></a>
              <a href="#"><Linkedin size={18} /></a>
            </div>
          </div>

          {/* Column 2 */}
          <div className="footer-col">
            <h3>Liên kết nhanh</h3>
            <a href="#">Về chúng tôi</a>
            <a href="#">Liên hệ</a>
            <a href="#">Tuyển dụng</a>
            <a href="#">Tin tức</a>
          </div>

          {/* Column 3 */}
          <div className="footer-col">
            <h3>Thông tin công ty</h3>
            <a href="#">Câu hỏi thường gặp</a>
            <a href="#">Chính sách đổi trả</a>
            <a href="#">Thông tin giao hàng</a>
            <a href="#">Theo dõi đơn hàng</a>
          </div>

          {/* Column 4 */}
          <div className="footer-col">
            <h3>Cập nhật tin tức</h3>
            <p className="footer-desc">
              Đăng ký bản tin để nhận các ưu đãi độc quyền.
            </p>

            <div className="newsletter">
              <input type="email" placeholder="Email của bạn" />
              <button>
                <Send size={18} />
              </button>
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          <p>© 2024 TechNova Inc. Bảo lưu mọi quyền.</p>
          <div>
            <a href="#">Chính sách bảo mật</a>
            <a href="#">Điều khoản dịch vụ</a>
            <a href="#">Cài đặt Cookie</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;