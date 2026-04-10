
import { NavLink, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { ChevronDown, Home, LayoutGrid, Tag, Newspaper, Phone, ChevronRight } from "lucide-react";

const BRAND_LOGOS = {
  Apple: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
  Samsung: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Samsung_wordmark.svg",
  Xiaomi: "https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg",
  OPPO: "https://upload.wikimedia.org/wikipedia/commons/b/b8/OPPO_Logo.svg",
  Sony: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg",
  LG: "https://upload.wikimedia.org/wikipedia/commons/b/bf/LG_logo_%282015%29.svg",
  Panasonic: "https://upload.wikimedia.org/wikipedia/commons/3/30/Panasonic_logo.svg",
  JBL: "https://upload.wikimedia.org/wikipedia/commons/1/1c/JBL_logo.svg",
  Logitech: "https://upload.wikimedia.org/wikipedia/commons/1/17/Logitech_logo.svg",
  Dell: "https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg",
  HP: "https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg",
  Asus: "https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg",
  Acer: "https://upload.wikimedia.org/wikipedia/commons/0/00/Acer_2011.svg",
  Honor: "https://cdn.brandfetch.io/idd4Y5GEOX/w/820/h/158/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1768748674165",
  Oneplus: "https://cdn.brandfetch.io/idi46coDvW/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1676970640529",
  Realme: "https://cdn.brandfetch.io/idYXSDVD9U/w/820/h/246/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1772356964254",
  Vivo: "https://cdn.brandfetch.io/idYVgdb4Ec/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1741146580161",
  ZTE: "https://cdn.brandfetch.io/idhNwH_cCA/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1679488240929",
  Viettel: "https://cdn.brandfetch.io/idTGI5XmYh/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1754295703326",
  Huawei: "https://cdn.brandfetch.io/idLAJ42baU/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1676041841613",
  Beats: "https://cdn.brandfetch.io/idBdfnANls/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1675851044279",
  Baseus: "https://cdn.brandfetch.io/idKP0ip8J0/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1772393284526",
  Ugreen: "https://cdn.brandfetch.io/id9VSUaooR/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1772500945292",
  MoveSpeed: "https://cdn.brandfetch.io/idDS871O_9/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1771136257032",
  Zeelot: "https://cdn.brandfetch.io/idPYxQLBGD/w/200/h/56/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1773731408505",
  Anker: "https://cdn.brandfetch.io/idZx11xCTE/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1761300319013",
  ZAGG: "https://cdn.brandfetch.io/idFdGnUHmS/w/132/h/132/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1772365563689",
  Spigen: "https://cdn.brandfetch.io/idWZF0bHjx/w/820/h/926/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1768458590044",
  Momax: "https://cdn.brandfetch.io/idiX9xdWzf/w/300/h/81/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1712772201379",
  Mophie: "https://cdn.brandfetch.io/idru74I2F2/w/391/h/96/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1734333184215",
  Wiwu: "https://cdn.brandfetch.io/idgstVaKOb/w/1215/h/1215/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1768758378133",
  Mocoll: "https://cdn.brandfetch.io/idDTmnfExc/w/4402/h/1126/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1741559228429",
  Pukivn: "https://cdn.brandfetch.io/idr_m8yNWq/w/2000/h/2001/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1723381398147",
  Mipow: "https://cdn.brandfetch.io/id_fw2oFb_/w/150/h/43/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1773134821356",
  Flydigi: "https://cdn.brandfetch.io/idZlGwotLY/w/52/h/47/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1769290949469"
};

function Navbar() {
  const [deviceBrands, setDeviceBrands] = useState([]);
  const [electronicBrands, setElectronicBrands] = useState([]);
  const [accessoryBrands, setAccessoryBrands] = useState([]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
        if (data && Array.isArray(data)) {
          const devices = data.filter(p => p.productType === "device").map(p => p.brand);
          const electronics = data.filter(p => p.productType === "electronic").map(p => p.brand);
          const accessories = data.filter(p => p.productType === "accessory").map(p => p.brand);

          setDeviceBrands([...new Set(devices.filter(Boolean))].sort());
          setElectronicBrands([...new Set(electronics.filter(Boolean))].sort());
          setAccessoryBrands([...new Set(accessories.filter(Boolean))].sort());
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách sản phẩm ở Navbar:", error);
      }
    };
    fetchBrands();
  }, []);

  const renderBrandLink = (brand, basePath) => {
    const logoSrc = BRAND_LOGOS[brand];
    return (
      <Link key={brand} to={`${basePath}?brand=${encodeURIComponent(brand)}`} className="flex flex-col items-center gap-2.5 group/brand no-underline">
        <div className="w-[60px] h-[60px] bg-white border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-300 group-hover/brand:border-blue-400 group-hover/brand:shadow-md p-2">
          {logoSrc ? (
            <img src={logoSrc} alt={brand} className="w-full h-full object-contain transition-transform duration-300 group-hover/brand:scale-110" />
          ) : (
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(brand)}&background=F3F4F6&color=374151&bold=true&font-size=0.45&length=1`} alt={brand} className="w-full h-full object-contain rounded-lg" />
          )}
        </div>
        <span className="text-[13px] font-semibold text-slate-600 text-center transition-colors duration-200 group-hover/brand:text-blue-600 line-clamp-1">{brand}</span>
      </Link>
    );
  };

  return (
    <nav className="hidden lg:block z-50 font-sans">
      <div className="flex items-center gap-8">

        <NavLink to="/" end className={({ isActive }) => `flex items-center gap-2 font-bold text-[15px] transition-colors duration-200 no-underline ${isActive ? 'text-yellow-400' : 'text-white/90 hover:text-white'}`}>
          <Home size={18} /> Trang chủ
        </NavLink>

        {/* 🔥 DROPDOWN DANH MỤC (MEGA MENU) */}
        <div className="relative group">
          <span className="flex items-center gap-2 font-bold text-[15px] text-white/90 hover:text-white cursor-pointer transition-colors duration-200 py-6">
            <LayoutGrid size={18} /> Danh mục <ChevronDown size={16} strokeWidth={2.5} className="transition-transform duration-300 group-hover:rotate-180" />
          </span>

          {/* MAIN DROPDOWN */}
          <div className="absolute top-full left-0 w-[280px] bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] border border-slate-100 opacity-0 invisible translate-y-3 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50">
            <div className="flex flex-col py-2.5">

              {/* MENU ITEM 1 */}
              <div className="relative group/item">
                <NavLink to="/phones" className="flex items-center justify-between px-5 py-3.5 text-[14.5px] font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 no-underline transition-colors">
                  Điện thoại, Máy tính bảng <ChevronRight size={16} className="text-slate-400 group-hover/item:text-blue-600 transition-colors" />
                </NavLink>
                {/* SUBMENU PANEL */}
                <div className="absolute top-0 left-full ml-1 w-[480px] bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] border border-slate-100 p-6 opacity-0 invisible -translate-x-3 group-hover/item:opacity-100 group-hover/item:visible group-hover/item:translate-x-0 transition-all duration-300 z-50">
                  <h4 className="text-base font-extrabold text-slate-800 m-0 mb-5 pb-3 border-b border-slate-100">Thương hiệu Điện thoại</h4>
                  <div className="grid grid-cols-4 gap-y-6 gap-x-4">
                    {deviceBrands.length > 0 ? deviceBrands.map(b => renderBrandLink(b, "/phones")) : <span className="text-sm text-slate-400 italic col-span-4">Đang tải...</span>}
                  </div>
                </div>
              </div>

              {/* MENU ITEM 2 */}
              <div className="relative group/item">
                <NavLink to="/electronics" className="flex items-center justify-between px-5 py-3.5 text-[14.5px] font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 no-underline transition-colors">
                  Đồ điện tử <ChevronRight size={16} className="text-slate-400 group-hover/item:text-blue-600 transition-colors" />
                </NavLink>
                <div className="absolute top-0 left-full ml-1 w-[480px] bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] border border-slate-100 p-6 opacity-0 invisible -translate-x-3 group-hover/item:opacity-100 group-hover/item:visible group-hover/item:translate-x-0 transition-all duration-300 z-50">
                  <h4 className="text-base font-extrabold text-slate-800 m-0 mb-5 pb-3 border-b border-slate-100">Thương hiệu Điện tử</h4>
                  <div className="grid grid-cols-4 gap-y-6 gap-x-4">
                    {electronicBrands.length > 0 ? electronicBrands.map(b => renderBrandLink(b, "/electronics")) : <span className="text-sm text-slate-400 italic col-span-4">Đang tải...</span>}
                  </div>
                </div>
              </div>

              {/* MENU ITEM 3 */}
              <div className="relative group/item">
                <NavLink to="/accessories" className="flex items-center justify-between px-5 py-3.5 text-[14.5px] font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 no-underline transition-colors">
                  Phụ kiện <ChevronRight size={16} className="text-slate-400 group-hover/item:text-blue-600 transition-colors" />
                </NavLink>
                <div className="absolute top-0 left-full ml-1 w-[480px] bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] border border-slate-100 p-6 opacity-0 invisible -translate-x-3 group-hover/item:opacity-100 group-hover/item:visible group-hover/item:translate-x-0 transition-all duration-300 z-50">
                  <h4 className="text-base font-extrabold text-slate-800 m-0 mb-5 pb-3 border-b border-slate-100">Thương hiệu Phụ kiện</h4>
                  <div className="grid grid-cols-4 gap-y-6 gap-x-4">
                    {accessoryBrands.length > 0 ? accessoryBrands.map(b => renderBrandLink(b, "/accessories")) : <span className="text-sm text-slate-400 italic col-span-4">Đang tải...</span>}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <NavLink to="/promotions" className={({ isActive }) => `flex items-center gap-2 font-bold text-[15px] transition-colors duration-200 no-underline ${isActive ? 'text-yellow-400' : 'text-white/90 hover:text-white'}`}>
          <Tag size={18} /> Khuyến mãi
        </NavLink>

        <NavLink to="/news" className={({ isActive }) => `flex items-center gap-2 font-bold text-[15px] transition-colors duration-200 no-underline ${isActive ? 'text-yellow-400' : 'text-white/90 hover:text-white'}`}>
          <Newspaper size={18} /> Tin tức
        </NavLink>

        <NavLink to="/contact" className={({ isActive }) => `flex items-center gap-2 font-bold text-[15px] transition-colors duration-200 no-underline ${isActive ? 'text-yellow-400' : 'text-white/90 hover:text-white'}`}>
          <Phone size={18} /> Liên hệ
        </NavLink>

      </div>
    </nav>
  );
}

export default Navbar;