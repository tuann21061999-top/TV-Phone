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
    <div className="flex flex-col items-center px-5 pb-5 border-b border-slate-100 mb-4">
      <div className="relative w-24 h-24 mb-4">
        {user.avatar ? (
          <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover border-[3px] border-blue-50 shadow-[0_4px_12px_rgba(0,0,0,0.08)]" />
        ) : (
          <img
            src={`https://ui-avatars.com/api/?name=${user.name}&background=0D9488&color=fff&size=128`}
            alt="Default Avatar"
            className="w-full h-full rounded-full object-cover border-[3px] border-blue-50 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
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

      <div className="text-center">
        <h4 className="m-0 mb-1.5 text-lg font-semibold text-slate-800">{user.name}</h4>
        <p className="m-0 text-[13px] text-slate-500">{user.email}</p>
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
    <div className="bg-slate-50 min-h-screen font-sans">
      <Header />

      <div className="w-full max-w-[1500px] mx-auto px-5 md:px-10 py-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 md:gap-8 items-start">

          {/* CỘT TRÁI: SIDEBAR */}
          <aside className="bg-white rounded-xl py-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
            {renderSidebarAvatar()}

            <nav className="flex flex-col">
              <button className={`flex items-center gap-3 w-full py-3 px-6 border-none bg-transparent text-sm cursor-pointer transition-all text-left ${activeTab === "info" ? "bg-blue-50 text-blue-600 font-medium border-l-[3px] border-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"}`} onClick={() => setActiveTab("info")}>
                <User size={18} /> Thông tin cá nhân
              </button>

              <button className={`flex items-center gap-3 w-full py-3 px-6 border-none bg-transparent text-sm cursor-pointer transition-all text-left ${activeTab === "orders" ? "bg-blue-50 text-blue-600 font-medium border-l-[3px] border-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"}`} onClick={() => setActiveTab("orders")}>
                <Package size={18} /> Đơn hàng của tôi
              </button>

              <button className={`flex items-center gap-3 w-full py-3 px-6 border-none bg-transparent text-sm cursor-pointer transition-all text-left ${activeTab === "favorites" ? "bg-blue-50 text-blue-600 font-medium border-l-[3px] border-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"}`} onClick={() => setActiveTab("favorites")}>
                <Heart size={18} /> Sản phẩm yêu thích
              </button>

              <button className={`flex items-center gap-3 w-full py-3 px-6 border-none bg-transparent text-sm cursor-pointer transition-all text-left ${activeTab === "vouchers" ? "bg-blue-50 text-blue-600 font-medium border-l-[3px] border-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"}`} onClick={() => setActiveTab("vouchers")}>
                <Tag size={18} /> Mã giảm giá
              </button>

              <button className={`flex items-center gap-3 w-full py-3 px-6 border-none bg-transparent text-sm cursor-pointer transition-all text-left ${activeTab === "address" ? "bg-blue-50 text-blue-600 font-medium border-l-[3px] border-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"}`} onClick={() => setActiveTab("address")}>
                <MapPin size={18} /> Sổ địa chỉ
              </button>

              <button className={`flex items-center gap-3 w-full py-3 px-6 border-none bg-transparent text-sm cursor-pointer transition-all text-left ${activeTab === "payment" ? "bg-blue-50 text-blue-600 font-medium border-l-[3px] border-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"}`} onClick={() => setActiveTab("payment")}>
                <ReceiptText size={18} /> Lịch sử thanh toán
              </button>

              <button className="flex items-center gap-3 w-full py-3 px-6 border-none bg-transparent text-sm cursor-pointer transition-all text-left text-red-500 mt-2.5 border-t border-slate-100 hover:bg-red-50 hover:text-red-600" onClick={handleLogout}>
                <LogOut size={18} /> Đăng xuất
              </button>
            </nav>
          </aside>

          {/* CỘT PHẢI: MAIN CONTENT */}
          <main className="min-w-0">

            {/* TAB INFO */}
            {activeTab === "info" && (() => {
              const doneOrders = orders.filter(o => o.status === 'done');
              const totalSpent = doneOrders.reduce((sum, o) => sum + o.total, 0);
              const totalPoints = Math.floor(totalSpent / 50000);
              const totalSpentPoints = redemptionHistory.reduce((s, r) => s + r.pointsSpent, 0);
              const availablePoints = totalPoints - totalSpentPoints;

              const LEVELS = [
                { name: "Normal", min: 0, max: 299, color: "#64748B", icon: <User size={20} /> },
                { name: "Bronze", min: 300, max: 999, color: "#92400E", icon: <Award size={20} /> },
                { name: "Silver", min: 1000, max: 4999, color: "#475569", icon: <Star size={20} /> },
                { name: "Gold", min: 5000, max: Infinity, color: "#B45309", icon: <Trophy size={20} /> },
              ];

              const currentLevel = LEVELS.slice().reverse().find(l => totalPoints >= l.min) || LEVELS[0];
              const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1];
              const progressPct = nextLevel
                ? Math.min(100, Math.round(((totalPoints - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100))
                : 100;

              const VOUCHER_TIERS = [
                { tier: "BONUS5", label: "Giảm 5%", points: 200, color: "#2563EB" },
                { tier: "BONUS10", label: "Giảm 10%", points: 500, color: "#7C3AED" },
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
                  setRedeemedTiers(data.redemptionHistory.map(r => r.tier));
                  setRedemptionHistory(data.redemptionHistory);
                } catch (error) {
                  toast.error(error.response?.data?.message || "Lỗi đổi điểm!");
                }
              };

              return (
                <div className="flex flex-col gap-6">

                  {/* MEMBER LEVEL CARD */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm" style={{ borderLeft: `4px solid ${currentLevel.color}` }}>
                    <div className="flex justify-between items-start mb-4.5">
                      <div className="flex items-center gap-3.5">
                        <span className="text-[36px] leading-none">{currentLevel.icon}</span>
                        <div>
                          <p className="text-xs text-slate-400 uppercase tracking-wide m-0 mb-0.5 font-semibold">Cấp thành viên</p>
                          <h3 className="text-2xl font-extrabold m-0" style={{ color: currentLevel.color }}>{currentLevel.name}</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="block text-[28px] font-extrabold text-slate-800 leading-none">{totalPoints}</span>
                          <span className="text-xs text-slate-500">điểm tích lũy</span>
                        </div>
                        <button className="w-7 h-7 rounded-full border-2 border-slate-300 bg-slate-50 text-slate-500 text-sm font-bold cursor-pointer transition-all shrink-0 flex items-center justify-center hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50" onClick={() => setShowLevelInfo(true)} title="Giải thích hệ thống">?</button>
                      </div>
                    </div>

                    {nextLevel ? (
                      <div className="flex flex-col gap-1.5 mt-2">
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background: currentLevel.color }} />
                        </div>
                        <span className="text-xs text-slate-500">{nextLevel.min - totalPoints} điểm nữa để lên {nextLevel.name}</span>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-amber-700 m-0 flex items-center gap-1 mt-2"><Trophy size={16} /> Bạn đã đạt cấp cao nhất!</p>
                    )}
                  </div>

                  {/* MODAL "?" giải thích level */}
                  {showLevelInfo && (
                    <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-[3px] z-[99999] flex items-center justify-center p-5 animate-[fadeIn_0.2s_ease]" onClick={() => setShowLevelInfo(false)}>
                      <div className="bg-white rounded-2xl p-7 w-full max-w-[520px] shadow-[0_20px_60px_rgba(0,0,0,0.15)]" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold m-0 text-slate-800 flex items-center gap-1.5"><Trophy size={18} /> Hệ thống cấp thành viên</h3>
                          <button className="bg-transparent border-none text-lg text-slate-500 cursor-pointer leading-none hover:text-slate-900" onClick={() => setShowLevelInfo(false)}>✕</button>
                        </div>
                        <p className="text-sm text-slate-600 m-0 mb-3 leading-relaxed">Tích điểm từ mỗi đơn hàng đã giao thành công. <strong className="text-slate-800">50.000đ = 1 điểm</strong>. Điểm dùng để lên cấp và đổi voucher.</p>

                        <div className="mb-3 border border-slate-200 rounded-lg overflow-hidden">
                          <div className="flex justify-between py-1.5 px-3 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wide border-b border-slate-200"><span>Cấp</span><span>Điểm cần</span></div>
                          <div className="flex justify-between items-center py-2 px-3 border-b border-slate-100 text-[13px] text-slate-700"><span className="flex items-center gap-1"><User size={13} />Normal</span><span className="font-semibold text-slate-900 ml-3">Mặc định</span></div>
                          <div className="flex justify-between items-center py-2 px-3 border-b border-slate-100 text-[13px] text-slate-700"><span className="flex items-center gap-1"><Award size={13} />Bronze</span><span className="font-semibold text-slate-900 ml-3">300 điểm</span></div>
                          <div className="flex justify-between items-center py-2 px-3 border-b border-slate-100 text-[13px] text-slate-700"><span className="flex items-center gap-1"><Star size={13} />Silver</span><span className="font-semibold text-slate-900 ml-3">1.000 điểm</span></div>
                          <div className="flex justify-between items-center py-2 px-3 text-[13px] text-slate-700"><span className="flex items-center gap-1"><Trophy size={13} />Gold</span><span className="font-semibold text-slate-900 ml-3">5.000 điểm</span></div>
                        </div>

                        <p className="text-[13px] text-slate-500 m-0 mb-2 leading-relaxed flex gap-1"><Info size={14} className="shrink-0 mt-0.5" /> Lên cấp <strong className="text-slate-700">không mất điểm</strong>. Điểm chỉ bị trừ khi đổi voucher.</p>
                        <div className="border-0 border-t border-dashed border-slate-200 my-4" />
                        <p className="text-sm text-slate-600 m-0 mb-2 leading-relaxed"><strong className="text-slate-800">Đổi điểm lấy voucher:</strong></p>

                        <div className="mb-3 border border-slate-200 rounded-lg overflow-hidden">
                          <div className="flex justify-between py-1.5 px-3 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wide border-b border-slate-200"><span>Voucher</span><span>Điểm cần</span></div>
                          <div className="flex justify-between items-center py-2 px-3 border-b border-slate-100 text-[13px] text-slate-700"><span>BONUS5 – Giảm 5%</span><span className="font-semibold text-slate-900 ml-3">200 điểm</span></div>
                          <div className="flex justify-between items-center py-2 px-3 border-b border-slate-100 text-[13px] text-slate-700"><span>BONUS10 – Giảm 10%</span><span className="font-semibold text-slate-900 ml-3">500 điểm</span></div>
                          <div className="flex justify-between items-center py-2 px-3 text-[13px] text-slate-700"><span>BONUS20 – Giảm 20%</span><span className="font-semibold text-slate-900 ml-3">1.000 điểm</span></div>
                        </div>
                        <p className="text-[13px] text-slate-500 m-0 leading-relaxed flex gap-1"><AlertCircle size={14} className="shrink-0 mt-0.5" /> Mỗi voucher tạo ra chỉ dùng được <strong className="text-slate-700">1 lần</strong>. Có thể đổi <strong className="text-slate-700">nhiều lần</strong> miễn là còn đủ điểm khả dụng.</p>
                      </div>
                    </div>
                  )}

                  {/* THỐNG KÊ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="bg-white rounded-xl p-5 flex items-center gap-4 shadow-sm border border-slate-100">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-blue-100 text-blue-600"><Package size={24} /></div>
                      <div>
                        <h3 className="m-0 mb-1 text-[22px] text-slate-800 font-bold">{doneOrders.length}</h3>
                        <p className="m-0 text-[13px] text-slate-500 font-medium">Đơn hàng đã giao</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 flex items-center gap-4 shadow-sm border border-slate-100">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-600"><DollarSign size={24} /></div>
                      <div>
                        <h3 className="m-0 mb-1 text-[22px] text-slate-800 font-bold">{totalSpent.toLocaleString()}đ</h3>
                        <p className="m-0 text-[13px] text-slate-500 font-medium">Tổng chi tiêu</p>
                      </div>
                    </div>
                  </div>

                  {/* ĐỔI ĐIỂM LẤY VOUCHER */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-[17px] font-bold text-slate-800 m-0 mb-1.5 flex items-center gap-1.5"><Gift size={17} /> Đổi điểm lấy voucher</h3>
                    <p className="text-[13px] text-slate-500 m-0 mb-4">
                      Tích lũy: <strong className="text-slate-700">{totalPoints} điểm</strong>
                      {totalSpentPoints > 0 && <> &nbsp;·&nbsp; Đã dùng: <strong className="text-red-600">{totalSpentPoints}</strong> &nbsp;·&nbsp; Khả dụng: <strong className="text-emerald-600">{availablePoints} điểm</strong></>}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      {VOUCHER_TIERS.map(v => {
                        const canAfford = availablePoints >= v.points;
                        return (
                          <div key={v.tier} className={`border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-2 text-center transition-shadow ${!canAfford ? 'opacity-55' : 'hover:shadow-md'}`}>
                            <div className="text-white text-xs font-bold py-1 px-3 rounded-full tracking-wide" style={{ background: v.color }}>{v.tier}</div>
                            <p className="text-[15px] font-bold text-slate-800 m-0">{v.label}</p>
                            <p className="text-[13px] text-slate-500 m-0">{v.points} điểm</p>
                            <button
                              className={`w-full border-none rounded-lg py-2.5 text-[13px] font-semibold text-white mt-1 transition-opacity ${canAfford ? 'cursor-pointer hover:opacity-90' : 'cursor-not-allowed bg-slate-400'}`}
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
                      <div className="mt-4 border-t border-slate-100 pt-3.5">
                        <h4 className="text-[13px] font-semibold text-slate-500 m-0 mb-2.5 uppercase tracking-wide flex items-center gap-1"><History size={14} /> Lịch sử đổi điểm</h4>
                        {[...redemptionHistory].reverse().map((r, i) => (
                          <div key={i} className="flex items-center gap-3 py-1.5 border-b border-dashed border-slate-100 text-[13px] last:border-none">
                            <span className="font-bold text-slate-800 min-w-[90px]">{r.code}</span>
                            <span className="text-red-600 font-semibold flex-1">-{r.pointsSpent} điểm</span>
                            <span className="text-slate-400">{new Date(r.redeemedAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* THÔNG TIN CÁ NHÂN */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                      <h2 className="text-xl text-slate-800 m-0 font-bold">Thông tin liên hệ</h2>
                      {!isEditingInfo && (
                        <button className="flex items-center gap-1.5 py-1.5 px-3 bg-white border border-slate-200 rounded-md text-[13px] font-medium text-slate-600 cursor-pointer transition-colors hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800" onClick={() => setIsEditingInfo(true)}>
                          <Edit size={16} /> Chỉnh sửa
                        </button>
                      )}
                    </div>

                    {isEditingInfo ? (
                      <div>
                        <div className="flex items-center gap-5 mb-7 pb-5 border-b border-slate-100">
                          <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=0D9488&color=fff&size=128`}
                            alt="Avatar"
                            className="w-20 h-20 rounded-full object-cover border-[3px] border-blue-50 shadow-sm"
                          />
                          <div className="flex flex-col gap-2">
                            <button className="flex items-center gap-1.5 py-1.5 px-3 bg-white border border-slate-200 rounded-md text-[13px] font-medium text-slate-600 cursor-pointer transition-colors hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800" onClick={() => fileInputRef.current.click()} disabled={isUploading}>
                              {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Camera size={16} />}
                              {user.avatar ? " Đổi ảnh" : " Thêm ảnh"}
                            </button>
                            {user.avatar && (
                              <button className="flex items-center gap-1.5 py-1.5 px-3 bg-red-50 border border-red-200 text-red-500 rounded-md text-[13px] font-medium cursor-pointer transition-colors hover:bg-red-100 hover:border-red-400" onClick={removeAvatar}>
                                <Trash2 size={16} /> Xóa ảnh
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5 mb-5">
                          <div className="w-full">
                            <label className="block mb-2 text-sm font-semibold text-slate-600">Họ và tên</label>
                            <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="w-full py-2.5 px-4 rounded-lg border border-slate-300 text-[15px] text-slate-800 bg-white transition-all focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10 outline-none" />
                          </div>
                          <div className="w-full">
                            <label className="block mb-2 text-sm font-semibold text-slate-600">Số điện thoại</label>
                            <input type="text" value={editFormData.phone} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} placeholder="Thêm số điện thoại..." className="w-full py-2.5 px-4 rounded-lg border border-slate-300 text-[15px] text-slate-800 bg-white transition-all focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10 outline-none" />
                          </div>
                        </div>

                        <div className="mb-5 w-full">
                          <label className="block mb-2 text-sm font-semibold text-slate-600">Email (Không thể thay đổi)</label>
                          <input type="email" value={user.email} disabled className="w-full py-2.5 px-4 rounded-lg border border-slate-300 text-[15px] text-slate-800 outline-none bg-slate-50 text-slate-400 cursor-not-allowed" />
                        </div>

                        <div className="flex gap-3 justify-end mt-5">
                          <button className="py-2 px-4 bg-white text-slate-700 border border-slate-300 rounded-lg text-sm cursor-pointer transition-all hover:bg-slate-50" onClick={() => {
                            setIsEditingInfo(false);
                            setEditFormData({ name: user.name, phone: user.phone || "" });
                          }}>Hủy</button>
                          <button className="py-2 px-5 bg-blue-600 text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-all hover:bg-blue-700" onClick={handleUpdateInfo}>Lưu thay đổi</button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-1.5">
                          <p className="text-[13px] text-slate-500 m-0 uppercase tracking-wide font-semibold">Họ và tên</p>
                          <p className="text-base text-slate-800 m-0 font-medium">{user.name}</p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <p className="text-[13px] text-slate-500 m-0 uppercase tracking-wide font-semibold">Email</p>
                          <p className="text-base text-slate-800 m-0 font-medium">{user.email}</p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <p className="text-[13px] text-slate-500 m-0 uppercase tracking-wide font-semibold">Số điện thoại</p>
                          <p className="text-base text-slate-800 m-0 font-medium">{user.phone || <em className="text-slate-400 font-normal">Chưa cập nhật</em>}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}


            {/* TAB ORDERS */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-xl p-6 md:p-7 shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 md:gap-0">
                  <div>
                    <h2 className="m-0 text-[22px] text-slate-800 font-bold">Đơn hàng của tôi</h2>
                    <p className="m-0 mt-1 text-sm text-slate-500">Quản lý và theo dõi tất cả đơn hàng của bạn</p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg py-2 px-4 w-full md:w-[300px] transition-all focus-within:border-blue-500 focus-within:bg-white focus-within:ring-[3px] focus-within:ring-blue-500/10">
                    <Search size={18} className="text-slate-500" />
                    <input type="text" placeholder="Tìm đơn hàng..." className="border-none bg-transparent outline-none w-full text-sm text-slate-800" />
                  </div>
                </div>

                <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300">
                  {filterOrderTabs.map(tab => (
                    <button
                      key={tab.id}
                      className={`flex items-center gap-2 py-2 px-4 border rounded-full text-sm font-medium cursor-pointer whitespace-nowrap transition-all ${activeOrderFilter === tab.id ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"}`}
                      onClick={() => setActiveOrderFilter(tab.id)}
                    >
                      {tab.label} <span className={`py-0.5 px-1.5 rounded-full text-xs font-bold ${activeOrderFilter === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>{getTabCount(tab.id)}</span>
                    </button>
                  ))}
                </div>

                {loadingOrders ? (
                  <div className="text-center py-10 text-slate-500 animate-pulse">Đang tải danh sách đơn hàng...</div>
                ) : filteredOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-10 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Package size={48} className="text-slate-300 mb-4" />
                    <p className="text-[15px] text-slate-600 mb-5">Bạn chưa có đơn hàng nào ở trạng thái này.</p>
                    <button className="py-2.5 px-5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium cursor-pointer transition-colors hover:bg-slate-50 hover:border-slate-400" onClick={() => navigate("/products")}>Tiếp tục mua sắm</button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    {filteredOrders.map(order => (
                      <div key={order._id} className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm hover:border-slate-300 transition-colors">

                        {/* Header Đơn hàng */}
                        <div className="flex justify-between items-center py-4 px-5 bg-slate-50 border-b border-slate-100">
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="text-blue-600 font-bold uppercase">#{order._id.slice(-6)}</span>
                            <span className="text-slate-300">|</span>
                            <span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className={`py-1 px-3 rounded-full text-xs font-semibold ${order.status === "waiting_approval" ? "bg-amber-100 text-amber-700" :
                            order.status === "pending" ? "bg-blue-100 text-blue-700" :
                              order.status === "paid" ? "bg-indigo-100 text-indigo-700" :
                                order.status === "done" ? "bg-emerald-100 text-emerald-700" :
                                  "bg-red-100 text-red-700"
                            }`}>
                            {getStatusText(order.status)}
                          </div>
                        </div>

                        {/* Body (Danh sách sản phẩm) */}
                        <div className="p-5">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-start gap-4 pb-4 mb-4 border-b border-dashed border-slate-100 last:border-0 last:pb-0 last:mb-0">
                              <div className="w-20 h-20 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0 p-1">
                                <img src={item.image || "/no-image.png"} alt={item.name} className="max-w-full max-h-full object-contain" />
                              </div>
                              <div className="flex-1">
                                <h4 className="m-0 mb-1.5 text-[15px] text-slate-800 font-semibold">{item.name}</h4>
                                <p className="m-0 mb-1 text-[13px] text-slate-500">{item.color} {item.storage ? `| ${item.storage}` : ''}</p>
                                <p className="m-0 text-[13px] text-slate-500 font-medium">Số lượng: x{item.quantity}</p>
                              </div>
                              <div className="text-[15px] font-bold text-slate-800 shrink-0">
                                {(item.price * item.quantity).toLocaleString()}đ
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Footer Đơn hàng */}
                        <div className="flex flex-col md:flex-row justify-between items-end md:items-center py-4 px-5 bg-slate-50 border-t border-slate-100 gap-4 md:gap-0">

                          <div className="w-full md:w-auto flex flex-col items-start">
                            <div className="text-sm text-slate-600">
                              Thành tiền: <strong className="text-[18px] text-red-500 ml-1.5 font-extrabold">{order.total.toLocaleString()}đ</strong>
                            </div>
                            {order.status === 'pending' && ['VNPAY', 'MOMO'].includes(order.paymentMethod) && (
                              <p className="flex items-center gap-1 text-red-500 text-[13px] m-0 mt-1 font-medium">
                                <AlertCircle size={14} /> Vui lòng thanh toán trong 15 phút.
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2.5 w-full md:w-auto justify-end">
                            <button className="flex items-center gap-1.5 py-2 px-3.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[13px] font-medium cursor-pointer transition-colors hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800" onClick={() => navigate(`/order/${order._id}`)}>
                              <Eye size={15} /> Xem chi tiết
                            </button>

                            {/* NÚT THANH TOÁN TIẾP VÀ HỦY ĐƠN CHO ĐƠN PENDING */}
                            {order.status === 'pending' && ['VNPAY', 'MOMO'].includes(order.paymentMethod) && (
                              <>
                                <button
                                  className="flex items-center gap-1.5 py-2 px-3.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-[13px] font-medium cursor-pointer transition-colors hover:bg-slate-200"
                                  onClick={() => handleCancelOrder(order._id)}
                                >
                                  Hủy đơn
                                </button>
                                <button
                                  className="flex items-center gap-1.5 py-2 px-4 bg-blue-600 text-white border-none rounded-lg text-[13px] font-semibold cursor-pointer transition-colors hover:bg-blue-700 shadow-sm"
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
                              </>
                            )}

                            {/* Nút hủy đơn cho đơn COD đang chờ duyệt */}
                            {order.status === 'waiting_approval' && (
                              <button
                                className="flex items-center gap-1.5 py-2 px-3.5 bg-red-50 border border-red-200 text-red-500 rounded-lg text-[13px] font-medium cursor-pointer transition-colors hover:bg-red-100 hover:border-red-300"
                                onClick={() => handleCancelOrder(order._id)}
                              >
                                Hủy đơn
                              </button>
                            )}

                            {(order.status === "done" || order.status === "cancelled" || order.status === "returned") && (
                              <button
                                className="flex items-center gap-1.5 py-2 px-3.5 bg-blue-600 text-white border-none rounded-lg text-[13px] font-medium cursor-pointer transition-colors hover:bg-blue-700 shadow-sm"
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
                                className="flex items-center gap-1.5 py-2 px-3.5 bg-amber-50 border border-amber-200 text-amber-600 rounded-lg text-[13px] font-medium cursor-pointer transition-colors hover:bg-amber-100 hover:border-amber-300"
                                onClick={() => {
                                  const firstItem = order.items[0];
                                  const slug = firstItem?.productId?.slug;
                                  if (slug) navigate(`/product/${slug}/reviews`);
                                  else toast.error("Không tìm thấy sản phẩm.");
                                }}
                              >
                                <Star size={15} /> Đánh giá
                              </button>
                            )}

                            {order.status === "done" && (() => {
                              const isWithin15Days = (new Date() - new Date(order.updatedAt)) / (1000 * 60 * 60 * 24) <= 15;
                              const returnReq = order.returnRequest;

                              if (returnReq && returnReq.isRequested) {
                                if (returnReq.status === "pending") {
                                  return <span className="bg-amber-100 text-amber-700 py-1.5 px-3 rounded-md text-[12px] font-semibold self-center ml-2">Đang yêu cầu trả hàng</span>;
                                }
                                if (returnReq.status === "rejected") {
                                  return <span className="bg-red-100 text-red-600 py-1.5 px-3 rounded-md text-[12px] font-semibold self-center ml-2 cursor-help" title={returnReq.rejectedReason}>Bị từ chối trả hàng</span>;
                                }
                              } else if (isWithin15Days) {
                                return (
                                  <button
                                    className="flex items-center gap-1.5 py-2 px-3.5 bg-white border border-red-500 text-red-500 rounded-lg text-[13px] font-medium cursor-pointer transition-colors hover:bg-red-50"
                                    onClick={() => {
                                      const doneOrders = orders.filter(o => o.status === 'done');
                                      const totalSpent = doneOrders.reduce((sum, ord) => sum + ord.total, 0);
                                      const currentTotalPoints = Math.floor(totalSpent / 50000);
                                      const currentSpentPoints = redemptionHistory.reduce((s, r) => s + r.pointsSpent, 0);
                                      const currentAvailablePoints = currentTotalPoints - currentSpentPoints;

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
                                    <RotateCcw size={15} /> Yêu cầu trả hàng
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
              <div className="bg-white rounded-xl p-6 md:p-7 shadow-sm border border-slate-100">
                <div className="mb-6 pb-4 border-b border-slate-100"><h2 className="text-xl text-slate-800 m-0 font-bold">Sản phẩm yêu thích</h2></div>
                {loadingFavorites ? (
                  <div className="text-center py-10 text-slate-500 animate-pulse">Đang tải danh sách yêu thích...</div>
                ) : favorites.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-5 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Heart size={48} className="text-slate-300 mb-4" />
                    <p className="text-[15px] text-slate-600 mb-5">Chưa có sản phẩm nào trong danh sách yêu thích.</p>
                    <button className="py-2.5 px-5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium cursor-pointer transition-colors hover:bg-slate-50 hover:border-slate-400" onClick={() => navigate("/")}>Khám phá sản phẩm</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
              <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 md:px-7 rounded-xl shadow-sm border border-slate-200 gap-4 md:gap-0">
                  <div>
                    <h2 className="m-0 text-[22px] font-bold text-slate-800">Kho Voucher của tôi</h2>
                    <p className="m-0 mt-1 text-sm text-slate-500">Lưu và sử dụng mã giảm giá khi mua hàng</p>
                  </div>
                  <div className="shrink-0 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1 pl-3.5 transition-all focus-within:border-indigo-500 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] focus-within:bg-white">
                      <Tag size={16} className="text-slate-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Nhập mã khuyến mãi tại đây"
                        value={voucherInput}
                        onChange={(e) => setVoucherInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyVoucherCode()}
                        className="border-none bg-transparent outline-none text-sm text-slate-800 w-full md:w-[200px] py-2 placeholder:text-slate-400"
                      />
                      <button className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white border-none py-2 px-5 rounded-lg text-sm font-semibold cursor-pointer transition-all hover:from-indigo-600 hover:to-violet-600 hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(99,102,241,0.3)] whitespace-nowrap" onClick={handleApplyVoucherCode}>Áp dụng</button>
                    </div>
                  </div>
                </div>

                {/* Voucher Grid */}
                {loadingVouchers ? (
                  <div className="text-center py-16 text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
                    <Loader2 className="animate-spin mx-auto mb-3 text-slate-400" size={32} />
                    <p className="m-0">Đang tải kho voucher...</p>
                  </div>
                ) : myVouchers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-16 px-5 text-slate-400 text-center bg-white rounded-xl shadow-sm border border-slate-200">
                    <Ticket size={64} strokeWidth={1} className="mb-4 text-slate-300" />
                    <h3 className="m-0 mb-2 text-lg text-slate-600 font-semibold">Chưa có voucher nào</h3>
                    <p className="m-0 text-sm max-w-[400px] leading-relaxed text-slate-500">Các mã giảm giá sẽ xuất hiện tại đây khi có chương trình khuyến mãi mới.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {myVouchers.map((voucher, index) => {
                      const colorScheme = getVoucherColor(index);
                      const VoucherIcon = getVoucherIcon(voucher, index);
                      const daysLeft = getDaysLeft(voucher.expiryDate);
                      const isExpiringSoon = daysLeft.includes("1 ng\u00e0y") || daysLeft.includes("h\u00f4m nay");

                      return (
                        <div
                          key={voucher._id}
                          className="flex bg-white rounded-xl border border-slate-200 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] hover:border-slate-300 border-l-4"
                          style={{ borderLeftColor: colorScheme.border }}
                        >
                          {/* Left Icon Section */}
                          <div className="flex flex-col items-center justify-center py-5 px-4 min-w-[100px] gap-2 border-r border-slate-100 border-dashed" style={{ backgroundColor: colorScheme.bg }}>
                            <VoucherIcon size={32} color={colorScheme.icon} />
                            <span className="text-[10px] font-extrabold tracking-wide uppercase" style={{ color: colorScheme.icon }}>
                              {getVoucherLabel(index)}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 p-4 pl-5 flex flex-col justify-between">
                            <div>
                              <h3 className="m-0 text-[15px] font-bold text-slate-800 leading-tight">
                                {voucher.discountType === "percentage"
                                  ? `Giảm ${voucher.value}%`
                                  : `Giảm ${voucher.value.toLocaleString()}đ`
                                }
                                {voucher.maxDiscountAmount && voucher.discountType === "percentage" &&
                                  ` (tối đa ${voucher.maxDiscountAmount.toLocaleString()}đ)`
                                }
                              </h3>
                              <p className="m-0 mt-1.5 text-[13px] text-slate-500 leading-relaxed">{voucher.description || `Áp dụng cho đơn hàng từ ${voucher.minOrderValue.toLocaleString()}đ`}</p>

                              <div className="flex flex-wrap gap-1.5 mt-2.5">
                                {voucher.minOrderValue > 0 && (
                                  <span className="bg-slate-100 text-slate-600 py-[3px] px-2 rounded text-[11px] font-medium">Đơn tối thiểu {voucher.minOrderValue.toLocaleString()}đ</span>
                                )}
                              </div>
                            </div>

                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-dashed border-slate-200">
                              <div className={`flex items-center gap-1.5 text-[12px] ${isExpiringSoon ? 'text-red-500 font-semibold' : 'text-slate-500'}`}>
                                <Clock size={13} />
                                <span>{daysLeft}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-600 py-1.5 px-2.5 rounded-md text-[11px] font-semibold cursor-pointer transition-all font-mono hover:bg-indigo-50 hover:border-indigo-500 hover:text-indigo-500"
                                  onClick={() => handleCopyCode(voucher.code)}
                                  title="Sao chép mã"
                                >
                                  {copiedCode === voucher.code ? <CheckCircle size={13} className="text-emerald-500" /> : <Copy size={13} />}
                                  {voucher.code}
                                </button>
                                <button
                                  className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white border-none py-1.5 px-3.5 rounded-md text-xs font-semibold cursor-pointer transition-all hover:from-indigo-600 hover:to-violet-600 hover:-translate-y-[1px] hover:shadow-[0_3px_10px_rgba(99,102,241,0.25)]"
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
              <div className="flex flex-col">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white rounded-xl py-5 px-6 mb-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-slate-200 gap-4 sm:gap-0">
                  <div>
                    <h2 className="text-[20px] font-bold text-slate-900 m-0 mb-1">Sổ địa chỉ</h2>
                    <p className="text-[13px] text-slate-500 m-0">Quản lý địa chỉ giao hàng của bạn</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-50 text-blue-600 border border-blue-200 rounded-full py-1 px-3.5 text-[13px] font-semibold">
                      {user.addresses?.length || 0} / 5 địa chỉ
                    </span>
                    {(user.addresses?.length || 0) < 5 && (
                      <button className="flex items-center gap-1.5 bg-blue-600 text-white border-none rounded-lg py-2 px-4 text-sm font-medium cursor-pointer transition-colors hover:bg-blue-700 shadow-sm" onClick={() => { setEditingAddress(null); setShowAddressModal(true); }}>
                        <Plus size={16} /> Thêm địa chỉ
                      </button>
                    )}
                  </div>
                </div>

                {/* Empty state */}
                {(!user.addresses || user.addresses.length === 0) && (
                  <div className="flex flex-col items-center text-center py-16 px-5 text-slate-400 bg-white border border-dashed border-slate-300 rounded-2xl">
                    <MapPin size={52} strokeWidth={1} className="text-slate-300 mb-4" />
                    <h3 className="text-lg text-slate-800 font-bold m-0 mb-2">Chưa có địa chỉ nào</h3>
                    <p className="text-sm text-slate-500 m-0 mb-5 max-w-[280px]">Thêm địa chỉ giao hàng để việc mua sắm trở nên nhanh chóng hơn.</p>
                    <button className="flex items-center gap-1.5 bg-blue-600 text-white border-none rounded-lg py-2.5 px-5 text-sm font-medium cursor-pointer transition-colors hover:bg-blue-700 shadow-sm" onClick={() => { setEditingAddress(null); setShowAddressModal(true); }}>
                      <Plus size={16} /> Thêm địa chỉ đầu tiên
                    </button>
                  </div>
                )}

                {/* Address cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.addresses?.map((addr, index) => (
                    <div key={addr._id} className={`bg-white border rounded-2xl p-5 relative flex flex-col gap-3 transition-all duration-200 hover:shadow-[0_4px_16px_rgba(37,99,235,0.1)] hover:border-blue-300 ${index === 0 ? 'border-blue-500 bg-gradient-to-br from-blue-50 via-white to-white' : 'border-slate-200'}`}>
                      {index === 0 && (
                        <span className="absolute top-3 right-3 bg-blue-600 text-white text-[11px] font-bold py-[3px] px-2.5 rounded-full">Mặc định</span>
                      )}
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${index === 0 ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-500'}`}>
                        <Home size={20} />
                      </div>
                      <div className="flex-1 mt-1">
                        <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                          <span className="font-bold text-[15px] text-slate-900">{addr.fullName}</span>
                          {addr.phone && (
                            <span className="flex items-center gap-1 text-[13px] text-slate-500"><Phone size={12} /> {addr.phone}</span>
                          )}
                        </div>
                        <p className="text-[13px] text-slate-600 leading-relaxed m-0">
                          {[addr.detail, addr.ward, addr.district, addr.province].filter(Boolean).join(', ')}
                        </p>
                      </div>
                      <div className="flex gap-2 border-t border-slate-100 pt-3 mt-auto">
                        <button className="flex items-center gap-1.5 text-[13px] font-medium rounded-lg py-1.5 px-3.5 cursor-pointer border border-transparent transition-all bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200" onClick={() => { setEditingAddress(addr); setShowAddressModal(true); }}>
                          <Edit size={14} /> Sửa
                        </button>
                        <button className="flex items-center gap-1.5 text-[13px] font-medium rounded-lg py-1.5 px-3.5 cursor-pointer border border-transparent transition-all bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200" onClick={() => deleteAddress(addr._id)}>
                          <Trash2 size={14} /> Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {(user.addresses?.length || 0) >= 5 && (
                  <p className="mt-5 text-center text-[13px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg py-2.5 px-4 font-medium">⚠️ Bạn đã đạt giới hạn 5 địa chỉ. Xóa một địa chỉ để thêm mới.</p>
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
                <div className="flex flex-col">

                  {/* Header stats */}
                  <div className="bg-white rounded-xl py-5 px-6 mb-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-slate-200">
                    <h2 className="text-[20px] font-bold text-slate-900 m-0 mb-1">Lịch sử thanh toán</h2>
                    <p className="text-[13px] text-slate-500 m-0">Tổng quan các giao dịch thành công của bạn</p>
                  </div>

                  {/* Stat cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-600"><ReceiptText size={22} /></div>
                      <div>
                        <p className="text-[13px] text-slate-500 m-0 mb-1 font-medium">Giao dịch thành công</p>
                        <h3 className="text-[22px] font-bold text-slate-900 m-0">{paidOrders.length}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600"><DollarSign size={22} /></div>
                      <div>
                        <p className="text-[13px] text-slate-500 m-0 mb-1 font-medium">Tổng đã thanh toán</p>
                        <h3 className="text-[22px] font-bold text-slate-900 m-0">{totalSpent.toLocaleString()}đ</h3>
                      </div>
                    </div>
                  </div>

                  {/* Transaction list */}
                  {paidOrders.length === 0 ? (
                    <div className="flex flex-col items-center text-center py-16 px-5 text-slate-400 bg-white border border-dashed border-slate-300 rounded-2xl">
                      <ReceiptText size={52} strokeWidth={1} className="text-slate-300 mb-4" />
                      <h3 className="text-lg text-slate-800 font-bold m-0 mb-2">Chưa có giao dịch nào</h3>
                      <p className="text-sm text-slate-500 m-0 max-w-[300px]">Các đơn hàng đã thanh toán thành công sẽ hiển thị tại đây.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {paidOrders.map(order => {
                        const method = methodMap[order.paymentMethod] || { label: order.paymentMethod, color: '#64748b', bg: '#f1f5f9', icon: '💰' };
                        const firstItem = order.items?.[0];
                        return (
                          <div key={order._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-200 rounded-xl py-4 px-5 transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.07)] gap-4 sm:gap-0">
                            <div className="flex items-center gap-3.5 w-full sm:w-auto">
                              <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                                <img src={firstItem?.image || '/no-image.png'} alt={firstItem?.name} className="max-w-full max-h-full object-contain" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wide m-0 mb-1">Đơn #{order._id.slice(-6)}</p>
                                <p className="text-[14px] font-semibold text-slate-900 m-0 mb-1 truncate max-w-full sm:max-w-[250px]">{firstItem?.name}{order.items?.length > 1 ? ` +${order.items.length - 1} sản phẩm` : ''}</p>
                                <p className="text-[12px] text-slate-400 m-0 font-medium">{new Date(order.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-start sm:items-end gap-1.5 w-full sm:w-auto border-t sm:border-0 border-slate-100 pt-3 sm:pt-0">
                              <span className="text-[12px] font-semibold py-1 px-3 rounded-full" style={{ color: method.color, background: method.bg }}>
                                {method.icon} {method.label}
                              </span>
                              <p className="text-[18px] font-extrabold text-slate-900 m-0 mt-0.5">{order.total.toLocaleString()}đ</p>
                              <span className="text-[12px] text-emerald-600 font-semibold">✓ Đã thanh toán</span>
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
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[9999] backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-[500px] shadow-[0_10px_25px_rgba(0,0,0,0.1)] mx-auto overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="m-0 text-lg font-bold text-slate-900">Yêu cầu trả hàng</h3>
              <button className="bg-transparent border-none text-slate-400 hover:text-slate-800 cursor-pointer p-1 transition-colors" onClick={() => { setShowReturnModal(false); setReturnOrderId(null); setReturnReason(""); setReturnImages([]); }}><XCircle size={22} /></button>
            </div>

            <div className="overflow-y-auto pr-2 pb-2">
              <p className="text-[13px] text-slate-600 mb-4 leading-relaxed bg-blue-50 border border-blue-100 p-3 rounded-lg">
                Bạn có thể gửi yêu cầu trả hàng nếu sản phẩm gặp lỗi từ nhà sản xuất hoặc không đúng mô tả trong vòng 15 ngày.
                Vui lòng ghi rõ lý do và tải lên hình ảnh minh chứng.
              </p>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-semibold text-slate-700">Lý do trả hàng <span className="text-red-500">*</span></label>
                <textarea
                  className="w-full p-3 rounded-lg border border-slate-300 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10 transition-all resize-y min-h-[100px]"
                  placeholder="Mô tả chi tiết lý do bạn muốn trả hàng..."
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                ></textarea>
              </div>

              <div className="mb-2">
                <label className="block mb-2 text-sm font-semibold text-slate-700">Hình ảnh minh chứng <span className="text-red-500">*</span> <span className="text-xs text-slate-400 font-normal">(Tối đa 5 ảnh)</span></label>
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleReturnImageChange}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-200 rounded-lg p-1.5"
                  />
                </div>

                {returnImages.length > 0 && (
                  <div className="flex gap-2.5 flex-wrap mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    {Array.from(returnImages).map((file, idx) => (
                      <div key={idx} className="relative group">
                        <img src={URL.createObjectURL(file)} alt="preview" className="w-16 h-16 object-cover rounded-md border border-slate-200 shadow-sm" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-slate-100 shrink-0">
              <button className="py-2.5 px-5 rounded-lg bg-slate-100 text-slate-700 font-semibold border-none cursor-pointer transition-colors hover:bg-slate-200" onClick={() => { setShowReturnModal(false); setReturnOrderId(null); setReturnReason(""); setReturnImages([]); }}>Hủy bỏ</button>
              <button className="flex items-center gap-2 py-2.5 px-6 rounded-lg bg-red-500 text-white font-semibold border-none cursor-pointer transition-colors hover:bg-red-600 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed" onClick={submitReturnRequest} disabled={isSubmittingReturn}>
                {isSubmittingReturn ? <Loader2 size={16} className="animate-spin" /> : "Gửi yêu cầu"}
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