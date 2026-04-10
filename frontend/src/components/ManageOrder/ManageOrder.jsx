/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search, Package, CheckCircle, Truck,
  XCircle, Clock, RotateCcw, Eye, CreditCard, X, Shield, Calendar, AlertCircle
} from "lucide-react";
import { toast, Toaster } from "sonner";

const ManageOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const adminTabs = [
    { id: "all", label: "Tất cả" },
    { id: "needs_action", label: "Cần xử lý" },
    { id: "pending", label: "Chờ thanh toán" },
    { id: "preparing", label: "Đang đóng gói" },
    { id: "shipping", label: "Đang vận chuyển" },
    { id: "done", label: "Thành công" },
    { id: "cancelled_returned", label: "Hủy / Trả về" }
  ];

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    const statusLabels = { cancelled: "Hủy đơn", preparing: "Duyệt đơn", shipping: "Giao hàng", done: "Thành công" };
    if (!window.confirm(`Xác nhận chuyển trạng thái sang: ${statusLabels[newStatus] || newStatus}?`)) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/orders/admin/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Cập nhật trạng thái thành công!");
      fetchAllOrders();
      if (selectedOrder && selectedOrder._id === orderId) setSelectedOrder(null);
    } catch (error) {
      toast.error("Lỗi cập nhật trạng thái!");
    }
  };

  const handleReturnAction = async (orderId, action, reason = "") => {
    if (!window.confirm(`Xác nhận ${action === 'approve' ? 'đồng ý nhận lại' : 'từ chối'} yêu cầu trả hàng?`)) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/orders/admin/${orderId}/return-action`,
        { action, rejectReason: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Đã xử lý yêu cầu trả hàng!");
      fetchAllOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi xử lý yêu cầu!");
    }
  };

  const filteredOrders = orders.filter(order => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      order._id.toLowerCase().includes(query) ||
      order.shippingInfo?.fullName?.toLowerCase().includes(query) ||
      order.shippingInfo?.phone?.includes(query);

    if (!matchesSearch) return false;

    // 1. Lọc theo tab trạng thái
    let matchesTab = true;
    switch (activeTab) {
      case "needs_action": matchesTab = (order.status === "waiting_approval" || order.status === "paid" || (order.returnRequest && order.returnRequest.status === "pending")); break;
      case "pending": matchesTab = (order.status === "pending"); break;
      case "preparing": matchesTab = (order.status === "preparing"); break;
      case "shipping": matchesTab = (order.status === "shipping"); break;
      case "done": matchesTab = (order.status === "done"); break;
      case "cancelled_returned": matchesTab = (order.status === "cancelled" || order.status === "returned"); break;
      default: matchesTab = true;
    }
    if (!matchesTab) return false;

    // 2. Lọc theo thời gian
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    if (dateFilter === "today") {
      return orderDate.toDateString() === now.toDateString();
    }
    if (dateFilter === "month") {
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    }

    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "waiting_approval": return <span className="badge badge-warning"><Clock size={14} /> Chờ duyệt (COD)</span>;
      case "pending": return <span className="badge badge-secondary"><Clock size={14} /> Chờ thanh toán</span>;
      case "paid": return <span className="badge badge-info"><CheckCircle size={14} /> Đã trả tiền</span>;
      case "preparing": return <span className="badge badge-primary"><Package size={14} /> Đang đóng gói</span>;
      case "shipping": return <span className="badge badge-shipping"><Truck size={14} /> Đang giao hàng</span>;
      case "done": return <span className="badge badge-success"><CheckCircle size={14} /> Hoàn thành</span>;
      case "cancelled": return <span className="badge badge-danger"><XCircle size={14} /> Đã hủy</span>;
      case "returned": return <span className="badge badge-danger"><RotateCcw size={14} /> Trả hàng</span>;
      default: return <span className="badge">Không rõ</span>;
    }
  };

  const getPaymentMethodClass = (method) => {
    const baseClass = "flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold ";
    switch (method) {
      case "VNPAY":
        return baseClass + "bg-blue-100 text-blue-700";
      case "MOMO":
        return baseClass + "bg-pink-100 text-pink-700";
      case "COD":
        return baseClass + "bg-emerald-100 text-emerald-700";
      default:
        return baseClass + "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full box-border font-sans">
      <Toaster position="top-right" richColors />

      {/* Toolbar & Search */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-2.5">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg py-2.5 px-4 w-full md:w-[350px] shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
          <Search size={18} className="text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo Mã ĐH, Tên khách, SĐT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-none outline-none w-full text-sm bg-transparent text-slate-800"
          />
        </div>
        <div className="flex items-center bg-white border border-slate-200 py-2.5 px-4 rounded-lg shadow-sm">
          <Calendar size={18} className="text-slate-500 mr-2" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border-none outline-none bg-transparent text-slate-600 font-medium text-sm cursor-pointer w-full"
          >
            <option value="all">Mọi thời gian</option>
            <option value="today">Hôm nay</option>
            <option value="month">Tháng này</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2.5 overflow-x-auto border-b-2 border-slate-200 pb-0.5 w-full [&::-webkit-scrollbar]:hidden">
        {adminTabs.map(tab => {
          let count = 0;
          if (tab.id === "all") count = orders.length;
          else if (tab.id === "needs_action") count = orders.filter(o => o.status === "waiting_approval" || o.status === "paid" || (o.returnRequest && o.returnRequest.status === "pending")).length;
          else if (tab.id === "cancelled_returned") count = orders.filter(o => o.status === "cancelled" || o.status === "returned").length;
          else count = orders.filter(o => o.status === tab.id).length;

          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              className={`bg-transparent border-none py-2.5 px-4 text-sm font-semibold cursor-pointer flex items-center gap-1.5 relative whitespace-nowrap transition-colors
                ${isActive ? "text-blue-600 after:absolute after:-bottom-[2px] after:left-0 after:right-0 after:h-[2.5px] after:bg-blue-600 after:rounded-t-sm" : "text-slate-500 hover:text-slate-800"}
              `}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              <span className={`py-0.5 px-2 rounded-xl text-[11px] font-bold ${isActive ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500 animate-pulse font-medium">Đang tải dữ liệu đơn hàng...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-xl text-slate-500 font-medium">Không tìm thấy đơn hàng nào phù hợp.</div>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          {filteredOrders.map(order => (
            <div key={order._id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden w-full transition-shadow hover:shadow-md">
              {/* Card Header */}
              <div className="flex justify-between items-center p-4 md:px-6 bg-slate-50 border-b border-slate-200 flex-wrap gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <strong className="text-[15px] text-blue-600 font-extrabold uppercase tracking-wide">#{order._id.slice(-8)}</strong>
                  <span className="text-slate-300">|</span>
                  <span className="text-[13px] text-slate-500 font-medium">{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                  {getStatusBadge(order.status)}
                  {order.returnRequest && order.returnRequest.status === "pending" && (
                    <span className="flex items-center gap-1 py-1 px-2.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 ml-1">Có Yêu cầu Trả hàng</span>
                  )}
                </div>
                <div>
                  <span className={getPaymentMethodClass(order.paymentMethod)}>
                    <CreditCard size={14} /> {order.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-7 p-4 md:p-6">
                <div className="text-[13.5px] text-slate-700 leading-relaxed">
                  <p className="m-0 mb-2.5"><strong className="text-slate-900">Khách hàng:</strong> {order.shippingInfo?.fullName || "Chưa cập nhật"}</p>
                  <p className="m-0 mb-2.5"><strong className="text-slate-900">SĐT:</strong> {order.shippingInfo?.phone}</p>
                  <p className="m-0 mb-2.5"><strong className="text-slate-900">Địa chỉ:</strong> {order.shippingInfo?.addressDetail}, {order.shippingInfo?.district}, {order.shippingInfo?.province}</p>
                  <p className="m-0 flex items-center gap-1.5">
                    <strong className="text-slate-900">Bảo hành:</strong>
                    <span className="text-blue-600 font-semibold flex items-center gap-1"><Shield size={14} className="mb-0.5" /> {order.warrantyType || "Cơ bản"}</span>
                  </p>
                </div>

                <div className="flex flex-col gap-3 md:border-l md:border-dashed md:border-slate-200 md:pl-7 max-md:border-t max-md:border-dashed max-md:border-slate-200 max-md:pt-5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <img src={item.image} alt="" className="w-12 h-12 rounded-lg border border-slate-200 object-cover p-0.5 bg-white" />
                      <div className="flex-1">
                        <p className="m-0 mb-1 text-[14px] font-bold text-slate-800 line-clamp-1">{item.name}</p>
                        <p className="m-0 text-[12.5px] text-slate-500 font-medium">{item.color} | {item.storage} | x{item.quantity}</p>
                      </div>
                      <span className="text-[15px] font-extrabold text-slate-800">{(item.price * item.quantity).toLocaleString()}đ</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 md:px-6 border-t border-slate-100 bg-slate-50">
                <div className="text-[14px] text-slate-600 font-medium w-full md:w-auto text-left">
                  Tổng thu: <strong className="text-[18px] text-red-500 ml-2 font-extrabold">{order.total.toLocaleString()}đ</strong>
                </div>

                <div className="flex flex-wrap gap-2.5 w-full md:w-auto justify-end">
                  <button className="bg-white border border-slate-300 text-slate-700 py-2 px-4 rounded-lg text-[13px] font-bold cursor-pointer flex items-center gap-1.5 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm" onClick={() => setSelectedOrder(order)}>
                    <Eye size={16} /> Chi tiết
                  </button>

                  {(order.status === "waiting_approval" || order.status === "paid") && (
                    <button className="border-none py-2 px-5 rounded-lg text-[13px] font-bold cursor-pointer text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm" onClick={() => updateOrderStatus(order._id, "preparing")}>
                      Duyệt & Đóng gói
                    </button>
                  )}

                  {order.status === "preparing" && (
                    <button className="border-none py-2 px-5 rounded-lg text-[13px] font-bold cursor-pointer text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-sm" onClick={() => updateOrderStatus(order._id, "shipping")}>
                      Bàn giao cho ĐVVC
                    </button>
                  )}

                  {order.status === "shipping" && !order.isDeliveryConfirming && (
                    <button className="border-none py-2 px-5 rounded-lg text-[13px] font-bold cursor-pointer text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm" onClick={async () => {
                      try {
                        const token = localStorage.getItem("token");
                        await axios.put(`${import.meta.env.VITE_API_URL}/api/orders/admin/${order._id}/notify-delivery`, {}, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        toast.success("Đã gửi yêu cầu xác nhận cho khách!");
                        fetchAllOrders();
                      } catch (error) { toast.error("Lỗi gửi thông báo"); }
                    }}>
                      Yêu cầu xác nhận nhận hàng
                    </button>
                  )}

                  {order.status === "shipping" && order.isDeliveryConfirming && (
                    <span className="flex items-center gap-1 py-2 px-4 rounded-lg text-[13px] font-bold bg-amber-100 text-amber-700 border border-amber-200">Đang chờ khách xác nhận...</span>
                  )}

                  {["waiting_approval", "pending", "paid", "preparing", "shipping"].includes(order.status) && (
                    <button className="py-2 px-5 rounded-lg text-[13px] font-bold cursor-pointer bg-white text-red-500 border border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm" onClick={() => updateOrderStatus(order._id, "cancelled")}>
                      Hủy đơn
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CHI TIẾT ĐƠN HÀNG & HẠCH TOÁN */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-[fadeIn_0.2s_ease-out]" onClick={() => setSelectedOrder(null)}>
          <div className="bg-slate-50 w-full max-w-[900px] max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center py-4 px-6 bg-white border-b border-slate-200 shrink-0">
              <h2 className="m-0 text-lg md:text-xl text-slate-800 font-extrabold uppercase tracking-wide">Đơn hàng <span className="text-blue-600">#{selectedOrder._id.slice(-8)}</span></h2>
              <button className="bg-slate-100 hover:bg-red-100 border-none text-slate-500 hover:text-red-500 cursor-pointer transition-colors p-1.5 rounded-lg flex items-center justify-center" onClick={() => setSelectedOrder(null)}><X size={20} /></button>
            </div>

            <div className="p-5 md:p-7 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6 md:gap-7">

                {/* Cột trái: Thông tin người nhận & Thanh toán */}
                <div className="flex flex-col gap-5 md:gap-6">
                  <div className="bg-white rounded-xl p-5 md:p-6 border border-slate-200 shadow-sm text-[13.5px] text-slate-600 leading-relaxed">
                    <h3 className="m-0 mb-4 text-[15px] text-slate-900 border-b border-dashed border-slate-200 pb-3 font-bold uppercase tracking-wide">Thông tin người nhận</h3>
                    <p className="m-0 mb-3"><strong className="text-slate-800">Họ tên:</strong> {selectedOrder.shippingInfo?.fullName}</p>
                    <p className="m-0 mb-3"><strong className="text-slate-800">Số điện thoại:</strong> {selectedOrder.shippingInfo?.phone}</p>
                    <p className="m-0"><strong className="text-slate-800">Địa chỉ:</strong> {selectedOrder.shippingInfo?.addressDetail}, {selectedOrder.shippingInfo?.ward}, {selectedOrder.shippingInfo?.district}, {selectedOrder.shippingInfo?.province}</p>
                  </div>

                  <div className="bg-white rounded-xl p-5 md:p-6 border border-slate-200 shadow-sm text-[13.5px] text-slate-600 leading-relaxed">
                    <h3 className="m-0 mb-4 text-[15px] text-slate-900 border-b border-dashed border-slate-200 pb-3 font-bold uppercase tracking-wide">Thanh toán</h3>
                    <p className="m-0 mb-3"><strong className="text-slate-800">Phương thức:</strong> {selectedOrder.paymentMethod}</p>
                    <div className="m-0 mb-3 flex items-center gap-2"><strong className="text-slate-800">Trạng thái:</strong> {getStatusBadge(selectedOrder.status)}</div>
                    <p className="m-0"><strong className="text-slate-800">Thời gian:</strong> {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                </div>

                {/* Cột phải: Sản phẩm & Hạch toán */}
                <div className="flex flex-col gap-5 md:gap-6">
                  <div className="bg-white rounded-xl p-5 md:p-6 border border-slate-200 shadow-sm">
                    <h3 className="m-0 mb-4 text-[15px] text-slate-900 border-b border-dashed border-slate-200 pb-3 font-bold uppercase tracking-wide">Sản phẩm</h3>
                    <div className="flex flex-col gap-4">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 pb-4 border-b border-slate-100 last:border-none last:pb-0">
                          <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg border border-slate-200 object-cover p-1 bg-white" />
                          <div className="flex-1">
                            <p className="m-0 mb-1 text-[14px] font-bold text-slate-800 line-clamp-1">{item.name}</p>
                            <p className="m-0 text-[13px] text-slate-500 font-medium">{item.color} | {item.storage} | x{item.quantity}</p>
                          </div>
                          <div className="font-extrabold text-slate-800 text-[15px]">{(item.price * item.quantity).toLocaleString()}đ</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* KHỐI HẠCH TOÁN LỢI NHUẬN TÀI CHÍNH */}
                  {["cancelled", "returned"].includes(selectedOrder.status) ? (
                    <div className="rounded-xl p-5 md:p-6 border border-dashed border-red-400 bg-red-50 shadow-sm">
                      <h3 className="m-0 mb-4 text-[15px] text-red-700 border-b border-dashed border-red-200 pb-3 font-bold uppercase tracking-wide">Hạch toán tài chính</h3>
                      <p className="text-red-500 italic text-[13.5px] font-medium m-0 flex items-center gap-1.5"><AlertCircle size={16} /> Đơn hàng đã bị hủy/trả về. Không ghi nhận lợi nhuận.</p>
                    </div>
                  ) : (
                    <div className="rounded-xl p-5 md:p-6 border border-dashed border-emerald-400 bg-emerald-50 shadow-sm">
                      <h3 className="m-0 mb-4 text-[15px] text-emerald-800 border-b border-dashed border-emerald-200 pb-3 font-bold uppercase tracking-wide">Hạch toán tài chính</h3>
                      <div className="flex justify-between text-[13.5px] text-slate-700 mb-3 font-medium">
                        <span>Doanh thu sản phẩm & Bảo hành</span>
                        <span>{(selectedOrder.total - (selectedOrder.shippingFee || 0)).toLocaleString()}đ</span>
                      </div>
                      <div className="flex justify-between text-[13.5px] text-slate-700 mb-3 font-medium">
                        <span>Tổng vốn nhập (importPrice)</span>
                        <span className="text-red-500">-{selectedOrder.items.reduce((sum, item) => sum + ((item.importPrice || 0) * item.quantity), 0).toLocaleString()}đ</span>
                      </div>
                      {selectedOrder.discountAmount > 0 && (
                        <div className="flex justify-between text-[13.5px] text-slate-700 mb-3 font-medium">
                          <span>Giảm giá (Voucher)</span>
                          <span className="text-red-500">-{selectedOrder.discountAmount.toLocaleString()}đ</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-base font-bold text-emerald-800 border-t-2 border-dashed border-emerald-200 pt-3 mt-3">
                        <strong>Lợi nhuận gộp dự kiến</strong>
                        <strong className="text-xl">
                          {(
                            (selectedOrder.total - (selectedOrder.shippingFee || 0)) -
                            selectedOrder.items.reduce((sum, item) => sum + ((item.importPrice || 0) * item.quantity), 0) -
                            (selectedOrder.discountAmount || 0)
                          ).toLocaleString()}đ
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* KHỐI YÊU CẦU TRẢ HÀNG NẾU CÓ */}
                  {selectedOrder.returnRequest && selectedOrder.returnRequest.isRequested && (
                    <div className="rounded-xl p-5 md:p-6 border border-red-300 bg-red-50 shadow-sm">
                      <h3 className="m-0 mb-4 text-[15px] text-red-700 border-b border-red-200 pb-3 font-bold uppercase tracking-wide flex items-center gap-2"><RotateCcw size={18} /> Yêu cầu trả hàng</h3>
                      <p className="text-[13.5px] text-slate-700 mb-2"><strong>Trạng thái: </strong>
                        {selectedOrder.returnRequest.status === 'pending' ? <span className="text-amber-600 font-bold ml-1">Đang chờ xử lý</span> :
                          selectedOrder.returnRequest.status === 'approved' ? <span className="text-emerald-600 font-bold ml-1">Đã chấp nhận</span> :
                            <span className="text-red-600 font-bold ml-1">Đã từ chối</span>}
                      </p>
                      <p className="text-[13.5px] text-slate-700 mb-2"><strong>Lý do:</strong> {selectedOrder.returnRequest.reason}</p>
                      {selectedOrder.returnRequest.rejectedReason && (
                        <p className="text-[13.5px] text-slate-700 mb-2"><strong>Lý do từ chối:</strong> {selectedOrder.returnRequest.rejectedReason}</p>
                      )}
                      {selectedOrder.returnRequest.images && selectedOrder.returnRequest.images.length > 0 && (
                        <div className="flex gap-2 flex-wrap mt-3 bg-white p-2 rounded-lg border border-red-100">
                          {selectedOrder.returnRequest.images.map((img, idx) => (
                            <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
                              <img src={img} alt="return-proof" className="w-16 h-16 object-cover rounded-md border border-slate-200" />
                            </a>
                          ))}
                        </div>
                      )}
                      {selectedOrder.returnRequest.status === 'pending' && (
                        <div className="mt-5 flex gap-3 pt-4 border-t border-red-200 border-dashed">
                          <button className="flex-1 py-2 px-4 rounded-lg border-none bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[13px] cursor-pointer shadow-sm transition-colors" onClick={() => handleReturnAction(selectedOrder._id, 'approve')}>Đồng ý nhận lại</button>
                          <button className="flex-1 py-2 px-4 rounded-lg border-none bg-slate-700 hover:bg-slate-800 text-white font-bold text-[13px] cursor-pointer shadow-sm transition-colors" onClick={() => {
                            const reason = prompt("Lý do từ chối yêu cầu trả hàng:");
                            if (reason !== null && reason.trim() !== "") handleReturnAction(selectedOrder._id, 'reject', reason);
                          }}>Từ chối</button>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrder;