/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, Package, MapPin, Tag, LogOut, Plus, 
  Trash2, CreditCard, Edit, Heart, Search, Eye
} from "lucide-react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import axios from "axios";
import AddressModal from "./AddressModal";
import PaymentModal from "./PaymentModal";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("info");

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [editingAddress, setEditingAddress] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);

  // State quản lý đơn hàng
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [activeOrderFilter, setActiveOrderFilter] = useState("all");

  // 1. CHUẨN HÓA LẠI CÁC TABS THEO YÊU CẦU
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
  const fetchUserAndOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    const tokenHeader = { headers: { Authorization: `Bearer ${token}` } };

    try {
      // Gọi API lấy User Info
      const { data: userData } = await axios.get("http://localhost:5000/api/users/profile", tokenHeader);
      if (userData.role === "admin") {
        navigate("/admin");
        return;
      }
      setUser(userData);

      // Gọi API lấy Đơn hàng
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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    window.location.reload();
  };

  /* ================= LỌC & HIỂN THỊ ĐƠN HÀNG ================= */
  
  // 2. LOGIC LỌC ĐƠN HÀNG VÀO TỪNG TAB
  const filteredOrders = orders.filter(order => {
    if (activeOrderFilter === "all") return true;
    
    // Tab Chờ xác nhận: Chứa đơn COD, đơn Online đang quét mã, và đơn Online đã trả tiền
    if (activeOrderFilter === "waiting") return ["waiting_approval", "pending", "paid"].includes(order.status);
    
    // Các tab còn lại map 1-1 với trạng thái
    return order.status === activeOrderFilter;
  });

  // Helper function đếm số lượng cho từng Tab
  const getTabCount = (tabId) => {
    if (tabId === "all") return orders.length;
    if (tabId === "waiting") return orders.filter(o => ["waiting_approval", "pending", "paid"].includes(o.status)).length;
    return orders.filter(o => o.status === tabId).length;
  };

  // 3. LOGIC HIỂN THỊ TEXT TRẠNG THÁI TRÊN TỪNG ĐƠN HÀNG
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
        {/* LƯỚI 2 CỘT: SIDEBAR & MAIN CONTENT */}
        <div className="profile-grid">

          {/* CỘT TRÁI: SIDEBAR */}
          <aside className="profile-sidebar-card">
            <div className="user-profile-header">
              <div className="avatar-wrapper">
                <img
                  src={`https://ui-avatars.com/api/?name=${user.name}&background=0D9488&color=fff`}
                  alt="Avatar"
                />
              </div>
              <div className="user-info">
                <h4>{user.name}</h4>
              </div>
            </div>

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
              <div className="card-section">
                <h2>Thông tin cá nhân</h2>
                <div className="info-content">
                  <p><strong>Họ và tên:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                </div>
              </div>
            )}

            {/* TAB ORDERS (ĐÃ ĐƯỢC CẬP NHẬT GIAO DIỆN) */}
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

                {/* TABS LỌC TRẠNG THÁI */}
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
                        <div className="order-card-footer">
                          <div className="total-display">
                            Thành tiền: <strong>{order.total.toLocaleString()}đ</strong>
                          </div>
                          <div className="action-buttons">
                            {/* Nút Xem chi tiết đã được liên kết đúng */}
                            <button className="btn-outline-small" onClick={() => navigate(`/order/${order._id}`)}>
                              <Eye size={16} /> Xem chi tiết
                            </button>
                            
                            {/* Cập nhật điều kiện Hủy Đơn */}
                            {["waiting_approval", "pending", "paid", "preparing", "shipping"].includes(order.status) && (
                              <button 
                                className="btn-danger-small"
                                onClick={async () => {
                                  if(window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
                                      try {
                                          const token = localStorage.getItem("token");
                                          await axios.put(`http://localhost:5000/api/orders/admin/${order._id}/status`, 
                                            { status: "cancelled" }, 
                                            { headers: { Authorization: `Bearer ${token}` } }
                                          );
                                          toast.success("Hủy đơn thành công");
                                          fetchUserAndOrders(); // Tải lại danh sách
                                      } catch (err) { toast.error("Lỗi hủy đơn"); }
                                  }
                                }}
                              >
                                Hủy đơn
                              </button>
                            )}

                            {(order.status === "done" || order.status === "cancelled" || order.status === "returned") && (
                              <button className="btn-primary-small">Mua lại</button>
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
                <div className="empty-state-container">
                  <Heart size={48} className="empty-icon" />
                  <p>Chưa có sản phẩm nào trong danh sách yêu thích.</p>
                </div>
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
                    <Plus size={18}/> Thêm mới
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
                        <button className="action-btn-icon edit-btn" onClick={() => { setEditingAddress(addr); setShowAddressModal(true); }}><Edit size={18}/></button>
                        <button className="action-btn-icon delete-btn" onClick={() => deleteAddress(addr._id)}><Trash2 size={18}/></button>
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
                    <Plus size={18}/> Thêm mới
                  </button>
                </div>
                <div className="list-container">
                  {user.paymentMethods?.length === 0 && <p className="text-muted">Chưa có phương thức thanh toán nào.</p>}
                  {user.paymentMethods?.map(pm => (
                    <div key={pm._id} className="item-card-compact">
                      <div className="item-info">
                        <div className="payment-type-badge">
                          <CreditCard size={18}/>
                          <h4 className="item-title">{pm.type}</h4>
                        </div>
                      </div>
                      <div className="item-actions-row">
                        <button className="action-btn-icon edit-btn" onClick={() => { setEditingPayment(pm); setShowPaymentModal(true); }}><Edit size={18}/></button>
                        <button className="action-btn-icon delete-btn" onClick={() => deletePayment(pm._id)}><Trash2 size={18}/></button>
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