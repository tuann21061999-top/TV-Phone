
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
      
      <Suspense fallback={<div className="h-20" />}>
        <AIRecommend initialFavoriteIds={favoriteIds} />
      </Suspense>
      
      <Suspense fallback={<div className="h-20" />}>
        <AIAccessoryRecommend initialFavoriteIds={favoriteIds} />
      </Suspense>
      
      <Suspense fallback={<div className="h-40" />}>
        <NewArrivals
          preloadedProducts={homeProducts}
          initialFavoriteIds={favoriteIds}
          isProductsReady={isProductsReady}
        />
      </Suspense>

      <Suspense fallback={<div className="h-40" />}>
        <ProductGrid
          preloadedProducts={homeProducts}
          initialFavoriteIds={favoriteIds}
          isProductsReady={isProductsReady}
        />
      </Suspense>

      <Suspense fallback={<div className="h-20" />}>
        <BrandShowcase preloadedProducts={homeProducts} isProductsReady={isProductsReady} />
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