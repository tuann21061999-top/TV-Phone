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
        const ordersRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/admin/all`, { headers });
        const newOrders = ordersRes.data.filter(o => o.status === "waiting_approval" || o.status === "paid" || o.status === "pending").length;
        if (activeTab !== "orders") {
          setOrderBadge(newOrders);
        } else {
          setOrderBadge(0);
        }

        // Lấy chats
        const chatsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/chat/admin/conversations`, { headers });
        const unreadChats = chatsRes.data.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        if (activeTab !== "chat") {
          setChatBadge(unreadChats);
        } else {
          setChatBadge(0);
        }

        // Lấy reviews
        const reviewsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/reviews/admin/all`, { headers });
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
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col overflow-hidden text-left">
      <div className="flex h-screen w-full overflow-hidden">

        {/* SIDEBAR */}
        <aside className="w-[280px] h-full bg-[#0b1120] flex flex-col flex-shrink-0 border-r border-white/5 shadow-[4px_0_24px_rgba(0,0,0,0.1)]">

          {/* BRAND */}
          <div className="flex items-center gap-4 px-6 py-8 text-white">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 w-11 h-11 rounded-xl flex items-center justify-center shadow-[0_4px_16px_rgba(59,130,246,0.4)]">
              <Settings color="#ffffff" size={24} />
            </div>
            <h2 className="text-lg font-extrabold tracking-wide m-0 text-slate-50">ADMIN PANEL</h2>
          </div>

          {/* MENU */}
          <div className="flex-1 px-4 flex flex-col gap-1.5 overflow-y-auto
          [&::-webkit-scrollbar]:w-1
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-white/10
          [&::-webkit-scrollbar-thumb]:rounded-full
          hover:[&::-webkit-scrollbar-thumb]:bg-white/20">

            {/* --- TỔNG QUAN --- */}
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[1.2px] mt-6 mb-3 ml-4">Tổng quan</p>

            {[
              { tab: "dashboard", icon: <LayoutDashboard size={18} />, label: "Bảng điều khiển" },
              { tab: "banners", icon: <Package size={18} />, label: "Banner" },
              { tab: "news", icon: <Newspaper size={18} />, label: "Tin tức" },
            ].map(({ tab, icon, label }) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`flex items-center gap-3.5 border-none px-[18px] py-3.5 cursor-pointer text-left rounded-xl text-sm font-medium transition-all duration-300
                ${activeTab === tab
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-[0_4px_12px_rgba(37,99,235,0.25)] translate-x-1.5"
                    : "bg-transparent text-slate-400 hover:bg-white/5 hover:text-slate-50 hover:translate-x-1.5"
                  }`}
              >
                {icon} {label}
              </button>
            ))}

            <hr className="border-none border-t border-white/[0.08] my-3 mx-4" />

            {/* --- SẢN PHẨM --- */}
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[1.2px] mb-3 ml-4">Sản phẩm</p>

            {[
              { tab: "products", icon: <Smartphone size={18} />, label: "Điện thoại" },
              { tab: "electronics", icon: <ShoppingBag size={18} />, label: "Đồ điện tử" },
              { tab: "accessories", icon: <MousePointer2 size={18} />, label: "Phụ kiện" },
              { tab: "tags", icon: <Tag size={18} />, label: "Quản lý Tags" },
            ].map(({ tab, icon, label }) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`flex items-center gap-3.5 border-none px-[18px] py-3.5 cursor-pointer text-left rounded-xl text-sm font-medium transition-all duration-300
                ${activeTab === tab
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-[0_4px_12px_rgba(37,99,235,0.25)] translate-x-1.5"
                    : "bg-transparent text-slate-400 hover:bg-white/5 hover:text-slate-50 hover:translate-x-1.5"
                  }`}
              >
                {icon} {label}
              </button>
            ))}

            <hr className="border-none border-t border-white/[0.08] my-3 mx-4" />

            {/* --- VẬN HÀNH --- */}
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[1.2px] mb-3 ml-4">Vận hành</p>

            {/* Badge buttons */}
            {[
              { tab: "orders", icon: <FileText size={18} />, label: "Đơn hàng", badge: orderBadge },
              { tab: "reviews", icon: <BarChart3 size={18} />, label: "Đánh giá", badge: reviewBadge },
              { tab: "chat", icon: <MessageSquare size={18} />, label: "Chat", badge: chatBadge },
            ].map(({ tab, icon, label, badge }) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`flex items-center justify-between border-none pr-3 pl-[18px] py-3.5 cursor-pointer text-left rounded-xl text-sm font-medium transition-all duration-300
                ${activeTab === tab
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-[0_4px_12px_rgba(37,99,235,0.25)] translate-x-1.5"
                    : "bg-transparent text-slate-400 hover:bg-white/5 hover:text-slate-50 hover:translate-x-1.5"
                  }`}
              >
                <div className="flex items-center gap-3.5">{icon} {label}</div>
                {badge > 0 && (
                  <span className="bg-red-500 text-white text-[11px] font-extrabold px-1.5 py-0.5 rounded-[10px] min-w-[14px] text-center leading-none shadow-[0_2px_6px_rgba(239,68,68,0.4)]">
                    {badge}
                  </span>
                )}
              </button>
            ))}

            {/* Normal buttons */}
            {[
              { tab: "users", icon: <Users size={18} />, label: "Người dùng" },
              { tab: "feedbacks", icon: <Package size={18} />, label: "Phản hồi" },
              { tab: "vouchers", icon: <Ticket size={18} />, label: "Voucher" },
              { tab: "promotions", icon: <Flame size={18} />, label: "Giảm giá" },
            ].map(({ tab, icon, label }) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`flex items-center gap-3.5 border-none px-[18px] py-3.5 cursor-pointer text-left rounded-xl text-sm font-medium transition-all duration-300
                ${activeTab === tab
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-[0_4px_12px_rgba(37,99,235,0.25)] translate-x-1.5"
                    : "bg-transparent text-slate-400 hover:bg-white/5 hover:text-slate-50 hover:translate-x-1.5"
                  }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {/* FOOTER LOGOUT */}
          <div className="px-4 py-6 border-t border-white/[0.08] mt-auto">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-3 w-full bg-red-500/10 border border-red-500/20 text-red-500 px-[18px] py-3.5 cursor-pointer rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-red-500 hover:text-white hover:shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:-translate-y-0.5"
            >
              <LogOut size={18} /> Đăng xuất
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto p-10 bg-slate-50 box-border">
          <div className="mb-8">
            <h1 className="text-[28px] font-extrabold text-slate-900 m-0 tracking-tight">{getTabTitle()}</h1>
          </div>

          <div className="w-full min-h-[500px] box-border animate-[fadeIn_0.4s_ease-out]">
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

            {activeTab === "users" && (
              <div className="flex flex-col items-center justify-center px-5 py-20 text-center text-slate-500 h-full bg-white rounded-2xl border border-dashed border-slate-300">
                <Package size={48} className="text-slate-400 mb-6 bg-slate-100 p-6 rounded-full" />
                <h3 className="text-xl font-bold text-slate-800 m-0 mb-3">Tính năng đang phát triển</h3>
                <p className="text-[15px] max-w-[400px] leading-relaxed m-0">
                  Module <strong>{getTabTitle()}</strong> hiện đang được đội ngũ kỹ thuật xây dựng và sẽ sớm ra mắt.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminPage;