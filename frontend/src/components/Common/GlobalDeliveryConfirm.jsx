import React, { useState, useEffect } from "react";
import axios from "axios";
import { Package, Check, X } from "lucide-react";
import { toast } from "sonner";

const GlobalDeliveryConfirm = () => {
  const [pendingOrders, setPendingOrders] = useState([]);

  const fetchPendingDeliveries = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/notifications/pending-delivery`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingOrders(res.data);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error("Lỗi tải thông báo nhận hàng", error);
      }
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPendingDeliveries();
    const interval = setInterval(fetchPendingDeliveries, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleConfirm = async (orderId, isAccepted) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/orders/${orderId}/confirm-delivery`,
        { isAccepted },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(isAccepted ? "Đã xác nhận nhận hàng!" : "Đã từ chối nhận hàng!");
      setPendingOrders(prev => prev.filter(o => o._id !== orderId));

      if (window.location.pathname === "/profile") {
        window.location.reload();
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Lỗi xử lý xác nhận!");
    }
  };

  if (pendingOrders.length === 0) return null;

  return (
    <div className="fixed bottom-[20px] right-[20px] flex flex-col gap-2 z-50">
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out forwards;
        }
      `}</style>

      {pendingOrders.map(order => (
        <div
          key={order._id}
          className="animate-slideUp bg-white p-3 rounded-[12px] shadow-[0_10px_25px_rgba(0,0,0,0.2)] w-[320px] border-l-[4px] border-[#2563EB]"
        >
          {/* ICON */}
          <div className="flex justify-center mb-0.5">
            <Package size={22} color="#2563EB" />
          </div>

          {/* TITLE */}
          <h3 className="m-0 mb-0.5 text-sm text-center text-[#1E293B] font-bold leading-tight">
            Xác nhận nhận hàng
          </h3>

          {/* TEXT */}
          <p className="text-xs text-[#475569] text-center mb-2.5 leading-[1.35] m-0">
            Đơn hàng{" "}
            <strong>#{order._id.slice(-8).toUpperCase()}</strong>{" "}
            đã được shipper giao đến bạn.
          </p>

          {/* BUTTONS */}
          <div className="flex gap-1.5">
            <button
              className="flex-1 px-1.5 py-1 rounded-[6px] font-semibold flex items-center justify-center gap-0.5 text-[11px] bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors"
              onClick={() => handleConfirm(order._id, true)}
            >
              <Check size={14} /> Đã nhận hàng
            </button>

            <button
              className="flex-1 px-1.5 py-1 rounded-[6px] font-semibold flex items-center justify-center gap-0.5 text-[11px] bg-[#FEE2E2] text-[#EF4444] hover:bg-[#FECACA] transition-colors"
              onClick={() => handleConfirm(order._id, false)}
            >
              <X size={14} /> Từ chối nhận
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GlobalDeliveryConfirm;