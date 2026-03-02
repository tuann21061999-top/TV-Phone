import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Search, Package, CheckCircle, Truck, 
  XCircle, Clock, RotateCcw, Eye, CreditCard, X
} from "lucide-react";
import { toast } from "sonner";
import "./ManageOrder.css";

const ManageOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // State quản lý Modal Chi tiết
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
      const res = await axios.get("http://localhost:5000/api/orders/admin/all", {
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
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/orders/admin/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Cập nhật trạng thái thành công!");
      fetchAllOrders(); 
      if(selectedOrder && selectedOrder._id === orderId) setSelectedOrder(null); // Đóng modal nếu đang mở
    } catch (error) {
      toast.error("Lỗi cập nhật trạng thái!");
    }
  };

  const filteredOrders = orders.filter(order => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      order._id.toLowerCase().includes(query) ||
      order.shippingInfo?.fullName?.toLowerCase().includes(query) ||
      order.shippingInfo?.phone?.includes(query);

    if (!matchesSearch) return false;

    switch (activeTab) {
      case "all": return true;
      case "needs_action": return order.status === "waiting_approval" || order.status === "paid";
      case "pending": return order.status === "pending";
      case "preparing": return order.status === "preparing";
      case "shipping": return order.status === "shipping";
      case "done": return order.status === "done";
      case "cancelled_returned": return order.status === "cancelled" || order.status === "returned";
      default: return true;
    }
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "waiting_approval": return <span className="badge badge-warning"><Clock size={14}/> Chờ duyệt (COD)</span>;
      case "pending": return <span className="badge badge-secondary"><Clock size={14}/> Chờ thanh toán</span>;
      case "paid": return <span className="badge badge-info"><CheckCircle size={14}/> Đã trả tiền</span>;
      case "preparing": return <span className="badge badge-primary"><Package size={14}/> Đang đóng gói</span>;
      case "shipping": return <span className="badge badge-shipping"><Truck size={14}/> Đang giao hàng</span>;
      case "done": return <span className="badge badge-success"><CheckCircle size={14}/> Hoàn thành</span>;
      case "cancelled": return <span className="badge badge-danger"><XCircle size={14}/> Đã hủy</span>;
      case "returned": return <span className="badge badge-danger"><RotateCcw size={14}/> Trả hàng</span>;
      default: return <span className="badge">Không rõ</span>;
    }
  };

  return (
    <div className="manage-order-container">
      <div className="mo-toolbar">
        <div className="mo-search">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo Mã ĐH, Tên khách, SĐT..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="mo-tabs">
        {adminTabs.map(tab => {
          let count = 0;
          if (tab.id === "all") count = orders.length;
          else if (tab.id === "needs_action") count = orders.filter(o => o.status === "waiting_approval" || o.status === "paid").length;
          else if (tab.id === "cancelled_returned") count = orders.filter(o => o.status === "cancelled" || o.status === "returned").length;
          else count = orders.filter(o => o.status === tab.id).length;

          return (
            <button 
              key={tab.id} 
              className={`mo-tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label} <span className="mo-count">{count}</span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="mo-loading">Đang tải dữ liệu đơn hàng...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="mo-empty">Không tìm thấy đơn hàng nào phù hợp.</div>
      ) : (
        <div className="mo-list">
          {filteredOrders.map(order => (
            <div key={order._id} className="mo-card">
              
              <div className="mo-card-header">
                <div className="mo-header-left">
                  <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                  <span className="mo-date">{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                  {getStatusBadge(order.status)}
                </div>
                <div className="mo-header-right">
                  <span className={`mo-payment-method ${order.paymentMethod.toLowerCase()}`}>
                    <CreditCard size={14}/> {order.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="mo-card-body">
                <div className="mo-customer-info">
                  <p><strong>Khách hàng:</strong> {order.shippingInfo?.fullName || "Chưa cập nhật"}</p>
                  <p><strong>SĐT:</strong> {order.shippingInfo?.phone}</p>
                  <p><strong>Địa chỉ:</strong> {order.shippingInfo?.addressDetail}, {order.shippingInfo?.district}, {order.shippingInfo?.province}</p>
                </div>

                <div className="mo-items-summary">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="mo-item-row">
                      <img src={item.image} alt="" />
                      <div className="mo-item-text">
                        <p className="mo-item-name">{item.name}</p>
                        <p className="mo-item-meta">{item.color} | {item.storage} | x{item.quantity}</p>
                      </div>
                      <span className="mo-item-price">{(item.price * item.quantity).toLocaleString()}đ</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mo-card-footer">
                <div className="mo-total">
                  Tổng thu: <strong>{order.total.toLocaleString()}đ</strong>
                </div>
                
                <div className="mo-actions">
                    {/* NÚT MỞ MODAL CHI TIẾT */}
                    <button className="btn-icon btn-view" onClick={() => setSelectedOrder(order)}>
                        <Eye size={16}/> Chi tiết
                    </button>
                    
                    {(order.status === "waiting_approval" || order.status === "paid") && (
                        <button className="btn-action btn-approve" onClick={() => updateOrderStatus(order._id, "preparing")}>
                        Duyệt & Đóng gói
                        </button>
                    )}

                    {order.status === "preparing" && (
                        <button className="btn-action btn-ship" onClick={() => updateOrderStatus(order._id, "shipping")}>
                        Bàn giao cho ĐVVC
                        </button>
                    )}

                    {order.status === "shipping" && !order.isDeliveryConfirming && (
                        <button 
                        className="btn-action btn-success" 
                        onClick={async () => {
                            try {
                            const token = localStorage.getItem("token");
                            await axios.put(`http://localhost:5000/api/orders/admin/${order._id}/notify-delivery`, {}, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            toast.success("Đã gửi thông báo xác nhận đến khách hàng!");
                            fetchAllOrders();
                            } catch (error) { toast.error("Lỗi gửi thông báo"); }
                        }}
                        >
                        Thông báo nhận hàng
                        </button>
                    )}

                    {order.status === "shipping" && order.isDeliveryConfirming && (
                        <span className="badge badge-warning">Đang chờ khách xác nhận...</span>
                    )}

                    {["waiting_approval", "pending", "paid", "preparing", "shipping"].includes(order.status) && (
                        <button 
                        className="btn-action btn-cancel" 
                        onClick={() => {
                            if(window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
                            updateOrderStatus(order._id, "cancelled");
                            }
                        }}
                        >
                        Hủy đơn
                        </button>
                    )}
                    </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      {selectedOrder && (
        <div className="mo-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="mo-modal-content" onClick={e => e.stopPropagation()}>
            <div className="mo-modal-header">
              <h2>Chi tiết đơn hàng #{selectedOrder._id.slice(-8).toUpperCase()}</h2>
              <button className="mo-modal-close" onClick={() => setSelectedOrder(null)}><X size={24}/></button>
            </div>
            
            <div className="mo-modal-body">
              <div className="mo-modal-grid">
                
                {/* Cột 1: Thông tin người nhận & Thanh toán */}
                <div className="mo-modal-col">
                  <div className="mo-detail-box">
                    <h3>Thông tin người nhận</h3>
                    <p><strong>Họ tên:</strong> {selectedOrder.shippingInfo?.fullName}</p>
                    <p><strong>Số điện thoại:</strong> {selectedOrder.shippingInfo?.phone}</p>
                    <p><strong>Email:</strong> {selectedOrder.email || selectedOrder.shippingInfo?.email}</p>
                    <p><strong>Địa chỉ:</strong> {selectedOrder.shippingInfo?.addressDetail}, {selectedOrder.shippingInfo?.ward}, {selectedOrder.shippingInfo?.district}, {selectedOrder.shippingInfo?.province}</p>
                  </div>
                  
                  <div className="mo-detail-box">
                    <h3>Thông tin thanh toán</h3>
                    <p><strong>Phương thức:</strong> {selectedOrder.paymentMethod}</p>
                    <p><strong>Trạng thái:</strong> {getStatusBadge(selectedOrder.status)}</p>
                    <p><strong>Ngày tạo:</strong> {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                </div>

                {/* Cột 2: Danh sách sản phẩm & Tổng tiền */}
                <div className="mo-modal-col">
                  <div className="mo-detail-box">
                    <h3>Sản phẩm đã đặt</h3>
                    <div className="mo-modal-items">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="mo-modal-item-row">
                          <img src={item.image} alt={item.name} />
                          <div className="mo-modal-item-info">
                            <p className="name">{item.name}</p>
                            <p className="meta">{item.color} | {item.storage} | <strong>x{item.quantity}</strong></p>
                          </div>
                          <div className="mo-modal-item-price">
                            {(item.price * item.quantity).toLocaleString()}đ
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mo-detail-box summary-box">
                    <div className="summary-line">
                      <span>Tạm tính</span>
                      <span>{selectedOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}đ</span>
                    </div>
                    <div className="summary-line">
                      <span>Phí vận chuyển</span>
                      <span>{selectedOrder.shippingFee === 0 ? "Miễn phí" : `${selectedOrder.shippingFee?.toLocaleString()}đ`}</span>
                    </div>
                    {selectedOrder.warrantyFee > 0 && (
                      <div className="summary-line">
                        <span>Bảo hành ({selectedOrder.warrantyType})</span>
                        <span>{selectedOrder.warrantyFee?.toLocaleString()}đ</span>
                      </div>
                    )}
                    {selectedOrder.discountAmount > 0 && (
                      <div className="summary-line text-green">
                        <span>Giảm giá</span>
                        <span>-{selectedOrder.discountAmount?.toLocaleString()}đ</span>
                      </div>
                    )}
                    <div className="summary-line total-line">
                      <span>Tổng tiền khách trả</span>
                      <span>{selectedOrder.total?.toLocaleString()}đ</span>
                    </div>
                  </div>
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