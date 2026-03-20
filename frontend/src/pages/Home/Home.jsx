import "./Home.css";

import Header from "../../components/Header/Header";
import Hero from "../../components/Hero/Hero";
import ProductGrid from "../../components/Product/ProductGrid";
import Footer from "../../components/Footer/Footer";
import Category from "../../components/Category/Category";
import Features from "../../components/Features/Features";
import Promotion from "../../components/Promotion/Promotion";
import AIRecommend from "../../components/AIRecommend/AIRecommend";

function Home() {
  return (
    <div className="home">
      <Header />
      <Hero />
      <Category />
      <AIRecommend />
      <Promotion />
      <ProductGrid />
      <Features />
      <Footer />
    </div>
  );
}

export default Home;