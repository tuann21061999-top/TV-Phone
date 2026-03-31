import "./Navbar.css";
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
        const { data } = await axios.get("http://localhost:5000/api/products");
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
      <Link key={brand} to={`${basePath}?brand=${encodeURIComponent(brand)}`} className="brand-item">
        {logoSrc ? (
          <div className="brand-logo-wrapper"><img src={logoSrc} alt={brand} className="brand-logo" /></div>
        ) : (
          <div className="brand-logo-wrapper"><img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(brand)}&background=F3F4F6&color=374151&bold=true&font-size=0.45&length=1`} alt={brand} className="brand-logo text-avatar" /></div>
        )}
        <span className="brand-name">{brand}</span>
      </Link>
    );
  };

  return (
    <div className="navbar">
      <div className="navbar-content">

        <NavLink to="/" end>
          <Home size={18} /> Trang chủ
        </NavLink>

        {/* 🔥 DROPDOWN DANH MỤC */}
        <div className="dropdown">
          <span className="dropdown-title">
            <LayoutGrid size={18} /> Danh mục <ChevronDown size={16} strokeWidth={2.5} className="chevron" />
          </span>

          <div className="dropdown-menu mega-menu-container">
            <div className="mega-menu-list">
              
              <div className="mega-menu-item">
                <NavLink to="/phones" className="cat-link">
                  Điện thoại, Máy tính bảng <ChevronRight size={14} className="cat-icon"/>
                </NavLink>
                <div className="mega-submenu-panel">
                  <h4>Thương hiệu Điện thoại</h4>
                  <div className="brand-grid">
                    {deviceBrands.length > 0 ? deviceBrands.map(b => renderBrandLink(b, "/phones")) : <span className="no-brand">Đang tải...</span>}
                  </div>
                </div>
              </div>

              <div className="mega-menu-item">
                <NavLink to="/electronics" className="cat-link">
                  Đồ điện tử <ChevronRight size={14} className="cat-icon"/>
                </NavLink>
                <div className="mega-submenu-panel">
                  <h4>Thương hiệu Điện tử</h4>
                  <div className="brand-grid">
                    {electronicBrands.length > 0 ? electronicBrands.map(b => renderBrandLink(b, "/electronics")) : <span className="no-brand">Đang tải...</span>}
                  </div>
                </div>
              </div>

              <div className="mega-menu-item">
                <NavLink to="/accessories" className="cat-link">
                  Phụ kiện <ChevronRight size={14} className="cat-icon"/>
                </NavLink>
                <div className="mega-submenu-panel">
                  <h4>Thương hiệu Phụ kiện</h4>
                  <div className="brand-grid">
                    {accessoryBrands.length > 0 ? accessoryBrands.map(b => renderBrandLink(b, "/accessories")) : <span className="no-brand">Đang tải...</span>}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <NavLink to="/promotions">
          <Tag size={18} /> Khuyến mãi
        </NavLink>

        <NavLink to="/news">
          <Newspaper size={18} /> Tin tức
        </NavLink>

        <NavLink to="/contact">
          <Phone size={18} /> Liên hệ
        </NavLink>

      </div>
    </div>
  );
}

export default Navbar;