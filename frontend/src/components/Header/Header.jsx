import React, { useState, useEffect } from "react";
import "./Header.css";
import Navbar from "../Navbar/Navbar";
import { Link } from "react-router-dom";
import { ShoppingCart, User, Search, Smartphone } from "lucide-react";
import axios from "axios";

function Header() {
  const [cartCount, setCartCount] = useState(0);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCartCount = async () => {
      if (!token) {
        setCartCount(0);
        return;
      }
      try {
        const { data } = await axios.get("http://localhost:5000/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // data.items.length sẽ trả về số lượng LOẠI sản phẩm (đúng yêu cầu của bạn)
        setCartCount(data.items?.length || 0);
      } catch (err) {
        console.error("Lỗi lấy số lượng giỏ hàng");
      }
    };

    fetchCartCount();
    
    // Lắng nghe sự kiện "cartUpdated" nếu bạn phát đi từ trang Product/Cart
    window.addEventListener("cartUpdated", fetchCartCount);
    return () => window.removeEventListener("cartUpdated", fetchCartCount);
  }, [token]);

  return (
    <>
      <div className="top-header">
        <div className="container header-content">
          <Link to="/" className="logo">
            <Smartphone size={22} />
            <span>TechNova</span>
          </Link>

          <div className="search-wrapper">
            <input type="text" placeholder="Tìm kiếm sản phẩm..." className="search" />
            <Search size={18} className="search-icon" />
          </div>

          <div className="icons">
            {/* Giỏ hàng với Badge */}
            <Link to="/cart" className="icon-btn cart-wrapper">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </Link>

            <Link to="/profile" className="icon-btn">
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