
import { useEffect, useState, lazy, Suspense } from "react";
import axios from "axios";
import Header from "../../components/Layout/Header";
import Banner from "../../components/Home/Banner";
import Category from "../../components/Home/Category";
import Footer from "../../components/Layout/Footer";

// Lazy load các section dưới nếp gấp
const AIRecommend = lazy(() => import("../../components/AI/AIRecommend"));
const AIAccessoryRecommend = lazy(() => import("../../components/AI/AIAccessoryRecommend"));
const NewArrivals = lazy(() => import("../../components/Home/NewArrivals"));
const ProductGrid = lazy(() => import("../../components/Product/ProductGrid"));
const BrandShowcase = lazy(() => import("../../components/Home/BrandShowcase"));
const LatestNews = lazy(() => import("../../components/Home/LatestNews"));
const Features = lazy(() => import("../../components/Home/Features"));
const GlobalArticle = lazy(() => import("../../components/Home/GlobalArticle"));

function Home() {
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  // SEO: Đặt document title
  useEffect(() => {
    document.title = "V&T Nexis – Điện thoại, Phụ kiện & Đồ điện tử chính hãng";
    
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
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/favorites`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setFavoriteIds(new Set(data.map((item) => item._id)));
        }
      } catch (error) {
        console.error("Lỗi tải yêu thích:", error);
      }
    };

    fetchFavorites();
  }, []);

  return (
    <div className="bg-[#f5f7fb] font-sans w-full">
      <Header />
      <Banner />
      <Category />
      
      <Suspense fallback={<div className="h-20" />}>
        <AIRecommend initialFavoriteIds={favoriteIds} />
      </Suspense>
      
      <Suspense fallback={<div className="h-20" />}>
        <AIAccessoryRecommend initialFavoriteIds={favoriteIds} />
      </Suspense>
      
      <Suspense fallback={<div className="h-40" />}>
        <NewArrivals initialFavoriteIds={favoriteIds} />
      </Suspense>

      <Suspense fallback={<div className="h-40" />}>
        <ProductGrid initialFavoriteIds={favoriteIds} />
      </Suspense>

      <Suspense fallback={<div className="h-20" />}>
        <BrandShowcase />
      </Suspense>

      <Suspense fallback={<div className="h-20" />}>
        <LatestNews />
      </Suspense>

      <Suspense fallback={<div className="h-20" />}>
        <Features />
      </Suspense>

      <Suspense fallback={<div className="h-40" />}>
        <GlobalArticle pageCode="home" />
      </Suspense>

      <Footer />
    </div>
  );
}

export default Home;