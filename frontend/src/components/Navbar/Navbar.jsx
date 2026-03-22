import "./Navbar.css";
import { NavLink } from "react-router-dom";
import { ChevronDown, Home, LayoutGrid, Tag, Newspaper, Phone } from "lucide-react";

function Navbar() {
  return (
    <div className="navbar">
      <div className="container navbar-content">

        <NavLink to="/" end>
          <Home size={18} /> Trang chủ
        </NavLink>

        {/* 🔥 DROPDOWN DANH MỤC */}
        <div className="dropdown">
          <span className="dropdown-title">
            <LayoutGrid size={18} /> Danh mục <ChevronDown size={16} strokeWidth={2.5} className="chevron" />
          </span>

          <div className="dropdown-menu">
            <NavLink to="/phones">Điện thoại, Máy tính bảng</NavLink>
            <NavLink to="/electronics">Đồ điện tử</NavLink>
            <NavLink to="/accessories">Phụ kiện</NavLink>
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