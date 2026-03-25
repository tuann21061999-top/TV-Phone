import React, { useState, useEffect } from "react";
import "./Header.css";
import Navbar from "../Navbar/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, Smartphone, Bell } from "lucide-react";
import axios from "axios";

function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifyCount, setUnreadNotifyCount] = useState(0);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Xử lý khi submit tìm kiếm
  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim()) {
        setIsSearching(true);
        try {
          // Fetch up to 5 results for live preview
          const { data } = await axios.get(`http://localhost:5000/api/products?search=${encodeURIComponent(searchTerm.trim())}`);
          setSearchResults(data.slice(0, 5));
          setIsSearchOpen(true);
        } catch (error) {
          console.error("Lỗi khi fetch live search", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setIsSearchOpen(false);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".search-wrapper")) {
        setIsSearchOpen(false);
      }
      if (!event.target.closest(".notification-wrapper")) {
        setIsNotifyOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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
      } catch {
        console.error("Lỗi lấy số lượng giỏ hàng");
      }
    };

    const fetchUserProfile = async () => {
      if (!token) return;
      try {
        const { data } = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
      } catch (error) {
        console.error("Lỗi lấy profile user:", error);
      }
    };

    const fetchNotifications = async () => {
      if (!token) return;
      try {
        const { data } = await axios.get("http://localhost:5000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(data.notifications || []);
        setUnreadNotifyCount(data.unreadCount || 0);
      } catch (error) {
        console.error("Lỗi tải thông báo:", error);
      }
    };

    fetchCartCount();
    fetchUserProfile();
    fetchNotifications();
    
    // Lắng nghe sự kiện "cartUpdated" nếu bạn phát đi từ trang Product/Cart
    window.addEventListener("cartUpdated", fetchCartCount);
    return () => window.removeEventListener("cartUpdated", fetchCartCount);
  }, [token]);

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await axios.put(`http://localhost:5000/api/notifications/${notif._id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnreadNotifyCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      }
      setIsNotifyOpen(false);
      let targetLink = notif.link;
      if (targetLink === "/account") targetLink = "/profile?tab=orders";
      if (targetLink === "/vouchers") targetLink = "/profile?tab=vouchers";
      if (targetLink) {
        navigate(targetLink);
      }
    } catch (e) {
      console.error("Lỗi click thông báo:", e);
    }
  };

  return (
    <header className="main-header">
      <div className="top-header">
        <div className="container header-content">
          <Link to="/" className="logo">
            <Smartphone size={22} />
            <span>TechNova</span>
          </Link>

          <div className="search-wrapper">
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm..." 
              className="search" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => { if (searchTerm.trim()) setIsSearchOpen(true); }}
            />
            <Search size={18} className="search-icon" onClick={handleSearch} style={{ cursor: 'pointer' }}/>
            
            {/* SEARCH DROPDOWN */}
            {isSearchOpen && (searchTerm.trim().length > 0) && (
              <div className="search-dropdown">
                {isSearching ? (
                  <div className="search-dropdown-message">Đang tìm kiếm...</div>
                ) : searchResults.length > 0 ? (
                  <>
                    {searchResults.map((product) => (
                      <div 
                        key={product._id} 
                        className="search-dropdown-item"
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchTerm("");
                          navigate(`/product/${product.slug || product._id}`);
                        }}
                      >
                        <img 
                          src={product.colorImages?.[0]?.imageUrl || product.images?.[0] || "/no-image.png"} 
                          alt={product.name} 
                        />
                        <div className="search-item-info">
                          <h4>{product.name}</h4>
                          <span className="search-item-price">
                            {product.variants?.[0]?.price ? product.variants[0].price.toLocaleString("vi-VN") + "₫" : "Đang cập nhật"}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="search-dropdown-footer" onClick={handleSearch}>
                      Xem tất cả kết quả cho "{searchTerm}"
                    </div>
                  </>
                ) : (
                  <div className="search-dropdown-message">Không tìm thấy sản phẩm nào.</div>
                )}
              </div>
            )}
          </div>

          <div className="icons">
            {/* Giỏ hàng với Badge */}
            <Link to="/cart" className="icon-btn cart-wrapper">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </Link>

            {/* Icon Thông báo */}
            <div className="icon-btn notification-wrapper" style={{ cursor: "pointer", position: "relative" }} title="Thông báo">
              <Bell size={20} onClick={() => setIsNotifyOpen(!isNotifyOpen)} />
              {unreadNotifyCount > 0 && (
                <span className="cart-badge notify-badge" style={{ right: "-2px", top: "-2px" }}>{unreadNotifyCount}</span>
              )}

              {/* Box Thông báo */}
              {isNotifyOpen && (
                <div className="notify-dropdown" style={{ position: "absolute", top: "120%", right: "-10px", width: "320px", background: "white", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: 99999, padding: "15px", maxHeight: "400px", overflowY: "auto", cursor: "default" }}>
                  <h4 style={{ margin: "0 0 10px", fontSize: "16px", fontWeight: "600", color: "#333", borderBottom: "1px solid #eee", paddingBottom: "10px", textAlign: "left" }}>Thông báo</h4>
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <div 
                        key={notif._id} 
                        onClick={() => handleNotificationClick(notif)}
                        style={{ padding: "10px", borderRadius: "6px", background: notif.isRead ? "" : "#eef2ff", marginBottom: "8px", cursor: "pointer", transition: "0.2s", textAlign: "left" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = notif.isRead ? "#f9fafb" : "#e0e7ff"}
                        onMouseLeave={(e) => e.currentTarget.style.background = notif.isRead ? "" : "#eef2ff"}
                      >
                        <h5 style={{ margin: "0 0 4px", fontSize: "14px", color: "#111" }}>{notif.title}</h5>
                        <p style={{ margin: 0, fontSize: "12px", color: "#555", lineHeight: "1.4" }}>{notif.message}</p>
                        <span style={{ fontSize: "10px", color: "#888", display: "block", marginTop: "4px" }}>
                          {new Date(notif.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: "center", color: "#888", padding: "20px 0", fontSize: "14px" }}>Chưa có thông báo nào.</div>
                  )}
                </div>
              )}
            </div>

            <Link to="/profile" className="icon-btn user-wrapper" title={user ? user.name : "Tài khoản"}>
              {user ? (
                <div className="avatar-container">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="header-avatar" />
                  ) : (
                    <img 
                      src={`https://ui-avatars.com/api/?name=${user.name}&background=0D9488&color=fff&size=128`} 
                      alt="Default Avatar" 
                      className="header-avatar"
                    />
                  )}
                  {/* Chấm xanh biểu thị online */}
                  <span className="status-dot"></span>
                </div>
              ) : (
                <User size={20} />
              )}
            </Link>
          </div>
        </div>
      </div>
      <Navbar />
    </header>
  );
}

export default Header;