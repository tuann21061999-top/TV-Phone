import { useState } from "react";
import ManageProduct from "../../components/ManageProduct/ManagePhone";
import ManageElectronic from "../../components/ManageProduct/ManageElectronic";
import ManageAccessory from "../../components/ManageProduct/ManageAccessory";
import ManageOrder from "../../components/ManageOrder/ManageOrder"; 
import ManageReview from "../../components/ManageReview/ManageReview";

import Header from "../../components/Header/Header";
import "./AdminPage.css";

import { 
  ShoppingBag, FileText, Users, BarChart3, 
  Package, Smartphone, MousePointer2, Settings 
} from "lucide-react";

function AdminPage() {
  const [activeTab, setActiveTab] = useState("products");

  // Helper để hiển thị tiêu đề động dựa trên Tab đang chọn
  const getTabTitle = () => {
    switch (activeTab) {
      case "products": return "Quản lý Điện thoại";
      case "electronics": return "Quản lý Đồ điện tử";
      case "accessories": return "Quản lý Phụ kiện";
      case "orders": return "Quản lý Đơn hàng";
      case "users": return "Quản lý Người dùng";
      case "stats": return "Báo cáo Thống kê";
      default: return "Bảng điều khiển";
    }
  };

  return (
    <div className="admin-wrapper">
      <Header />

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
            
            {/* Nút click để mở tab Orders */}
            <button className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>
              <FileText size={18} /> Đơn hàng
            </button>

            <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>
              <Users size={18} /> Người dùng
            </button>
            <button className={activeTab === "reviews" ? "active" : ""} onClick={() => setActiveTab("reviews")}>
              <BarChart3 size={18} /> Đánh giá
            </button>
            <button className={activeTab === "stats" ? "active" : ""} onClick={() => setActiveTab("stats")}>
              <BarChart3 size={18} /> Thống kê
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="admin-content">
          <div className="content-header">
            <h1>{getTabTitle()}</h1>
            <div className="header-actions">
              {/* Có thể thêm các nút chung ở đây */}
            </div>
          </div>

          <div className="content-body">
            {/* HIỂN THỊ CÁC TAB */}
            {activeTab === "products" && <ManageProduct />}
            {activeTab === "electronics" && <ManageElectronic />}
            {activeTab === "accessories" && <ManageAccessory />}
            
            {/* 2. NHÚNG COMPONENT MANAGE ORDER VÀO TAB "orders" */}
            {activeTab === "orders" && <ManageOrder />}
            {activeTab === "reviews" && <ManageReview />}

            {/* EMPTY STATES CHO CÁC TAB CHƯA LÀM */}
            {(activeTab === "users" || activeTab === "stats") && (
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