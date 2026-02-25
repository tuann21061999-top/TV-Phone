import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ProductGrid from "../../components/Product/ProductGrid";
import "./AccessoryPage.css";

function AccessoryPage() {
  return (
    <div className="accessory-page">
      <Header />

      <div className="accessory-container">
        <h1 className="accessory-title">Danh sách phụ kiện</h1>
        <ProductGrid />
      </div>

      <Footer />
    </div>
  );
}

export default AccessoryPage;