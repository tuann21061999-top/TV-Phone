/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  User, Package, MapPin, Tag, LogOut, Plus,
  Trash2, CreditCard, Edit, Heart, Search, Eye,
  Camera, XCircle, Loader2, AlertCircle, Star, DollarSign,
  Ticket, Truck, Percent, Gift, Clock, Copy, CheckCircle,
  Phone, Home, ReceiptText, Trophy, Award, History, Info, Medal, RotateCcw
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
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabFromUrl = queryParams.get("tab");
  
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(tabFromUrl || "info");

  useEffect(() => {
    const tabParam = new URLSearchParams(location.search).get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

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

  // Voucher Wallet states
  const [myVouchers, setMyVouchers] = useState([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [voucherInput, setVoucherInput] = useState("");
  const [copiedCode, setCopiedCode] = useState(null);
  const [showLevelInfo, setShowLevelInfo] = useState(false);
  const [redeemedTiers, setRedeemedTiers] = useState([]);
  const [redemptionHistory, setRedemptionHistory] = useState([]);

  // Return Order Modal States
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnOrderId, setReturnOrderId] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnImages, setReturnImages] = useState([]);
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);


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
    // Pre-check which BONUS tiers the user already redeemed (persistent)
    const fetchRedeemed = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:5000/api/vouchers/redemption-history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRedeemedTiers(data.map(r => r.tier));
        setRedemptionHistory(data);
      } catch { /* ignore */ }
    };
    fetchRedeemed();
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

  // Fetch vouchers khi chuyển tab
  useEffect(() => {
    if (activeTab === "vouchers") {
      const fetchVouchers = async () => {
        setLoadingVouchers(true);
        try {
          const token = localStorage.getItem("token");
          const { data } = await axios.get("http://localhost:5000/api/vouchers/my-vouchers", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMyVouchers(data);
        } catch (error) {
          console.error("Error fetching vouchers:", error);
        } finally {
          setLoadingVouchers(false);
        }
      };
      fetchVouchers();
    }
  }, [activeTab]);

  const handleApplyVoucherCode = async () => {
    if (!voucherInput.trim()) {
      toast.error("Vui lòng nhập mã giảm giá!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/vouchers/save", {
        code: voucherInput.trim()
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Lưu mã ${voucherInput.toUpperCase()} thành công!`);
      setVoucherInput("");
      
      // Tải lại danh sách voucher để hiển thị mã vừa lưu
      const { data } = await axios.get("http://localhost:5000/api/vouchers/my-vouchers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyVouchers(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi lưu mã!");
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Đã sao chép mã ${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getVoucherColor = (index) => {
    const colors = [
      { bg: "#eef2ff", border: "#6366f1", icon: "#6366f1" },
      { bg: "#fef3c7", border: "#f59e0b", icon: "#f59e0b" },
      { bg: "#ecfdf5", border: "#10b981", icon: "#10b981" },
      { bg: "#fce7f3", border: "#ec4899", icon: "#ec4899" },
      { bg: "#e0f2fe", border: "#0ea5e9", icon: "#0ea5e9" },
      { bg: "#fef2f2", border: "#ef4444", icon: "#ef4444" },
    ];
    return colors[index % colors.length];
  };

  const getVoucherIcon = (voucher, index) => {
    const icons = [Truck, Percent, Gift, Ticket, Tag, Package];
    const Icon = icons[index % icons.length];
    return Icon;
  };

  const getVoucherLabel = (index) => {
    const labels = ["FREESHIP", "GIẢM GIÁ", "QUÀ TẶNG", "KHUYẾN MÃI", "PHỤ KIỆN", "ĐỐI TÁC"];
    return labels[index % labels.length];
  };

  const getDaysLeft = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Hết hạn hôm nay";
    if (diffDays === 1) return "Còn 1 ngày";
    return `Còn ${diffDays} ngày`;
  };

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

  // Hàm xử lý trả hàng
  const handleReturnImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error("Chỉ được chọn tối đa 5 ảnh minh chứng");
      return;
    }
    setReturnImages(files);
  };

  const submitReturnRequest = async () => {
    if (!returnReason.trim()) {
      toast.error("Vui lòng nhập lý do trả hàng");
      return;
    }
    if (returnImages.length === 0) {
      toast.error("Vui lòng cung cấp ít nhất 1 hình ảnh minh chứng");
      return;
    }

    setIsSubmittingReturn(true);
    const formData = new FormData();
    formData.append("reason", returnReason.trim());
    returnImages.forEach((img) => formData.append("images", img));

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/orders/${returnOrderId}/return`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );
      toast.success("Đã gửi yêu cầu trả hàng. Vui lòng chờ phản hồi từ quản trị viên.");
      setShowReturnModal(false);
      setReturnOrderId(null);
      setReturnReason("");
      setReturnImages([]);
      fetchUserAndOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi gửi yêu cầu trả hàng");
    } finally {
      setIsSubmittingReturn(false);
    }
  };

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
                <ReceiptText size={18} /> Lịch sử thanh toán
              </button>

              <button className="menu-item logout-text" onClick={handleLogout}>
                <LogOut size={18} /> Đăng xuất
              </button>
            </nav>
          </aside>

          {/* CỘT PHẢI: MAIN CONTENT */}
          <main className="profile-main-content">

            {/* TAB INFO */}
            {activeTab === "info" && (() => {
              const doneOrders = orders.filter(o => o.status === 'done');
              const totalSpent = doneOrders.reduce((sum, o) => sum + o.total, 0);
              // Điểm tích lũy (dùng cho cấp bậc)
              const totalPoints = Math.floor(totalSpent / 50000);
              // Điểm đã đổi
              const totalSpentPoints = redemptionHistory.reduce((s, r) => s + r.pointsSpent, 0);
              // Điểm khả dụng (dùng để đổi voucher)
              const availablePoints = totalPoints - totalSpentPoints;

              const LEVELS = [
                { name: "Normal",  min: 0,    max: 299,  color: "#64748B", icon: <User      size={20} /> },
                { name: "Bronze",  min: 300,  max: 999,  color: "#92400E", icon: <Award     size={20} /> },
                { name: "Silver",  min: 1000, max: 4999, color: "#475569", icon: <Star      size={20} /> },
                { name: "Gold",    min: 5000, max: Infinity, color: "#B45309", icon: <Trophy size={20} /> },
              ];

              const currentLevel = LEVELS.slice().reverse().find(l => totalPoints >= l.min) || LEVELS[0];
              const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1];
              const progressPct = nextLevel
                ? Math.min(100, Math.round(((totalPoints - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100))
                : 100;

              const VOUCHER_TIERS = [
                { tier: "BONUS5",  label: "Giảm 5%",  points: 200,  color: "#2563EB" },
                { tier: "BONUS10", label: "Giảm 10%", points: 500,  color: "#7C3AED" },
                { tier: "BONUS20", label: "Giảm 20%", points: 1000, color: "#DC2626" },
              ];


              const handleRedeem = async (tier) => {
                try {
                  const token = localStorage.getItem("token");
                  const { data } = await axios.post("http://localhost:5000/api/vouchers/redeem-points",
                    { tier },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  toast.success(data.message);
                  // Update from authoritative history returned by backend
                  setRedeemedTiers(data.redemptionHistory.map(r => r.tier));
                  setRedemptionHistory(data.redemptionHistory);
                } catch (error) {
                  toast.error(error.response?.data?.message || "Lỗi đổi điểm!");
                }
              };

              return (
                <div className="card-section info-dashboard" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>

                  {/* MEMBER LEVEL CARD */}
                  <div className="member-level-card" style={{ borderLeft: `4px solid ${currentLevel.color}` }}>
                    <div className="mlc-top">
                      <div className="mlc-left">
                        <span className="mlc-icon">{currentLevel.icon}</span>
                        <div>
                          <p className="mlc-label">Cấp thành viên</p>
                          <h3 className="mlc-name" style={{ color: currentLevel.color }}>{currentLevel.name}</h3>
                        </div>
                      </div>
                      <div className="mlc-right">
                        <div className="mlc-points-box">
                          <span className="mlc-points-num">{totalPoints}</span>
                          <span className="mlc-points-label">điểm tích lũy</span>
                        </div>
                        <button className="mlc-help-btn" onClick={() => setShowLevelInfo(true)} title="Giải thích hệ thống">?</button>
                      </div>
                    </div>

                    {nextLevel ? (
                      <>
                        <div className="mlc-progress-wrap">
                          <div className="mlc-progress-bar">
                            <div className="mlc-progress-fill" style={{ width: `${progressPct}%`, background: currentLevel.color }} />
                          </div>
                          <span className="mlc-progress-label">{nextLevel.min - totalPoints} điểm nữa để lên {nextLevel.icon} {nextLevel.name}</span>
                        </div>
                      </>
                    ) : (
                      <p className="mlc-max-label"><Trophy size={16} style={{display:'inline',verticalAlign:'middle',marginRight:5}} /> Bạn đã đạt cấp cao nhất!</p>
                    )}
                  </div>

                  {/* MODAL "?" giải thích level */}
                  {showLevelInfo && (
                    <div className="level-info-overlay" onClick={() => setShowLevelInfo(false)}>
                      <div className="level-info-modal" onClick={e => e.stopPropagation()}>
                        <div className="lim-header">
                          <h3><Trophy size={18} style={{display:'inline',marginRight:6,verticalAlign:'middle'}} /> Hệ thống cấp thành viên</h3>
                          <button onClick={() => setShowLevelInfo(false)}>✕</button>
                        </div>
                        <p className="lim-intro">Tích điểm từ mỗi đơn hàng đã giao thành công. <strong>50.000đ = 1 điểm</strong>. Điểm dùng để lên cấp và đổi voucher.</p>
                        <div className="lim-list">
                          <div className="lim-list-header"><span>Cấp</span><span>Điểm cần</span></div>
                          <div className="lim-list-row"><span><User  size={13} style={{verticalAlign:'middle',marginRight:5}} />Normal</span><span>Mặc định</span></div>
                          <div className="lim-list-row"><span><Award size={13} style={{verticalAlign:'middle',marginRight:5}} />Bronze</span><span>300 điểm</span></div>
                          <div className="lim-list-row"><span><Star  size={13} style={{verticalAlign:'middle',marginRight:5}} />Silver</span><span>1.000 điểm</span></div>
                          <div className="lim-list-row"><span><Trophy size={13} style={{verticalAlign:'middle',marginRight:5}} />Gold</span><span>5.000 điểm</span></div>
                        </div>
                        <p className="lim-note"><Info size={13} style={{display:'inline',verticalAlign:'middle',marginRight:4}} /> Lên cấp <strong>không mất điểm</strong>. Điểm chỉ bị trừ khi đổi voucher.</p>
                        <div className="lim-separator" />
                        <p className="lim-intro"><strong>Đổi điểm lấy voucher:</strong></p>
                        <div className="lim-list">
                          <div className="lim-list-header"><span>Voucher</span><span>Điểm cần</span></div>
                          <div className="lim-list-row"><span>BONUS5 – Giảm 5%</span><span>200 điểm</span></div>
                          <div className="lim-list-row"><span>BONUS10 – Giảm 10%</span><span>500 điểm</span></div>
                          <div className="lim-list-row"><span>BONUS20 – Giảm 20%</span><span>1.000 điểm</span></div>
                        </div>
                        <p className="lim-note"><AlertCircle size={13} style={{display:'inline',verticalAlign:'middle',marginRight:4}} /> Mỗi voucher tạo ra chỉ dùng được <strong>1 lần</strong>. Có thể đổi <strong>nhiều lần</strong> miễn là còn đủ điểm khả dụng.</p>
                      </div>
                    </div>
                  )}

                  {/* THỐNG KÊ */}
                  <div className="profile-stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon-wrapper bg-blue-100 text-blue-600"><Package size={24} /></div>
                      <div className="stat-info">
                        <h3>{doneOrders.length}</h3>
                        <p>Đơn hàng đã giao</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon-wrapper bg-green-100 text-green-600"><DollarSign size={24} /></div>
                      <div className="stat-info">
                        <h3>{totalSpent.toLocaleString()}đ</h3>
                        <p>Tổng chi tiêu</p>
                      </div>
                    </div>
                  </div>

                  {/* ĐỔI ĐIỂM LẤY VOUCHER */}
                  <div className="redeem-section">
                    <h3 className="redeem-title"><Gift size={17} style={{display:'inline',verticalAlign:'middle',marginRight:6}} /> Đổi điểm lấy voucher</h3>
                    <p className="redeem-subtitle">
                      Tích lũy: <strong>{totalPoints} điểm</strong>
                      {totalSpentPoints > 0 && <> &nbsp;·&nbsp; Đã dùng: <strong style={{color:'#DC2626'}}>{totalSpentPoints}</strong> &nbsp;·&nbsp; Khả dụng: <strong style={{color:'#059669'}}>{availablePoints} điểm</strong></>}
                    </p>
                    <div className="redeem-grid">
                      {VOUCHER_TIERS.map(v => {
                        const canAfford = availablePoints >= v.points;
                        return (
                          <div key={v.tier} className={`redeem-card ${!canAfford ? 'redeem-card-disabled' : ''}`}>
                            <div className="redeem-card-badge" style={{ background: v.color }}>{v.tier}</div>
                            <p className="redeem-card-label">{v.label}</p>
                            <p className="redeem-card-cost">{v.points} điểm</p>
                            <button
                              className="redeem-btn"
                              disabled={!canAfford}
                              style={canAfford ? { background: v.color } : {}}
                              onClick={() => handleRedeem(v.tier)}
                            >
                              {canAfford ? 'Đổi ngay' : 'Chưa đủ điểm'}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Lịch sử đổi điểm */}
                    {redemptionHistory.length > 0 && (
                      <div className="redemption-log">
                        <h4 className="redemption-log-title"><History size={13} style={{display:'inline',verticalAlign:'middle',marginRight:5}} /> Lịch sử đổi điểm</h4>
                        {[...redemptionHistory].reverse().map((r, i) => (
                          <div key={i} className="redemption-log-row">
                            <span className="rl-code">{r.code}</span>
                            <span className="rl-pts">-{r.pointsSpent} điểm</span>
                            <span className="rl-date">{new Date(r.redeemedAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>{/* end redeem-section */}

                  {/* THÔNG TIN CÁ NHÂN */}
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
              );
            })()}


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

                            {order.status === "done" && (() => {
                               const isWithin15Days = (new Date() - new Date(order.updatedAt)) / (1000 * 60 * 60 * 24) <= 15;
                               const returnReq = order.returnRequest;

                               if (returnReq && returnReq.isRequested) {
                                  if (returnReq.status === "pending") {
                                    return <span className="badge badge-warning" style={{marginLeft: 10, alignSelf: 'center', backgroundColor: '#fef3c7', color: '#d97706', padding: '6px 12px', borderRadius: '4px', fontSize: '13px'}}>Đang yêu cầu trả hàng</span>;
                                  }
                                  if (returnReq.status === "rejected") {
                                    return <span className="badge badge-danger" style={{marginLeft: 10, alignSelf: 'center', backgroundColor: '#fee2e2', color: '#ef4444', padding: '6px 12px', borderRadius: '4px', fontSize: '13px'}} title={returnReq.rejectedReason}>Bị từ chối trả hàng</span>;
                                  }
                               } else if (isWithin15Days) {
                                  return (
                                    <button
                                      className="btn-danger-small"
                                      style={{ backgroundColor: '#fff', color: '#ef4444', borderColor: '#ef4444' }}
                                      onClick={() => {
                                        // Kiểm tra số điểm thưởng trước khi cho phép trả hàng
                                        const doneOrders = orders.filter(o => o.status === 'done');
                                        const totalSpent = doneOrders.reduce((sum, ord) => sum + ord.total, 0);
                                        const currentTotalPoints = Math.floor(totalSpent / 50000);
                                        const currentSpentPoints = redemptionHistory.reduce((s, r) => s + r.pointsSpent, 0);
                                        const currentAvailablePoints = currentTotalPoints - currentSpentPoints;
                                        
                                        // Số điểm mà đơn hàng này "đóng góp" vào tổng tích lũy
                                        // Đoạn này lấy tổng điểm mới nếu trừ đi hóa đơn này
                                        const newTotalSpent = totalSpent - order.total;
                                        const newTotalPoints = Math.floor(newTotalSpent / 50000);
                                        const newAvailablePoints = newTotalPoints - currentSpentPoints;

                                        if (newAvailablePoints < 0) {
                                            toast.error("Điểm thưởng của đơn này đã được dùng để đổi mã giảm giá. Không thể yêu cầu hoàn trả đơn hàng này nữa.");
                                            return;
                                        }

                                        setReturnOrderId(order._id);
                                        setShowReturnModal(true);
                                      }}
                                    >
                                      <RotateCcw size={16} /> Yêu cầu trả hàng
                                    </button>
                                  );
                               }
                               return null;
                            })()}
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

            {/* TAB VOUCHERS - KHO VOUCHER */}
            {activeTab === "vouchers" && (
              <div className="card-section" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
                {/* Header */}
                <div className="voucher-page-header">
                  <div>
                    <h2 className="voucher-page-title">Kho Voucher của tôi</h2>
                    <p className="voucher-page-subtitle">Lưu và sử dụng mã giảm giá khi mua hàng</p>
                  </div>
                  <div className="voucher-input-section">
                    <div className="voucher-apply-box">
                      <Tag size={16} className="apply-icon" />
                      <input
                        type="text"
                        placeholder="Nhập mã khuyến mãi tại đây"
                        value={voucherInput}
                        onChange={(e) => setVoucherInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyVoucherCode()}
                      />
                      <button className="btn-apply-voucher" onClick={handleApplyVoucherCode}>Áp dụng</button>
                    </div>
                  </div>
                </div>

                {/* Voucher Grid */}
                {loadingVouchers ? (
                  <div style={{ textAlign: "center", padding: "60px", color: "#64748B" }}>
                    <Loader2 className="spinner" size={32} style={{ margin: '0 auto 12px' }} />
                    <p>Đang tải kho voucher...</p>
                  </div>
                ) : myVouchers.length === 0 ? (
                  <div className="voucher-empty-state">
                    <Ticket size={64} strokeWidth={1} />
                    <h3>Chưa có voucher nào</h3>
                    <p>Các mã giảm giá sẽ xuất hiện tại đây khi có chương trình khuyến mãi mới.</p>
                  </div>
                ) : (
                  <div className="voucher-card-grid">
                    {myVouchers.map((voucher, index) => {
                      const colorScheme = getVoucherColor(index);
                      const VoucherIcon = getVoucherIcon(voucher, index);
                      const daysLeft = getDaysLeft(voucher.expiryDate);
                      const isExpiringSoon = daysLeft.includes("1 ng\u00e0y") || daysLeft.includes("h\u00f4m nay");

                      return (
                        <div
                          key={voucher._id}
                          className="voucher-card"
                          style={{ borderLeftColor: colorScheme.border }}
                        >
                          {/* Left Icon Section */}
                          <div className="voucher-card-icon" style={{ backgroundColor: colorScheme.bg }}>
                            <VoucherIcon size={32} color={colorScheme.icon} />
                            <span className="voucher-type-label" style={{ color: colorScheme.icon }}>
                              {getVoucherLabel(index)}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="voucher-card-content">
                            <h3 className="voucher-card-title">
                              {voucher.discountType === "percentage"
                                ? `Giảm ${voucher.value}%`
                                : `Giảm ${voucher.value.toLocaleString()}đ`
                              }
                              {voucher.maxDiscountAmount && voucher.discountType === "percentage" &&
                                ` (tối đa ${voucher.maxDiscountAmount.toLocaleString()}đ)`
                              }
                            </h3>
                            <p className="voucher-card-desc">{voucher.description || `Áp dụng cho đơn hàng từ ${voucher.minOrderValue.toLocaleString()}đ`}</p>
                            
                            <div className="voucher-card-tags">
                              {voucher.minOrderValue > 0 && (
                                <span className="voucher-tag">Đơn tối thiểu {voucher.minOrderValue.toLocaleString()}đ</span>
                              )}
                            </div>

                            <div className="voucher-card-footer">
                              <div className="voucher-expiry">
                                <Clock size={13} />
                                <span className={isExpiringSoon ? "expiry-warning" : ""}>
                                  {daysLeft}
                                </span>
                              </div>
                              <div className="voucher-card-actions">
                                <button
                                  className="btn-copy-code"
                                  onClick={() => handleCopyCode(voucher.code)}
                                  title="Sao chép mã"
                                >
                                  {copiedCode === voucher.code ? <CheckCircle size={14} /> : <Copy size={14} />}
                                  {voucher.code}
                                </button>
                                <button
                                  className="btn-use-voucher"
                                  onClick={() => navigate('/cart')}
                                >
                                  Dùng ngay
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB ADDRESS - REDESIGNED */}
            {activeTab === "address" && (
              <div className="card-section" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>

                {/* Header */}
                <div className="address-page-header">
                  <div>
                    <h2 className="address-page-title">Sổ địa chỉ</h2>
                    <p className="address-page-subtitle">Quản lý địa chỉ giao hàng của bạn</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="address-count-badge">
                      {user.addresses?.length || 0} / 5 địa chỉ
                    </span>
                    {(user.addresses?.length || 0) < 5 && (
                      <button className="btn-add-address" onClick={() => { setEditingAddress(null); setShowAddressModal(true); }}>
                        <Plus size={16} /> Thêm địa chỉ
                      </button>
                    )}
                  </div>
                </div>

                {/* Empty state */}
                {(!user.addresses || user.addresses.length === 0) && (
                  <div className="address-empty-state">
                    <MapPin size={52} strokeWidth={1} />
                    <h3>Chưa có địa chỉ nào</h3>
                    <p>Thêm địa chỉ giao hàng để việc mua sắm trở nên nhanh chóng hơn.</p>
                    <button className="btn-add-address" onClick={() => { setEditingAddress(null); setShowAddressModal(true); }}>
                      <Plus size={16} /> Thêm địa chỉ đầu tiên
                    </button>
                  </div>
                )}

                {/* Address cards grid */}
                <div className="address-cards-grid">
                  {user.addresses?.map((addr, index) => (
                    <div key={addr._id} className={`address-card ${index === 0 ? 'address-card-default' : ''}`}>
                      {index === 0 && (
                        <span className="address-default-badge">Mặc định</span>
                      )}
                      <div className="address-card-icon-wrap">
                        <Home size={22} />
                      </div>
                      <div className="address-card-body">
                        <div className="address-card-name-row">
                          <span className="address-card-name">{addr.fullName}</span>
                          {addr.phone && (
                            <span className="address-card-phone"><Phone size={13} /> {addr.phone}</span>
                          )}
                        </div>
                        <p className="address-card-detail">
                          {[addr.detail, addr.ward, addr.district, addr.province].filter(Boolean).join(', ')}
                        </p>
                      </div>
                      <div className="address-card-actions">
                        <button className="addr-btn-edit" onClick={() => { setEditingAddress(addr); setShowAddressModal(true); }}>
                          <Edit size={15} /> Sửa
                        </button>
                        <button className="addr-btn-delete" onClick={() => deleteAddress(addr._id)}>
                          <Trash2 size={15} /> Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {(user.addresses?.length || 0) >= 5 && (
                  <p className="address-limit-notice">⚠️ Bạn đã đạt giới hạn 5 địa chỉ. Xóa một địa chỉ để thêm mới.</p>
                )}
              </div>
            )}

            {/* TAB PAYMENT HISTORY - REDESIGNED */}
            {activeTab === "payment" && (() => {
              const paidOrders = orders.filter(o => ['paid', 'preparing', 'shipping', 'done'].includes(o.status));
              const totalSpent = paidOrders.reduce((sum, o) => sum + o.total, 0);
              const methodMap = {
                'VNPAY': { label: 'VNPay', color: '#0063a5', bg: '#e8f2fb', icon: '💳' },
                'MOMO': { label: 'MoMo', color: '#a50073', bg: '#fce8f7', icon: '📱' },
                'COD': { label: 'Tiền mặt (COD)', color: '#059669', bg: '#ecfdf5', icon: '💵' },
              };
              return (
                <div className="card-section" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>

                  {/* Header stats */}
                  <div className="payment-history-header">
                    <div>
                      <h2 className="payment-history-title">Lịch sử thanh toán</h2>
                      <p className="payment-history-subtitle">Tổng quan các giao dịch thành công của bạn</p>
                    </div>
                  </div>

                  {/* Stat cards */}
                  <div className="payment-stat-row">
                    <div className="payment-stat-card">
                      <div className="payment-stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}><ReceiptText size={22} /></div>
                      <div>
                        <p className="payment-stat-label">Giao dịch thành công</p>
                        <h3 className="payment-stat-value">{paidOrders.length}</h3>
                      </div>
                    </div>
                    <div className="payment-stat-card">
                      <div className="payment-stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}><DollarSign size={22} /></div>
                      <div>
                        <p className="payment-stat-label">Tổng đã thanh toán</p>
                        <h3 className="payment-stat-value">{totalSpent.toLocaleString()}đ</h3>
                      </div>
                    </div>
                  </div>

                  {/* Transaction list */}
                  {paidOrders.length === 0 ? (
                    <div className="address-empty-state">
                      <ReceiptText size={52} strokeWidth={1} />
                      <h3>Chưa có giao dịch nào</h3>
                      <p>Các đơn hàng đã thanh toán thành công sẽ hiển thị tại đây.</p>
                    </div>
                  ) : (
                    <div className="payment-history-list">
                      {paidOrders.map(order => {
                        const method = methodMap[order.paymentMethod] || { label: order.paymentMethod, color: '#64748b', bg: '#f1f5f9', icon: '💰' };
                        const firstItem = order.items?.[0];
                        return (
                          <div key={order._id} className="payment-history-card">
                            <div className="phc-left">
                              <div className="phc-img">
                                <img src={firstItem?.image || '/no-image.png'} alt={firstItem?.name} />
                              </div>
                              <div className="phc-info">
                                <p className="phc-order-id">Đơn #{order._id.slice(-6).toUpperCase()}</p>
                                <p className="phc-product-name">{firstItem?.name}{order.items?.length > 1 ? ` +${order.items.length - 1} sản phẩm` : ''}</p>
                                <p className="phc-date">{new Date(order.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                              </div>
                            </div>
                            <div className="phc-right">
                              <span className="phc-method-badge" style={{ color: method.color, background: method.bg }}>
                                {method.icon} {method.label}
                              </span>
                              <p className="phc-total">{order.total.toLocaleString()}đ</p>
                              <span className="phc-status-ok">✓ Đã thanh toán</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

          </main>
        </div>
      </div>

      <AddressModal isOpen={showAddressModal} onClose={() => { setEditingAddress(null); setShowAddressModal(false); }} onSave={saveAddress} initialData={editingAddress} />
      <PaymentModal isOpen={showPaymentModal} onClose={() => { setEditingPayment(null); setShowPaymentModal(false); }} onSave={savePayment} initialData={editingPayment} />

      {/* MODAL TRẢ HÀNG */}
      {showReturnModal && (
        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '500px', width: '90%', backgroundColor: '#fff', padding: '24px', borderRadius: '12px', margin: 'auto' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Yêu cầu trả hàng</h3>
              <button className="close-btn" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => {setShowReturnModal(false); setReturnOrderId(null); setReturnReason(""); setReturnImages([]);}}><XCircle size={20} /></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>
                Bạn có thể gửi yêu cầu trả hàng nếu sản phẩm gặp lỗi từ nhà sản xuất hoặc không đúng mô tả trong vòng 15 ngày. 
                Vui lòng ghi rõ lý do và tải lên hình ảnh minh chứng.
              </p>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>Lý do trả hàng <span className="text-danger" style={{color: 'red'}}>*</span></label>
                <textarea
                  className="input-field"
                  rows="4"
                  placeholder="Mô tả chi tiết lý do bạn muốn trả hàng..."
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none'}}
                ></textarea>
              </div>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>Hình ảnh minh chứng <span className="text-danger" style={{color: 'red'}}>*</span> (Tối đa 5 ảnh)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleReturnImageChange}
                  className="input-field"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px' }}
                />
                {returnImages.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {Array.from(returnImages).map((file, idx) => (
                      <img key={idx} src={URL.createObjectURL(file)} alt="preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer" style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #e2e8f0'}}>
              <button className="btn-secondary" style={{padding: '8px 16px', borderRadius: '6px', background: '#f1f5f9'}} onClick={() => {setShowReturnModal(false); setReturnOrderId(null); setReturnReason(""); setReturnImages([]);}}>Hủy bỏ</button>
              <button className="btn-primary" style={{padding: '8px 16px', borderRadius: '6px', background: '#ef4444', color: '#fff', border: 'none'}} onClick={submitReturnRequest} disabled={isSubmittingReturn}>
                {isSubmittingReturn ? <Loader2 size={16} className="spinner" style={{animation: 'spin 1s linear infinite'}} /> : "Gửi yêu cầu"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Profile;