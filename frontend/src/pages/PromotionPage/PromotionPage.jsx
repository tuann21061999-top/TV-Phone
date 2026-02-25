import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Countdown from "../../components/Countdown/Countdown";
import "./PromotionPage.css";

function PromotionPage() {
  return (
    <>
      <Header />

      <div className="promotion-page">
        <div className="promo-banner">
          <p className="small">ĐANG DIỄN RA</p>
          <h1>Ưu đãi sốc</h1>
          <p>Giảm giá lên đến 40% cho phụ kiện cao cấp.</p>

          <Countdown />

          <button className="view-btn">Mua ngay</button>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default PromotionPage;