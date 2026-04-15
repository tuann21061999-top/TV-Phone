
import { useEffect, useState } from "react";
import axios from "axios";
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
import LatestNews from "../../components/LatestNews/LatestNews";
import GlobalArticle from "../../components/GlobalArticle/GlobalArticle";

function Home() {
  const [homeProducts, setHomeProducts] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [isProductsReady, setIsProductsReady] = useState(false);

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

  useEffect(() => {
    let isCancelled = false;

    const fetchHomeSharedData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : null;

        const productsPromise = axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
        const favoritesPromise = headers
          ? axios.get(`${import.meta.env.VITE_API_URL}/api/favorites`, { headers })
          : Promise.resolve(null);

        const productsRes = await productsPromise;

        if (isCancelled) return;

        const allProducts = Array.isArray(productsRes.data)
          ? productsRes.data
          : productsRes.data?.data || [];

        setHomeProducts(allProducts);
        setIsProductsReady(true);

        const favoritesRes = await favoritesPromise;

        if (isCancelled) return;

        if (favoritesRes?.data) {
          setFavoriteIds(new Set(favoritesRes.data.map((item) => item._id)));
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu trang chủ:", error);
      } finally {
        if (!isCancelled) {
          setIsProductsReady(true);
        }
      }
    };

    fetchHomeSharedData();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div className="bg-[#f5f7fb] font-sans w-full">
      <Header preloadedProducts={homeProducts} isProductsReady={isProductsReady} />
      <Banner />
      <Category />
      <AIRecommend initialFavoriteIds={favoriteIds} />
      <AIAccessoryRecommend initialFavoriteIds={favoriteIds} />
      <NewArrivals
        preloadedProducts={homeProducts}
        initialFavoriteIds={favoriteIds}
        isProductsReady={isProductsReady}
      />
      <ProductGrid
        preloadedProducts={homeProducts}
        initialFavoriteIds={favoriteIds}
        isProductsReady={isProductsReady}
      />
      <BrandShowcase preloadedProducts={homeProducts} isProductsReady={isProductsReady} />
      <LatestNews />
      <Features />
      <GlobalArticle pageCode="home" />
      <Footer />
    </div>
  );
}

export default Home;