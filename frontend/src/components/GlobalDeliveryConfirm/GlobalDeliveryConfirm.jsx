import React, { useState, useEffect } from "react";
import axios from "axios";
import { Package, Check, X } from "lucide-react";
import { toast } from "sonner";
import "./GlobalDeliveryConfirm.css";

const GlobalDeliveryConfirm = () => {
  const [pendingOrders, setPendingOrders] = useState([]);

  const fetchPendingDeliveries = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:5000/api/orders/notifications/pending-delivery", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingOrders(res.data);
    } catch (error) {
      console.error("Lỗi tải thông báo nhận hàng");
    }
  };

  // Quét API mỗi 10 giây để xem admin có báo nhận hàng không
  useEffect(() => {
    fetchPendingDeliveries(); // Gọi lần đầu
    const interval = setInterval(fetchPendingDeliveries, 10000); 
    return () => clearInterval(interval);
  }, []);

  const handleConfirm = async (orderId, isAccepted) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/confirm-delivery`,
        { isAccepted },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(isAccepted ? "Đã xác nhận nhận hàng!" : "Đã từ chối nhận hàng!");
      // Xóa đơn hàng khỏi danh sách thông báo
      setPendingOrders(prev => prev.filter(o => o._id !== orderId));
      
      // Nếu đang đứng ở trang Profile, tự động reload trang để cập nhật UI
      if(window.location.pathname === "/profile") {
         window.location.reload();
      }
    } catch (error) {
      toast.error("Lỗi xử lý xác nhận!");
    }
  };

  if (pendingOrders.length === 0) return null;

  return (
    <div className="global-delivery-overlay">
      {pendingOrders.map(order => (
        <div key={order._id} className="delivery-popup-card">
          <div className="dp-icon"><Package size={32} color="#2563EB"/></div>
          <h3>Xác nhận nhận hàng</h3>
          <p>Đơn hàng <strong>#{order._id.slice(-8).toUpperCase()}</strong> đã được shipper giao đến bạn.</p>
          <div className="dp-actions">
            <button className="btn-dp-accept" onClick={() => handleConfirm(order._id, true)}>
              <Check size={16}/> Đã nhận hàng
            </button>
            <button className="btn-dp-reject" onClick={() => handleConfirm(order._id, false)}>
              <X size={16}/> Từ chối nhận
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GlobalDeliveryConfirm;