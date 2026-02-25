import "./Header.css";
import Navbar from "../Navbar/Navbar";
import { Link } from "react-router-dom";
import { ShoppingCart, User, Search, Smartphone } from "lucide-react";

function Header() {
  return (
    <>
      <div className="top-header">
        <div className="container header-content">
          
          {/* Logo */}
          <Link to="/" className="logo">
            <Smartphone size={22} />
            <span>TechNova</span>
          </Link>

          {/* Search */}
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="search"
            />
            <Search size={18} className="search-icon" />
          </div>

          {/* Icons */}
          <div className="icons">
            <Link to="/cart" className="icon-btn">
              <ShoppingCart size={20} />
            </Link>

            <Link to="/login" className="icon-btn">
              <User size={20} />
            </Link>
          </div>

        </div>
      </div>

      <Navbar />
    </>
  );
}

export default Header;