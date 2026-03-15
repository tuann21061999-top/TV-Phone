import { useState, useEffect } from "react";
import ManageProduct from "../../components/ManageProduct/ManagePhone";
import ManageElectronic from "../../components/ManageProduct/ManageElectronic";
import ManageAccessory from "../../components/ManageProduct/ManageAccessory";
import ManageOrder from "../../components/ManageOrder/ManageOrder";
import ManageReview from "../../components/ManageReview/ManageReview";
import ManageUser from "../../components/ManageUser/ManageUser";
import ManageBanner from "../../components/ManageBanner/ManageBanner";
import ManageFeedback from "../../components/ManageFeedback/ManageFeedback";
import AdminDashboard from "../../components/AdminDashboard/AdminDashboard";
import ManageChat from "../../components/ManageChat/ManageChat";
import ManageVoucher from "../../components/ManageVoucher/ManageVoucher";
import ManagePromotions from "../../components/ManagePromotions/ManagePromotions";
import ManageNews from "../../components/ManageNews/ManageNews";
import ManageTags from "../../components/ManageTags/ManageTags";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";


import "./AdminPage.css";

import {
  ShoppingBag, FileText, Users, BarChart3,
  Package, Smartphone, MousePointer2, Settings,
  LogOut, LayoutDashboard, MessageSquare, Ticket, Flame,
  Newspaper, Tag
} from "lucide-react";

