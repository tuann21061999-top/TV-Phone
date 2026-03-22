/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  User, Package, MapPin, Tag, LogOut, Plus,
  Trash2, CreditCard, Edit, Heart, Search, Eye,
  Camera, XCircle, Loader2, AlertCircle, Star, DollarSign
} from "lucide-react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import axios from "axios";
import AddressModal from "./AddressModal";
import PaymentModal from "./PaymentModal";
import ProductCard from "../Product/ProductCard";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("info");

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: "", phone: "" });

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [editingAddress, setEditingAddress] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [activeOrderFilter, setActiveOrderFilter] = useState("all");

  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  const filterOrderTabs = [
    { id: "all", label: "Tất cả" },
    { id: "waiting", label: "Chờ xác nhận" },
    { id: "preparing", label: "Chờ vận chuyển" },
    { id: "shipping", label: "Đang vận chuyển" },
    { id: "done", label: "Đã giao" },
    { id: "cancelled", label: "Đã hủy" },
    { id: "returned", label: "Đơn trả về" }
  ];

  /* ================= FETCH PROFILE & ORDERS ================= */
  const handleAvatarChange = async (e) => {
    // ... (Giữ nguyên như code của bạn)
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh!");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    setIsUploading(true);
    const loadingToast = toast.loading("Đang tải ảnh lên...");

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        "http://localhost:5000/api/users/update-avatar",
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );

      setUser(prev => ({ ...prev, avatar: data.user.avatar }));
      toast.success("Cập nhật ảnh đại diện thành công", { id: loadingToast });
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi tải ảnh", { id: loadingToast });
    } finally {
      setIsUploading(false);
    }
  };

  const removeAvatar = async () => {
    // ... (Giữ nguyên như code của bạn)
    if (!window.confirm("Bạn có muốn xóa ảnh đại diện hiện tại?")) return;

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        "http://localhost:5000/api/users/update",
        { avatar: "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(prev => ({ ...prev, avatar: "" }));
      toast.success("Đã xóa ảnh đại diện");
    } catch (error) {
      toast.error("Lỗi khi xóa ảnh");
    }
  };

  const renderSidebarAvatar = () => (
    <div className="avatar-wrapper">
      <div className="avatar-main">
        {user.avatar ? (
          <img src={user.avatar} alt="Avatar" />
        ) : (
          <img
            src={`https://ui-avatars.com/api/?name=${user.name}&background=0D9488&color=fff&size=128`}
            alt="Default Avatar"
          />
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        hidden
        accept="image/*"
        onChange={handleAvatarChange}
      />

      <div className="user-info">
        <h4>{user.name}</h4>
        <p className="user-email-sub">{user.email}</p>
      </div>
    </div>
  );

  const fetchUserAndOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    const tokenHeader = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const { data: userData } = await axios.get("http://localhost:5000/api/users/profile", tokenHeader);
      if (userData.role === "admin") {
        navigate("/admin");
        return;
      }
      setUser(userData);
      setEditFormData({ name: userData.name || "", phone: userData.phone || "" });

      setLoadingOrders(true);
      const { data: orderData } = await axios.get("http://localhost:5000/api/orders/my-orders", tokenHeader);
      setOrders(orderData);

    } catch (error) {
      if (error.response?.status === 401) navigate("/login");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchUserAndOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch danh sách yêu thích khi chuyển tab
  useEffect(() => {
    if (activeTab === "favorites") {
      const fetchFavorites = async () => {
        setLoadingFavorites(true);
        try {
          const token = localStorage.getItem("token");
          const { data } = await axios.get("http://localhost:5000/api/favorites", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFavorites(data);
        } catch (error) {
          console.error("Error fetching favorites:", error);
        } finally {
          setLoadingFavorites(false);
        }
      };
      fetchFavorites();
    }
  }, [activeTab]);

  // Khi user bỏ yêu thích trong tab favorites → xóa khỏi danh sách
  const handleFavoriteToggle = (productId, isFavorited) => {
    if (!isFavorited) {
      setFavorites((prev) => prev.filter((p) => p._id !== productId));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    window.location.reload();
  };

  const handleUpdateInfo = async () => {
    if (!editFormData.name.trim()) {
      toast.error("Tên không được để trống!");
      return;
    }
    const loadingToast = toast.loading("Đang cập nhật...");
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        "http://localhost:5000/api/users/update",
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(data.user);
      setIsEditingInfo(false);
      toast.success("Cập nhật thông tin thành công", { id: loadingToast });
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật", { id: loadingToast });
    }
  };

  // ✅ THÊM MỚI: Hàm xử lý Khách hàng tự Hủy đơn
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Đã hủy đơn hàng thành công.");
      fetchUserAndOrders(); // Gọi lại để cập nhật danh sách
    } catch (error) {
      toast.error("Lỗi khi hủy đơn hàng, vui lòng thử lại.");
    }
  };

  /* ================= LỌC & HIỂN THỊ ĐƠN HÀNG ================= */

  const filteredOrders = orders.filter(order => {
    if (activeOrderFilter === "all") return true;
    if (activeOrderFilter === "waiting") return ["waiting_approval", "pending", "paid"].includes(order.status);
    return order.status === activeOrderFilter;
  });

  const getTabCount = (tabId) => {
    if (tabId === "all") return orders.length;
    if (tabId === "waiting") return orders.filter(o => ["waiting_approval", "pending", "paid"].includes(o.status)).length;
    return orders.filter(o => o.status === tabId).length;
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending": return "Chờ thanh toán";
      case "waiting_approval": return "Chờ xác nhận (COD)";
      case "paid": return "Đã thanh toán";
      case "preparing": return "Đang đóng gói";
      case "shipping": return "Đang giao hàng";
      case "done": return "Đã giao thành công";
      case "cancelled": return "Đã hủy";
      case "returned": return "Đã hoàn hàng về shop";
      default: return "Không rõ";
    }
  };

  /* ================= ADDRESS & PAYMENT ================= */
  const tokenHeader = { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };

  const saveAddress = async (addressData) => {
    try {
      if (editingAddress) {
        await axios.put(`http://localhost:5000/api/users/address/${editingAddress._id}`, addressData, tokenHeader);
      } else {
        await axios.post("http://localhost:5000/api/users/address", addressData, tokenHeader);
      }
      await fetchUserAndOrders();
      setEditingAddress(null);
      setShowAddressModal(false);
    } catch (err) { alert("Lỗi lưu địa chỉ"); }
  };

  const deleteAddress = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/address/${id}`, tokenHeader);
      setUser(prev => ({ ...prev, addresses: prev.addresses.filter(a => a._id !== id) }));
    } catch { alert("Lỗi xóa địa chỉ"); }
  };

  const savePayment = async (paymentData) => {
    try {
      if (editingPayment) {
        await axios.put(`http://localhost:5000/api/users/payment/${editingPayment._id}`, paymentData, tokenHeader);
      } else {
        await axios.post("http://localhost:5000/api/users/payment", paymentData, tokenHeader);
      }
      await fetchUserAndOrders();
      setEditingPayment(null);
      setShowPaymentModal(false);
    } catch { alert("Lỗi lưu phương thức thanh toán"); }
  };

  const deletePayment = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/payment/${id}`, tokenHeader);
      setUser(prev => ({ ...prev, paymentMethods: prev.paymentMethods.filter(p => p._id !== id) }));
    } catch { alert("Lỗi xóa phương thức"); }
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <Header />

      <div className="container profile-container">
        <div className="profile-grid">

          {/* CỘT TRÁI: SIDEBAR */}
          <aside className="profile-sidebar-card">
            {renderSidebarAvatar()}
            {/* Mình ẩn đi user-profile-header cũ của bạn vì renderSidebarAvatar đã có thông tin rồi */}
            {/* <div className="user-profile-header"> ... </div> */}

            <nav className="profile-menu">
              <button className={`menu-item ${activeTab === "info" ? "active" : ""}`} onClick={() => setActiveTab("info")}>
                <User size={18} /> Thông tin cá nhân
              </button>

              <button className={`menu-item ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>
                <Package size={18} /> Đơn hàng của tôi
              </button>

              <button className={`menu-item ${activeTab === "favorites" ? "active" : ""}`} onClick={() => setActiveTab("favorites")}>
                <Heart size={18} /> Sản phẩm yêu thích
              </button>

              <button className={`menu-item ${activeTab === "vouchers" ? "active" : ""}`} onClick={() => setActiveTab("vouchers")}>
                <Tag size={18} /> Mã giảm giá
              </button>

              <button className={`menu-item ${activeTab === "address" ? "active" : ""}`} onClick={() => setActiveTab("address")}>
                <MapPin size={18} /> Sổ địa chỉ
              </button>

              <button className={`menu-item ${activeTab === "payment" ? "active" : ""}`} onClick={() => setActiveTab("payment")}>
                <CreditCard size={18} /> Thanh toán
              </button>

              <button className="menu-item logout-text" onClick={handleLogout}>
                <LogOut size={18} /> Đăng xuất
              </button>
            </nav>
          </aside>

          {/* CỘT PHẢI: MAIN CONTENT */}
          <main className="profile-main-content">

            {/* TAB INFO */}
            {activeTab === "info" && (
              <div className="card-section info-dashboard" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
                <div className="welcome-banner">
                  <div>
                    <h2 className="welcome-title">Xin chào, {user.name}!</h2>
                    <p className="welcome-subtitle">Quản lý thông tin cá nhân và bảo mật tài khoản của bạn tại đây.</p>
                  </div>
                </div>

                <div className="profile-stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon-wrapper bg-blue-100 text-blue-600">
                      <Package size={24} />
                    </div>
                    <div className="stat-info">
                      <h3>{orders.filter(o => o.status === 'done').length}</h3>
                      <p>Đơn hàng đã giao</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon-wrapper bg-green-100 text-green-600">
                      <DollarSign size={24} />
                    </div>
                    <div className="stat-info">
                      <h3>{orders.filter(o => o.status === 'done').reduce((sum, o) => sum + o.total, 0).toLocaleString()}đ</h3>
                      <p>Tổng chi tiêu</p>
                    </div>
                  </div>
                </div>

                <div className="info-card-container">
                  <div className="section-header-flex">
                    <h2>Thông tin liên hệ</h2>
                    {!isEditingInfo && (
                      <button className="btn-outline-small" onClick={() => setIsEditingInfo(true)}>
                        <Edit size={16} /> Chỉnh sửa
                      </button>
                    )}
                  </div>

                  {isEditingInfo ? (
                    <div className="edit-info-form">
                      {/* Avatar Edit Section */}
                      <div className="edit-avatar-section">
                        <img 
                          src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=0D9488&color=fff&size=128`} 
                          alt="Avatar" 
                          className="edit-avatar-preview"
                        />
                        <div className="edit-avatar-actions">
                          <button className="btn-outline-small" onClick={() => fileInputRef.current.click()} disabled={isUploading}>
                            {isUploading ? <Loader2 className="spinner" size={16} /> : <Camera size={16} />} 
                            {user.avatar ? " Đổi ảnh" : " Thêm ảnh"}
                          </button>
                          {user.avatar && (
                            <button className="btn-danger-small" style={{marginTop: 0}} onClick={removeAvatar}>
                              <Trash2 size={16} /> Xóa ảnh
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="form-group-row">
                        <div className="form-group focus-group">
                          <label>Họ và tên</label>
                          <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="input-field" />
                        </div>
                        <div className="form-group focus-group">
                          <label>Số điện thoại</label>
                          <input type="text" value={editFormData.phone} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} placeholder="Thêm số điện thoại..." className="input-field" />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Email (Không thể thay đổi)</label>
                        <input type="email" value={user.email} disabled className="input-field disabled-input" />
                      </div>
                      
                      <div className="edit-form-actions" style={{display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px'}}>
                        <button className="btn-secondary" onClick={() => {
                          setIsEditingInfo(false);
                          setEditFormData({ name: user.name, phone: user.phone || "" });
                        }}>Hủy</button>
                        <button className="btn-primary" onClick={handleUpdateInfo}>Lưu thay đổi</button>
                      </div>
                    </div>
                  ) : (
                    <div className="info-content-grid">
                      <div className="info-item">
                        <p className="info-label">Họ và tên</p>
                        <p className="info-value">{user.name}</p>
                      </div>
                      <div className="info-item">
                        <p className="info-label">Email</p>
                        <p className="info-value">{user.email}</p>
                      </div>
                      <div className="info-item">
                        <p className="info-label">Số điện thoại</p>
                        <p className="info-value">{user.phone || <em className="text-muted">Chưa cập nhật</em>}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB ORDERS */}
            {activeTab === "orders" && (
              <div className="card-section">
                <div className="order-page-header">
                  <div>
                    <h2 style={{ margin: 0, fontSize: "22px", color: "#1E293B" }}>Đơn hàng của tôi</h2>
                    <p style={{ margin: "4px 0 0 0", color: "#64748B", fontSize: "14px" }}>Quản lý và theo dõi tất cả đơn hàng của bạn</p>
                  </div>
                  <div className="order-search-box">
                    <Search size={18} />
                    <input type="text" placeholder="Tìm đơn hàng..." />
                  </div>
                </div>

                <div className="order-status-tabs">
                  {filterOrderTabs.map(tab => (
                    <button
                      key={tab.id}
                      className={`status-tab-btn ${activeOrderFilter === tab.id ? "active" : ""}`}
                      onClick={() => setActiveOrderFilter(tab.id)}
                    >
                      {tab.label} <span className="count-badge">{getTabCount(tab.id)}</span>
                    </button>
                  ))}
                </div>

                {loadingOrders ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>Đang tải danh sách đơn hàng...</div>
                ) : filteredOrders.length === 0 ? (
                  <div className="empty-state-container">
                    <Package size={48} className="empty-icon" />
                    <p>Bạn chưa có đơn hàng nào ở trạng thái này.</p>
                    <button className="btn-secondary" onClick={() => navigate("/products")}>Tiếp tục mua sắm</button>
                  </div>
                ) : (
                  <div className="orders-list">
                    {filteredOrders.map(order => (
                      <div key={order._id} className="order-item-card">

                        {/* Header Đơn hàng */}
                        <div className="order-card-header">
                          <div className="order-id-date">
                            <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
                            <span className="divider">|</span>
                            <span className="order-date">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className={`order-status-pill status-${order.status}`}>
                            {getStatusText(order.status)}
                          </div>
                        </div>

                        {/* Body (Danh sách sản phẩm) */}
                        <div className="order-card-body">
                          {order.items.map((item, index) => (
                            <div key={index} className="order-product-row">
                              <div className="order-product-img">
                                <img src={item.image || "/no-image.png"} alt={item.name} />
                              </div>
                              <div className="order-product-info">
                                <h4>{item.name}</h4>
                                <p className="variant-info">{item.color} | {item.storage}</p>
                                <p className="qty">Số lượng: x{item.quantity}</p>
                              </div>
                              <div className="order-product-price">
                                {(item.price * item.quantity).toLocaleString()}đ
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Footer Đơn hàng */}
                        <div className="order-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                          {/* Khối bên trái: Báo lỗi nếu chưa thanh toán */}
                          <div className="footer-left-info">
                            <div className="total-display">
                              Thành tiền: <strong style={{ color: '#ef4444', fontSize: '18px' }}>{order.total.toLocaleString()}đ</strong>
                            </div>
                            {order.status === 'pending' && ['VNPAY', 'MOMO'].includes(order.paymentMethod) && (
                              <p style={{ color: '#ef4444', fontSize: '13px', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <AlertCircle size={14} /> Vui lòng thanh toán trong 15 phút.
                              </p>
                            )}
                          </div>

                          {/* Khối bên phải: Các nút thao tác */}
                          <div className="action-buttons" style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn-outline-small" onClick={() => navigate(`/order/${order._id}`)}>
                              <Eye size={16} /> Xem chi tiết
                            </button>

                            {/* NÚT THANH TOÁN TIẾP VÀ HỦY ĐƠN CHO ĐƠN PENDING */}
                            {order.status === 'pending' && ['VNPAY', 'MOMO'].includes(order.paymentMethod) && (
                              <>
                                <button
                                  className="btn-danger-small"
                                  style={{ backgroundColor: '#f1f5f9', color: '#64748b', borderColor: '#cbd5e1' }}
                                  onClick={() => handleCancelOrder(order._id)}
                                >
                                  Hủy đơn
                                </button>
                                <button
                                  className="btn-primary-small"
                                  style={{ backgroundColor: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '6px' }}
                                  onClick={() => {
                                    navigate('/payment', {
                                      state: {
                                        orderId: order._id,
                                        total: order.total,
                                        paymentMethod: order.paymentMethod
                                      }
                                    });
                                  }}
                                >
                                  Thanh toán ngay
                                </button>
                              </  >
                            )}

                            {/* Nút hủy đơn cho đơn COD đang chờ duyệt */}
                            {order.status === 'waiting_approval' && (
                              <button
                                className="btn-danger-small"
                                onClick={() => handleCancelOrder(order._id)}
                              >
                                Hủy đơn
                              </button>
                            )}

                            {(order.status === "done" || order.status === "cancelled" || order.status === "returned") && (
                              <button
                                className="btn-primary-small"
                                onClick={() => {
                                  const firstItem = order.items[0];
                                  const slug = firstItem?.productId?.slug;
                                  if (slug) navigate(`/product/${slug}`);
                                  else toast.error("Không tìm thấy sản phẩm.");
                                }}
                              >
                                Mua lại
                              </button>
                            )}

                            {order.status === "done" && (
                              <button
                                className="btn-outline-small"
                                style={{ color: '#f59e0b', borderColor: '#f59e0b' }}
                                onClick={() => {
                                  const firstItem = order.items[0];
                                  const slug = firstItem?.productId?.slug;
                                  if (slug) navigate(`/product/${slug}/reviews`);
                                  else toast.error("Không tìm thấy sản phẩm.");
                                }}
                              >
                                <Star size={16} /> Đánh giá
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB FAVORITES */}
            {activeTab === "favorites" && (
              <div className="card-section">
                <div className="section-header-flex"><h2>Sản phẩm yêu thích</h2></div>
                {loadingFavorites ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>Đang tải danh sách yêu thích...</div>
                ) : favorites.length === 0 ? (
                  <div className="empty-state-container">
                    <Heart size={48} className="empty-icon" />
                    <p>Chưa có sản phẩm nào trong danh sách yêu thích.</p>
                    <button className="btn-secondary" onClick={() => navigate("/")}>Khám phá sản phẩm</button>
                  </div>
                ) : (
                  <div className="favorites-grid">
                    {favorites.map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        isFavorited={true}
                        onFavoriteToggle={handleFavoriteToggle}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB VOUCHERS */}
            {activeTab === "vouchers" && (
              <div className="card-section">
                <div className="section-header-flex"><h2>Mã giảm giá của bạn</h2></div>
                <div className="empty-state-container">
                  <Tag size={48} className="empty-icon" />
                  <p>Bạn hiện chưa lưu mã giảm giá nào.</p>
                </div>
              </div>
            )}

            {/* TAB ADDRESS */}
            {activeTab === "address" && (
              <div className="card-section">
                <div className="section-header-flex">
                  <h2>Sổ địa chỉ</h2>
                  <button className="btn-primary" onClick={() => { setEditingAddress(null); setShowAddressModal(true); }}>
                    <Plus size={18} /> Thêm mới
                  </button>
                </div>
                <div className="list-container">
                  {user.addresses?.length === 0 && <p className="text-muted">Chưa có địa chỉ nào được lưu.</p>}
                  {user.addresses?.map(addr => (
                    <div key={addr._id} className="item-card-compact">
                      <div className="item-info">
                        <h4 className="item-title">{addr.fullName}</h4>
                        <p className="item-desc">{addr.detail}, {addr.ward}, {addr.district}, {addr.province}</p>
                      </div>
                      <div className="item-actions-row">
                        <button className="action-btn-icon edit-btn" onClick={() => { setEditingAddress(addr); setShowAddressModal(true); }}><Edit size={18} /></button>
                        <button className="action-btn-icon delete-btn" onClick={() => deleteAddress(addr._id)}><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB PAYMENT */}
            {activeTab === "payment" && (
              <div className="card-section">
                <div className="section-header-flex">
                  <h2>Phương thức thanh toán</h2>
                  <button className="btn-primary" onClick={() => { setEditingPayment(null); setShowPaymentModal(true); }}>
                    <Plus size={18} /> Thêm mới
                  </button>
                </div>
                <div className="list-container">
                  {user.paymentMethods?.length === 0 && <p className="text-muted">Chưa có phương thức thanh toán nào.</p>}
                  {user.paymentMethods?.map(pm => (
                    <div key={pm._id} className="item-card-compact">
                      <div className="item-info">
                        <div className="payment-type-badge">
                          <CreditCard size={18} />
                          <h4 className="item-title">{pm.type}</h4>
                        </div>
                      </div>
                      <div className="item-actions-row">
                        <button className="action-btn-icon edit-btn" onClick={() => { setEditingPayment(pm); setShowPaymentModal(true); }}><Edit size={18} /></button>
                        <button className="action-btn-icon delete-btn" onClick={() => deletePayment(pm._id)}><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      <AddressModal isOpen={showAddressModal} onClose={() => { setEditingAddress(null); setShowAddressModal(false); }} onSave={saveAddress} initialData={editingAddress} />
      <PaymentModal isOpen={showPaymentModal} onClose={() => { setEditingPayment(null); setShowPaymentModal(false); }} onSave={savePayment} initialData={editingPayment} />

      <Footer />
    </div>
  );
};

export default Profile;