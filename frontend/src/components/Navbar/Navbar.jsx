import "./Navbar.css";
import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <div className="navbar">
      <div className="container navbar-content">

        <NavLink to="/" end>
          Trang chủ
        </NavLink>

        <NavLink to="/phones">
          Điện thoại
        </NavLink>

        <NavLink to="/accessories">
          Phụ kiện
        </NavLink>

        <NavLink to="/promotions">
          Khuyến mãi
        </NavLink>

        <NavLink to="/contact">
          Liên hệ
        </NavLink>

      </div>
    </div>
  );
}

export default Navbar;