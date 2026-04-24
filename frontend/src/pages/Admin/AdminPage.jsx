import { useState, useEffect } from "react";
import ManageProduct from "../Manage/ManagePhone";
import ManageElectronic from "../Manage/ManageElectronic";
import ManageAccessory from "../Manage/ManageAccessory";
import ManageOrder from "../Manage/ManageOrder";
import ManageReview from "../Manage/ManageReview";
import ManageUser from "../Manage/ManageUser";
import ManageBanner from "../Manage/ManageBanner";
import ManageFeedback from "../Manage/ManageFeedback";
import AdminDashboard from "../Manage/AdminDashboard";
import ManageChat from "../Manage/ManageChat";
import ManageVoucher from "../Manage/ManageVoucher";
import ManagePromotions from "../Manage/ManagePromotions";
import ManageNews from "../Manage/ManageNews";
import ManageTags from "../Manage/ManageTags";
import ManageCategory from "../Manage/ManageCategory";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";


import {
  ShoppingBag, FileText, Users, BarChart3,
  Package, Smartphone, MousePointer2, Settings,
  LogOut, LayoutDashboard, MessageSquare, Ticket, Flame,
  Newspaper, Tag, FolderTree, Menu, X
} from "lucide-react";

function AdminPage() {
  // Đặt Dashboard làm trang mặc định
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Badge States
  const [orderBadge, setOrderBadge] = useState(0);
  const [chatBadge, setChatBadge] = useState(0);
  const [reviewBadge, setReviewBadge] = useState(0);
  const [feedbackBadge, setFeedbackBadge] = useState(0);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        // Lấy orders
        const ordersRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/admin/all`, { headers });
        const newOrders = ordersRes.data.filter(o => 
          o.status === "waiting_approval" || 
          o.status === "paid" || 
          o.status === "pending" ||
          (o.returnRequest && o.returnRequest.status === "pending")
        ).length;
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

        // Lấy feedbacks
        const feedbacksRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/feedbacks/admin`, { headers });
        const unreadFeedbacks = feedbacksRes.data.filter(f => f.status === "new").length;
        if (activeTab !== "feedbacks") {
          setFeedbackBadge(unreadFeedbacks);
        } else {
          setFeedbackBadge(0);
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
    if (tab === "feedbacks") setFeedbackBadge(0);
    setIsSidebarOpen(false);
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
      case "categories": return "Quản lý Danh mục";
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
      <div className="flex h-screen w-full overflow-hidden relative">

        {/* MOBILE OVERLAY */}
        {isSidebarOpen && (
            <div className="fixed inset-0 bg-black/60 z-[1000] lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        {/* SIDEBAR */}
        <aside className={`fixed lg:static top-0 left-0 h-full w-[280px] bg-[#0b1120] z-[1001] transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col flex-shrink-0 border-r border-white/5 shadow-[4px_0_24px_rgba(0,0,0,0.1)]`}>
          
          {/* Nút đóng Sidebar trên Mobile */}
          <button className="lg:hidden absolute top-4 right-4 bg-transparent border-none cursor-pointer text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
          </button>

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
              { tab: "categories", icon: <FolderTree size={18} />, label: "Quản lý Danh mục" },
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
              { tab: "feedbacks", icon: <MessageSquare size={18} />, label: "Phản hồi", badge: feedbackBadge },
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
        <main className="flex-1 min-w-0 h-full overflow-y-auto bg-slate-50 box-border flex flex-col">
          
          {/* MOBILE TOPBAR */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
             <div className="flex items-center gap-3">
                 <button className="bg-transparent border-none p-1 cursor-pointer text-slate-700 flex items-center" onClick={() => setIsSidebarOpen(true)}>
                     <Menu size={26} strokeWidth={2.5} />
                 </button>
                 <h2 className="text-[18px] font-bold text-slate-900 m-0">Admin Panel</h2>
             </div>
             <button className="bg-slate-100 p-2 border-none rounded-full cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => navigate("/")} title="Về trang chủ">
                 <ShoppingBag size={18} className="text-slate-600" />
             </button>
          </div>

          <div className="p-4 md:p-10 flex-1">
            <div className="mb-6 md:mb-8">
              <h1 className="text-[22px] md:text-[28px] font-extrabold text-slate-900 m-0 tracking-tight">{getTabTitle()}</h1>
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
            {activeTab === "categories" && <ManageCategory />}

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
        </div>
        </main>
      </div>
    </div>
  );

}

export default AdminPage;