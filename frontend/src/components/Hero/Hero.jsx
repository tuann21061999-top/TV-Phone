import "./Hero.css";
import phoneImg from "../../assets/honorwin.webp";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-left">
        <span className="badge">SẢN PHẨM MỚI</span>
        <h1>
          Điện thoại mới nhất – <span>Giá tốt nhất</span>
        </h1>
        <p>
          Nâng tầm trải nghiệm công nghệ với các thiết bị flagship mới nhất,
          sở hữu camera chuyên nghiệp.
        </p>

        <div className="buttons">
          <button className="primary">Mua ngay</button>
          <button className="secondary">Xem chi tiết</button>
        </div>
      </div>

      <img src={phoneImg} alt="phone" />
    </section>
  );
}

export default Hero;