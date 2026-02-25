import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ProductGrid from "../../components/Product/ProductGrid";
import "./PhonePage.css";

function PhonePage() {
  return (
    <>
      <Header />

      <div className="phone-page">
        <div className="phone-header">
          <h1 className="phone-title">Danh sách điện thoại</h1>
        </div>

        <ProductGrid />
      </div>

      <Footer />
    </>
  );
}

export default PhonePage;