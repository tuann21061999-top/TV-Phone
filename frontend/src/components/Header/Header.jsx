import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShoppingCart, User, Search, Smartphone, Bell, Menu, X, 
  Home, Laptop, Headphones, Gift, Newspaper, Phone 
} from "lucide-react";
import axios from "axios";
import logoImg from "../../assets/Logo3.png";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Xử lý khi submit tìm kiếm
  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchOpen(false);
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
          const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/products?search=${encodeURIComponent(searchTerm.trim())}`);

          // THUẬT TOÁN ƯU TIÊN ĐIỆN THOẠI TRƯỚC
          const sortedData = data.sort((a, b) => {
            const isPhoneA = a.productType === "device" || a.categoryName === "Điện thoại" ? 1 : 0;
            const isPhoneB = b.productType === "device" || b.categoryName === "Điện thoại" ? 1 : 0;
            return isPhoneB - isPhoneA; // Xếp giảm dần (Điện thoại lên đầu)
          });

          // Lấy 5 kết quả đầu tiên sau khi đã sắp xếp ưu tiên
          setSearchResults(sortedData.slice(0, 5));
          setIsSearchOpen(true);
        } catch (error) {
          console.error("Lỗi khi fetch live search", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        searchResults([]);
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
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartCount(data.items?.length || 0);
      } catch {
        console.error("Lỗi lấy số lượng giỏ hàng");
      }
    };

    const fetchUserProfile = async () => {
      if (!token) return;
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
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
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications`, {
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

    window.addEventListener("cartUpdated", fetchCartCount);
    return () => window.removeEventListener("cartUpdated", fetchCartCount);
  }, [token]);

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/notifications/${notif._id}/read`, {}, {
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
    <header className="relative w-full z-[9999] bg-[linear-gradient(135deg,#0f172a,#1e40af,#3b82f6,#0ea5e9,#0f172a)] bg-[length:300%_300%] animate-gradientFlow mb-2.5">

      {/* CSS Nhúng cho animation dải màu gradient */}
      <style>
        {`
          @keyframes gradientFlow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradientFlow {
            animation: gradientFlow 12s ease infinite;
          }
        `}
      </style>

      {/* FIX Z-INDEX: Thêm relative và z-[20000] vào div này để nổi lên trên Navbar */}
      <div className="relative z-[20000] bg-transparent border-b border-white/10 px-4 pb-3 pt-[30px] md:pb-4 md:pt-[44px] h-[80px] md:h-[100px] flex items-end">
        <div className="flex items-center justify-between max-w-[1400px] w-full lg:w-[95%] mx-auto">

          {/* HEADER LEFT: LOGO & NAVBAR */}
          <div className="flex items-center gap-3 lg:gap-10 shrink-0">
            {/* MOBILE HAMBURGER */}
            <button 
                className="lg:hidden text-white bg-transparent border-none p-0 cursor-pointer flex items-center shrink-0 hover:text-yellow-400 transition-colors" 
                onClick={() => setIsMobileMenuOpen(true)}
            >
                <Menu size={28} strokeWidth={2.5} />
            </button>

            <Link to="/" className="inline-block leading-none no-underline transition-transform duration-300 hover:text-[#FACC15] hover:scale-105 group shrink-0">
              <img src={logoImg} alt="V&T Nexis Logo" className="h-[30px] md:h-[45px] w-auto object-contain transition-transform duration-300" />
            </Link>
            <Navbar />
          </div>

          {/* HEADER RIGHT: SEARCH & ICONS */}
          <div className="flex items-center gap-4 lg:gap-[30px] shrink-0">

            {/* SEARCH BAR (Glassmorphism) - Hidden on mobile */}
            <div className="relative hidden md:block w-[200px] lg:w-[300px] search-wrapper">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full py-2.5 pr-10 pl-4 rounded-xl border border-white/20 bg-white/10 backdrop-blur-[12px] text-white outline-none text-[14px] transition-all duration-300 placeholder:text-white/70 focus:bg-white/15 focus:border-white/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.4)]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => { if (searchTerm.trim()) setIsSearchOpen(true); }}
              />
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 cursor-pointer transition-colors duration-200 hover:text-white" onClick={handleSearch} />

              {/* SEARCH DROPDOWN - FIX Z-INDEX: z-[99999] */}
              {isSearchOpen && (searchTerm.trim().length > 0) && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.15)] z-[99999] overflow-hidden flex flex-col">
                  {isSearching ? (
                    <div className="p-[15px] text-center text-slate-500 text-[14px]">Đang tìm kiếm...</div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map((product) => (
                        <div
                          key={product._id}
                          className="flex items-center gap-3 py-2.5 px-[15px] cursor-pointer transition-colors duration-200 border-b border-slate-100 last:border-none hover:bg-slate-50"
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchTerm("");
                            navigate(`/product/${product.slug || product._id}`);
                          }}
                        >
                          <img
                            src={product.colorImages?.[0]?.imageUrl || product.images?.[0] || "/no-image.png"}
                            alt={product.name}
                            className="w-10 h-10 object-contain rounded bg-white shrink-0"
                          />
                          <div>
                            <h4 className="text-[14px] text-slate-800 m-0 mb-1 font-medium line-clamp-1">{product.name}</h4>
                            <span className="text-[13px] text-red-500 font-semibold">
                              {product.variants?.[0]?.price ? product.variants[0].price.toLocaleString("vi-VN") + "₫" : "Đang cập nhật"}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div className="p-3 text-center bg-slate-50 text-blue-600 text-[13px] font-semibold cursor-pointer transition-colors duration-200 border-t border-slate-200 hover:bg-slate-200" onClick={handleSearch}>
                        Xem tất cả kết quả cho "{searchTerm}"
                      </div>
                    </>
                  ) : (
                    <div className="p-[15px] text-center text-slate-500 text-[14px]">Không tìm thấy sản phẩm nào.</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-4 lg:gap-6 shrink-0">
              {/* GIỎ HÀNG */}
              <Link to="/cart" className="text-white transition-all duration-200 flex items-center justify-center hover:text-[#FACC15] hover:-translate-y-[2px] relative cart-wrapper">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-[10px] bg-red-500 text-white text-[11px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center shadow-[0_0_0_2px_rgba(255,255,255,0.2)] p-[2px]">{cartCount}</span>
                )}
              </Link>

              {/* THÔNG BÁO */}
              <div className="text-white transition-all duration-200 flex items-center justify-center hover:text-[#FACC15] hover:-translate-y-[2px] relative notification-wrapper cursor-pointer" title="Thông báo">
                <Bell size={20} onClick={() => setIsNotifyOpen(!isNotifyOpen)} />
                {unreadNotifyCount > 0 && (
                  <span className="absolute -top-[2px] -right-[2px] bg-red-500 text-white text-[11px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center shadow-[0_0_0_2px_rgba(255,255,255,0.2)] p-[2px]">{unreadNotifyCount}</span>
                )}

                {/* BOX THÔNG BÁO DROPDOWN */}
                {isNotifyOpen && (
                  <div className="absolute top-[120%] -right-[10px] w-[320px] bg-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] z-[99999] p-[15px] max-h-[400px] overflow-y-auto cursor-default">
                    <h4 className="m-0 mb-2.5 text-[16px] font-semibold text-slate-800 border-b border-slate-100 pb-2.5 text-left">Thông báo</h4>
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div
                          key={notif._id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-2.5 rounded-md mb-2 cursor-pointer transition-colors duration-200 text-left ${notif.isRead ? "bg-white hover:bg-slate-50" : "bg-indigo-50 hover:bg-indigo-100"}`}
                        >
                          <h5 className="m-0 mb-1 text-[14px] text-slate-900">{notif.title}</h5>
                          <p className="m-0 text-[12px] text-slate-600 leading-[1.4]">{notif.message}</p>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            {new Date(notif.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-500 py-5 text-[14px]">Chưa có thông báo nào.</div>
                    )}
                  </div>
                )}
              </div>

              {/* USER AVATAR */}
              <Link to="/profile" className="text-white transition-all duration-200 flex items-center justify-center hover:text-[#FACC15] hover:-translate-y-[2px] relative user-wrapper group" title={user ? user.name : "Tài khoản"}>
                {user ? (
                  <div className="relative inline-flex">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border-2 border-white/80 transition-colors duration-200 group-hover:border-[#FACC15]" />
                    ) : (
                      <img
                        src={`https://ui-avatars.com/api/?name=${user.name}&background=0D9488&color=fff&size=128`}
                        alt="Default Avatar"
                        className="w-8 h-8 rounded-full object-cover border-2 border-white/80 transition-colors duration-200 group-hover:border-[#FACC15]"
                      />
                    )}
                    {/* Chấm xanh biểu thị online */}
                    <span className="absolute -bottom-[2px] -right-[2px] w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_0_2px_rgba(255,255,255,0.8)]"></span>
                  </div>
                ) : (
                  <User size={20} />
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      <div className={`fixed inset-0 z-[100000] transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} lg:hidden flex`}>
        {/* OVERLAY */}
        {isMobileMenuOpen && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
        )}
        
        {/* SIDEBAR CONTENT */}
        <div className="relative w-[300px] h-full bg-white flex flex-col shadow-2xl overflow-hidden z-10 transition-transform duration-300">
           <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
               <h3 className="text-slate-800 font-extrabold text-lg m-0">V&T Nexis</h3>
               <button className="bg-slate-200/50 hover:bg-slate-200 p-2 rounded-full border-none transition-colors flex items-center justify-center cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                   <X size={20} className="text-slate-600 shrink-0" />
               </button>
           </div>

           {/* Mobile Search */}
           <div className="p-4 border-b border-slate-100 flex-shrink-0">
               <div className="relative w-full search-wrapper">
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full py-2.5 pr-10 pl-4 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none text-[14px] focus:border-blue-500 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch();
                            setIsMobileMenuOpen(false);
                        }
                    }}
                  />
                  <Search 
                    size={18} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer" 
                    onClick={() => {
                        handleSearch();
                        setIsMobileMenuOpen(false);
                    }} 
                  />

                  {/* Dropdown for Mobile Search */}
                  {isSearchOpen && (searchTerm.trim().length > 0) && (
                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-lg shadow-xl border border-slate-100 z-[99999] overflow-hidden flex flex-col">
                      {isSearching ? (
                        <div className="p-3 text-center text-slate-500 text-[13px]">Đang tìm...</div>
                      ) : searchResults.length > 0 ? (
                        <>
                          {searchResults.map((product) => (
                            <div
                              key={product._id}
                              className="flex items-center gap-3 py-2 px-3 cursor-pointer transition-colors border-b border-slate-50 last:border-none hover:bg-slate-50"
                              onClick={() => {
                                setIsSearchOpen(false);
                                setSearchTerm("");
                                setIsMobileMenuOpen(false);
                                navigate(`/product/${product.slug || product._id}`);
                              }}
                            >
                              <img src={product.colorImages?.[0]?.imageUrl || product.images?.[0] || "/no-image.png"} alt={product.name} className="w-8 h-8 object-contain rounded bg-white shrink-0" />
                              <div>
                                <h4 className="text-[12px] text-slate-800 m-0 mb-0.5 font-medium line-clamp-1">{product.name}</h4>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="p-3 text-center text-slate-500 text-[13px]">Không tìm thấy.</div>
                      )}
                    </div>
                  )}

               </div>
           </div>

           {/* Quick Navigation Links */}
           <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200">
               <Link to="/" onClick={()=>setIsMobileMenuOpen(false)} className="px-4 py-3.5 text-slate-700 font-semibold text-[15px] hover:bg-blue-50 hover:text-blue-600 rounded-xl no-underline transition-colors flex items-center gap-3">
                   <Home size={20} /> Trang Chủ
               </Link>
               <Link to="/phones" onClick={()=>setIsMobileMenuOpen(false)} className="px-4 py-3.5 text-slate-700 font-semibold text-[15px] hover:bg-blue-50 hover:text-blue-600 rounded-xl no-underline transition-colors flex items-center gap-3">
                   <Smartphone size={20} /> Điện thoại
               </Link>
               <Link to="/electronics" onClick={()=>setIsMobileMenuOpen(false)} className="px-4 py-3.5 text-slate-700 font-semibold text-[15px] hover:bg-blue-50 hover:text-blue-600 rounded-xl no-underline transition-colors flex items-center gap-3">
                   <Laptop size={20} /> Đồ điện tử
               </Link>
               <Link to="/accessories" onClick={()=>setIsMobileMenuOpen(false)} className="px-4 py-3.5 text-slate-700 font-semibold text-[15px] hover:bg-blue-50 hover:text-blue-600 rounded-xl no-underline transition-colors flex items-center gap-3">
                   <Headphones size={20} /> Phụ kiện
               </Link>
               <Link to="/promotions" onClick={()=>setIsMobileMenuOpen(false)} className="px-4 py-3.5 text-slate-700 font-semibold text-[15px] hover:bg-blue-50 hover:text-blue-600 rounded-xl no-underline transition-colors flex items-center gap-3">
                   <Gift size={20} /> Khuyến mãi
               </Link>
               <Link to="/news" onClick={()=>setIsMobileMenuOpen(false)} className="px-4 py-3.5 text-slate-700 font-semibold text-[15px] hover:bg-blue-50 hover:text-blue-600 rounded-xl no-underline transition-colors flex items-center gap-3">
                   <Newspaper size={20} /> Tin tức
               </Link>
               <Link to="/contact" onClick={()=>setIsMobileMenuOpen(false)} className="px-4 py-3.5 text-slate-700 font-semibold text-[15px] hover:bg-blue-50 hover:text-blue-600 rounded-xl no-underline transition-colors flex items-center gap-3">
                   <Phone size={20} /> Liên hệ
               </Link>
           </div>
        </div>
      </div>

    </header>
  );
}

export default Header;