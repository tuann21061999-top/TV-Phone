import "./Navbar.css";
import { NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react"; // Thêm mũi tên cho đẹp

function Navbar() {
  return (
    <div className="navbar">
      <div className="container navbar-content">

        <NavLink to="/" end>
          Trang chủ
        </NavLink>

        {/* 🔥 DROPDOWN DANH MỤC */}
        <div className="dropdown">
          <span className="dropdown-title">
            Danh mục <ChevronDown size={16} strokeWidth={2.5} />
          </span>

          <div className="dropdown-menu">
            <NavLink to="/phones">Điện thoại, Máy tính bảng</NavLink>
            <NavLink to="/electronics">Đồ điện tử</NavLink>
            <NavLink to="/accessories">Phụ kiện</NavLink>
          </div>
        </div>

        <NavLink to="/promotions">
          Khuyến mãi
        </NavLink>

        <NavLink to="/news">
          Tin tức
        </NavLink>

        <NavLink to="/contact">
          Liên hệ
        </NavLink>

      </div>
    </div>
  );
}

export default Navbar;