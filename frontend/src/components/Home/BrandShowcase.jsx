import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BRAND_LOGOS = {
  Apple: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
  Samsung: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Samsung_wordmark.svg",
  Xiaomi: "https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg",
  OPPO: "https://upload.wikimedia.org/wikipedia/commons/b/b8/OPPO_Logo.svg",
  Sony: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg",
  LG: "https://upload.wikimedia.org/wikipedia/commons/b/bf/LG_logo_%282015%29.svg",
  JBL: "https://upload.wikimedia.org/wikipedia/commons/1/1c/JBL_logo.svg",
  Logitech: "https://upload.wikimedia.org/wikipedia/commons/1/17/Logitech_logo.svg",
  Dell: "https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg",
  Honor: "https://cdn.brandfetch.io/idd4Y5GEOX/w/820/h/158/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1768748674165",
  Oneplus: "https://cdn.brandfetch.io/idi46coDvW/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1676970640529",
  Realme: "https://cdn.brandfetch.io/idYXSDVD9U/w/820/h/246/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1772356964254",
  Vivo: "https://cdn.brandfetch.io/idYVgdb4Ec/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1741146580161",
  Huawei: "https://cdn.brandfetch.io/idLAJ42baU/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1676041841613",
  Anker: "https://cdn.brandfetch.io/idZx11xCTE/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1761300319013",
  Baseus: "https://cdn.brandfetch.io/idKP0ip8J0/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1772393284526",
  Ugreen: "https://cdn.brandfetch.io/id9VSUaooR/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1772500945292",
  Spigen: "https://cdn.brandfetch.io/idWZF0bHjx/w/820/h/926/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1768458590044",
};

function BrandShowcase({ preloadedProducts, isProductsReady = false }) {
  const [brands, setBrands] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const applyBrands = (data) => {
      if (!Array.isArray(data)) return;

      const allBrands = [...new Set(data.map((p) => p.brand).filter(Boolean))].sort();
      const brandsWithLogos = allBrands.filter((b) => BRAND_LOGOS[b]);
      setBrands(brandsWithLogos.length > 0 ? brandsWithLogos : allBrands.slice(0, 12));
    };

    if (Array.isArray(preloadedProducts)) {
      if (!isProductsReady) return;
      applyBrands(preloadedProducts);
      return;
    }

    const fetchBrands = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
        applyBrands(data);
      } catch (error) {
        console.error("Lỗi lấy thương hiệu:", error);
      }
    };

    fetchBrands();
  }, [preloadedProducts, isProductsReady]);

  if (brands.length === 0) return null;

  const handleBrandClick = (brand) => {
    navigate(`/search?q=${encodeURIComponent(brand)}`);
  };

  return (
    <section className="w-full max-w-[1400px] mx-auto my-8 md:my-14 px-4 md:px-10 font-sans">
      {/* HEADER */}
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 m-0 mb-1.5">Thương hiệu nổi bật</h2>
        <p className="text-[13px] md:text-sm text-slate-500 m-0">Hợp tác cùng các nhãn hàng công nghệ hàng đầu thế giới</p>
      </div>

      {/* BRAND GRID: Cuộn ngang trên mobile, grid trên desktop */}
      <div className="flex overflow-x-auto md:grid md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4 pb-3 md:pb-0 scrollbar-hide [&::-webkit-scrollbar]:hidden snap-x">
        {brands.map((brand) => {
          const logoSrc = BRAND_LOGOS[brand];
          return (
            <div
              key={brand}
              onClick={() => handleBrandClick(brand)}
              className="snap-start shrink-0 w-[100px] md:w-auto bg-white border border-slate-100 rounded-2xl p-4 md:p-5 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-blue-200 group"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center overflow-hidden">
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt={brand}
                    className="max-w-full max-h-full object-contain grayscale opacity-60 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    {brand.charAt(0)}
                  </div>
                )}
              </div>
              <span className="text-[11px] md:text-[12px] font-semibold text-slate-500 text-center group-hover:text-blue-600 transition-colors">
                {brand}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default BrandShowcase;
