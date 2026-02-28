import { useState } from "react";
import ManageProduct from "../../components/ManageProduct/ManageProduct";
import Header from "../../components/Header/Header";
import "./AdminPage.css";
import { ShoppingBag, FileText, Users, BarChart3, Package } from "lucide-react";

function AdminPage() {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div className="admin-wrapper">
      {/* HEADER FIXED TOP */}
      <Header />

      <div className="admin-layout">
        {/* SIDEBAR */}
        <aside className="admin-sidebar">
          <div className="sidebar-header">
            <Package color="#60a5fa" size={32} />
            <h2>ADMIN</h2>
          </div>

          <nav className="sidebar-nav">
            <button
              className={activeTab === "products" ? "active" : ""}
              onClick={() => setActiveTab("products")}
            >
              <ShoppingBag size={20} /> Sản phẩm
            </button>

            <button
              className={activeTab === "orders" ? "active" : ""}
              onClick={() => setActiveTab("orders")}
            >
              <FileText size={20} /> Đơn hàng
            </button>

            <button
              className={activeTab === "users" ? "active" : ""}
              onClick={() => setActiveTab("users")}
            >
              <Users size={20} /> Người dùng
            </button>

            <button
              className={activeTab === "stats" ? "active" : ""}
              onClick={() => setActiveTab("stats")}
            >
              <BarChart3 size={20} /> Thống kê
            </button>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="admin-content">
          {activeTab === "products" && <ManageProduct />}

          {activeTab === "orders" && (
            <div className="empty-state">
              <h3>Quản lý Đơn hàng</h3>
              <p>Tính năng đang được phát triển...</p>
            </div>
          )}

          {activeTab === "users" && (
            <div className="empty-state">
              <h3>Quản lý Người dùng</h3>
              <p>Tính năng đang được phát triển...</p>
            </div>
          )}

          {activeTab === "stats" && (
            <div className="empty-state">
              <h3>Báo cáo Thống kê</h3>
              <p>Tính năng đang được phát triển...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminPage;