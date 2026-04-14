
import { useEffect } from "react";
import Header from "../../components/Header/Header";
import Banner from "../../components/Banner/Banner";
import ProductGrid from "../../components/Product/ProductGrid";
import Footer from "../../components/Footer/Footer";
import Category from "../../components/Category/Category";
import Features from "../../components/Features/Features";
import Promotion from "../../components/Promotion/Promotion";
import AIRecommend from "../../components/AIRecommend/AIRecommend";
import AIAccessoryRecommend from "../../components/AIAccessoryRecommend/AIAccessoryRecommend";
import NewArrivals from "../../components/NewArrivals/NewArrivals";
import BrandShowcase from "../../components/BrandShowcase/BrandShowcase";
import CustomerReviews from "../../components/CustomerReviews/CustomerReviews";
import LatestNews from "../../components/LatestNews/LatestNews";
import GlobalArticle from "../../components/GlobalArticle/GlobalArticle";

function Home() {
  // SEO: Đặt document title
  useEffect(() => {
    document.title = "V&T Nexis – Điện thoại, Phụ kiện & Đồ điện tử chính hãng";
    
    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = "V&T Nexis – Cửa hàng công nghệ hàng đầu. Mua sắm điện thoại, phụ kiện, đồ điện tử chính hãng với giá tốt nhất. Giao hàng nhanh, bảo hành 12 tháng.";

    return () => {
      document.title = "V&T Nexis";
    };
  }, []);

  return (
    <div className="bg-[#f5f7fb] font-sans w-full">
      <Header />
      <Banner />
      <Category />
      <AIRecommend />
      <AIAccessoryRecommend />
      <NewArrivals />
      <ProductGrid />
      <CustomerReviews />
      <BrandShowcase />
      <LatestNews />
      <Features />
      <GlobalArticle pageCode="home" />
      <Footer />
    </div>
  );
}

export default Home;