function AdminPage() {
  // Đặt Dashboard làm trang mặc định
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  // Badge States
  const [orderBadge, setOrderBadge] = useState(0);
  const [chatBadge, setChatBadge] = useState(0);
  const [reviewBadge, setReviewBadge] = useState(0);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        // Lấy orders
        const ordersRes = await axios.get("http://localhost:5000/api/orders/admin/all", { headers });
        const newOrders = ordersRes.data.filter(o => o.status === "waiting_approval" || o.status === "paid" || o.status === "pending").length;
        if (activeTab !== "orders") {
          setOrderBadge(newOrders);
        } else {
          setOrderBadge(0);
        }

        // Lấy chats
        const chatsRes = await axios.get("http://localhost:5000/api/chat/admin/conversations", { headers });
        const unreadChats = chatsRes.data.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        if (activeTab !== "chat") {
          setChatBadge(unreadChats);
        } else {
          setChatBadge(0);
        }

        // Lấy reviews
        const reviewsRes = await axios.get("http://localhost:5000/api/reviews/admin/all", { headers });
        const unrepliedReviews = reviewsRes.data.filter(r => !r.adminReply).length;
        if (activeTab !== "reviews") {
          setReviewBadge(unrepliedReviews);
        } else {
          setReviewBadge(0);
        }

      } catch (error) {
        console.error("Lỗi lấy thông báo badge:", error);
      }
    };

    fetchBadges();
    const interval = setInterval(fetchBadges, 30000); // Cập nhật mỗi 30s
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "orders") setOrderBadge(0);
    if (tab === "chat") setChatBadge(0);
    if (tab === "reviews") setReviewBadge(0);
  };
  const getTabTitle = () => {
    switch (activeTab) {
      case "dashboard": return "Bảng điều khiển";
      case "products": return "Quản lý Điện thoại";
      case "electronics": return "Quản lý Đồ điện tử";
      case "accessories": return "Quản lý Phụ kiện";
      case "orders": return "Quản lý Đơn hàng";
      case "users": return "Quản lý Người dùng";
      case "reviews": return "Quản lý Đánh giá";
      case "banners": return "Quản lý Banner";
      case "feedbacks": return "Quản lý Phản hồi";
      case "chat": return "Quản lý Chat";
      case "vouchers": return "Quản lý Voucher";
      case "promotions": return "Khuyến mãi (Variant Cấu hình)";
      case "news": return "Quản lý Tin tức";
      case "tags": return "Quản lý Tags";
      default: return "Bảng điều khiển";
    }
  };

  const handleLogout = () => {
    // 1. Xóa token hoặc dữ liệu user khỏi localStorage/sessionStorage (nếu có)
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo"); // Thay đổi key này tùy theo cách bạn lưu trữ

    // 2. Hiển thị toast thông báo thành công
    toast.success("Đăng xuất thành công!");

    navigate("/login");
  };

  return (
    <div className="admin-wrapper">
      <div className="admin-layout">

        {/* SIDEBAR */}
        <aside className="admin-sidebar">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <Settings color="#ffffff" size={24} />
            </div>
            <h2>ADMIN PANEL</h2>
          </div>

          <div className="sidebar-menu">
            <p className="menu-label">TỔNG QUAN</p>
            <button className={activeTab === "dashboard" ? "active" : ""} onClick={() => handleTabClick("dashboard")}>
              <LayoutDashboard size={18} /> Bảng điều khiển
            </button>
            <button className={activeTab === "banners" ? "active" : ""} onClick={() => handleTabClick("banners")}>
              <Package size={18} /> Banner
            </button>
            <button className={activeTab === "news" ? "active" : ""} onClick={() => handleTabClick("news")}>
              <Newspaper size={18} /> Tin tức
            </button>

            <hr className="sidebar-divider" />

            <p className="menu-label">SẢN PHẨM</p>
            <button className={activeTab === "products" ? "active" : ""} onClick={() => handleTabClick("products")}>
              <Smartphone size={18} /> Điện thoại
            </button>
            <button className={activeTab === "electronics" ? "active" : ""} onClick={() => handleTabClick("electronics")}>
              <ShoppingBag size={18} /> Đồ điện tử
            </button>
            <button className={activeTab === "accessories" ? "active" : ""} onClick={() => handleTabClick("accessories")}>
              <MousePointer2 size={18} /> Phụ kiện
            </button>
            <button className={activeTab === "tags" ? "active" : ""} onClick={() => handleTabClick("tags")}>
              <Tag size={18} /> Quản lý Tags
            </button>

            <hr className="sidebar-divider" />

            <p className="menu-label">VẬN HÀNH</p>
            <button className={activeTab === "orders" ? "active sidebar-badge-btn" : "sidebar-badge-btn"} onClick={() => handleTabClick("orders")}>
              <div className="sidebar-btn-content"><FileText size={18} /> Đơn hàng</div>
              {orderBadge > 0 && <span className="sidebar-badge">{orderBadge}</span>}
            </button>
            <button className={activeTab === "users" ? "active" : ""} onClick={() => handleTabClick("users")}>
              <Users size={18} /> Người dùng
            </button>
            <button className={activeTab === "reviews" ? "active sidebar-badge-btn" : "sidebar-badge-btn"} onClick={() => handleTabClick("reviews")}>
              <div className="sidebar-btn-content"><BarChart3 size={18} /> Đánh giá</div>
              {reviewBadge > 0 && <span className="sidebar-badge">{reviewBadge}</span>}
            </button>
            <button className={activeTab === "feedbacks" ? "active" : ""} onClick={() => handleTabClick("feedbacks")}>
              <Package size={18} /> Phản hồi
            </button>
            <button className={activeTab === "chat" ? "active sidebar-badge-btn" : "sidebar-badge-btn"} onClick={() => handleTabClick("chat")}>
              <div className="sidebar-btn-content"><MessageSquare size={18} /> Chat</div>
              {chatBadge > 0 && <span className="sidebar-badge">{chatBadge}</span>}
            </button>
            <button className={activeTab === "vouchers" ? "active" : ""} onClick={() => handleTabClick("vouchers")}>
              <Ticket size={18} /> Voucher
            </button>
            <button className={activeTab === "promotions" ? "active" : ""} onClick={() => handleTabClick("promotions")}>
              <Flame size={18} /> Giảm giá
            </button>
          </div>

          {/* NÚT ĐĂNG XUẤT NẰM Ở ĐÁY SIDEBAR */}
          <div className="sidebar-footer">
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={18} /> Đăng xuất
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="admin-content">
          <div className="content-header">
            <h1>{getTabTitle()}</h1>
          </div>

          <div className="content-body">
            {/* HIỂN THỊ CÁC TAB */}
            {activeTab === "dashboard" && <AdminDashboard />}
            {activeTab === "products" && <ManageProduct />}
            {activeTab === "electronics" && <ManageElectronic />}
            {activeTab === "accessories" && <ManageAccessory />}
            {activeTab === "orders" && <ManageOrder />}
            {activeTab === "reviews" && <ManageReview />}
            {activeTab === "users" && <ManageUser />}
            {activeTab === "banners" && <ManageBanner />}
            {activeTab === "feedbacks" && <ManageFeedback />}
            {activeTab === "chat" && <ManageChat />}
            {activeTab === "vouchers" && <ManageVoucher />}
            {activeTab === "promotions" && <ManagePromotions />}
            {activeTab === "news" && <ManageNews />}
            {activeTab === "tags" && <ManageTags />}

            {/* EMPTY STATES CHO CÁC TAB CHƯA LÀM */}
            {(activeTab === "users") && (
              <div className="empty-state">
                <Package size={48} className="empty-icon" />
                <h3>Tính năng đang phát triển</h3>
                <p>Module <strong>{getTabTitle()}</strong> hiện đang được đội ngũ kỹ thuật xây dựng và sẽ sớm ra mắt.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminPage;