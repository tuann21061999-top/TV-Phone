import "./Promotion.css";
import Countdown from "../Countdown/Countdown";

function Promotion() {
  return (
    <section className="promotion">
      <div>
        <p className="small">ĐANG DIỄN RA</p>
        <h2>Ưu đãi sốc</h2>
        <p>Giảm giá lên đến 40% cho phụ kiện cao cấp.</p>
      </div>

      <Countdown />

      <button className="view-btn">Xem ưu đãi</button>
    </section>
  );
}

export default Promotion;