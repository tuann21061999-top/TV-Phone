import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./ContactPage.css";

function ContactPage() {
  return (
    <>
      <Header />

      <div className="contact-page">
        <div className="contact-header">
          <h1>Liên hệ với chúng tôi</h1>
          <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7</p>
        </div>

        <div className="contact-container">
          {/* Thông tin liên hệ */}
          <div className="contact-info">
            <h3>Thông tin liên hệ</h3>
            <p>📍 12 Nguyễn Văn Bảo, Gò Vấp, TP.HCM</p>
            <p>📞 1900 1234</p>
            <p>📧 support@technova.vn</p>
            <p>🕒 8:00 - 22:00 (Thứ 2 - Chủ nhật)</p>
          </div>

          {/* Form liên hệ */}
          <div className="contact-form">
            <h3>Gửi tin nhắn</h3>

            <form>
              <input type="text" placeholder="Họ và tên" required />
              <input type="email" placeholder="Email" required />
              <input type="text" placeholder="Số điện thoại" />
              <textarea placeholder="Nội dung..." rows="5" required></textarea>

              <button type="submit">Gửi liên hệ</button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default ContactPage;