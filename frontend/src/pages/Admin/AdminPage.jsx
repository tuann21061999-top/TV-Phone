import { useState } from "react";
import ManageProduct from "../../components/ManageProduct/ManagePhone";
import ManageElectronic from "../../components/ManageProduct/ManageElectronic";
import ManageAccessory from "../../components/ManageProduct/ManageAccessory";
import ManageOrder from "../../components/ManageOrder/ManageOrder"; 
import ManageReview from "../../components/ManageReview/ManageReview";
import ManageUser from "../../components/ManageUser/ManageUser";
import ManageBanner from "../../components/ManageBanner/ManageBanner";
import AdminDashboard from "../../components/AdminDashboard/AdminDashboard";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";


import "./AdminPage.css";

import { 
  ShoppingBag, FileText, Users, BarChart3, 
  Package, Smartphone, MousePointer2, Settings,
  LogOut, LayoutDashboard 
} from "lucide-react";

function AdminPage() {
  // Đặt Dashboard làm trang mặc định
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();
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
            <button className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}>
              <LayoutDashboard size={18} /> Bảng điều khiển
            </button>
            <button className={activeTab === "banners" ? "active" : ""} onClick={() => setActiveTab("banners")}>
              <Package size={18} /> Banner
            </button>

            <hr className="sidebar-divider" />

            <p className="menu-label">SẢN PHẨM</p>
            <button className={activeTab === "products" ? "active" : ""} onClick={() => setActiveTab("products")}>
              <Smartphone size={18} /> Điện thoại
            </button>
            <button className={activeTab === "electronics" ? "active" : ""} onClick={() => setActiveTab("electronics")}>
              <ShoppingBag size={18} /> Đồ điện tử
            </button>
            <button className={activeTab === "accessories" ? "active" : ""} onClick={() => setActiveTab("accessories")}>
              <MousePointer2 size={18} /> Phụ kiện
            </button>

            <hr className="sidebar-divider" />
            
            <p className="menu-label">VẬN HÀNH</p>
            <button className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>
              <FileText size={18} /> Đơn hàng
            </button>
            <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>
              <Users size={18} /> Người dùng
            </button>
            <button className={activeTab === "reviews" ? "active" : ""} onClick={() => setActiveTab("reviews")}>
              <BarChart3 size={18} /> Đánh giá
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