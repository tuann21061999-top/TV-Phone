import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, CreditCard, Smartphone, ArrowLeft, Loader2, QrCode } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import "./Payment.css";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Lấy dữ liệu được truyền từ CheckoutPage sang
  const orderId = location.state?.orderId;
  const totalAmount = location.state?.total || location.state?.totalAmount;
  const activePaymentMethod = location.state?.paymentMethod;

  // Nếu không có ID đơn hàng (do người dùng gõ URL trực tiếp vào trang này), đá về giỏ hàng
  useEffect(() => {
    if (!orderId) {
      toast.error("Không tìm thấy mã đơn hàng để thanh toán!");
      navigate("/cart");
    }
  }, [orderId, navigate]);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (!activePaymentMethod) {
        toast.error("Vui lòng chọn phương thức thanh toán!");
        setLoading(false);
        return;
      }

      const { data } = await axios.post(
        "http://localhost:5000/api/payments/create-payment",
        {
          orderId,
          paymentMethod: activePaymentMethod
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data && data.checkoutUrl) {
        // Redirection logic to Gateway (VNPay/MoMo)
        toast.success("Đang chuyển hướng đến trang thanh toán...");
        window.location.href = data.checkoutUrl;
      } else {
        toast.error("Không nhận được đường dẫn thanh toán. Vui lòng thử lại!");
      }

    } catch (error) {
      console.error("Payment Creation Error:", error);
      toast.error("Lỗi khi tạo giao dịch thanh toán, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  if (!orderId) return null;

  return (
    <div className="payment-page-container">
      <div className="payment-card payment-simulation-card">

        {/* Nút quay lại */}
        <button className="btn-back" onClick={() => navigate(-1)} disabled={loading}>
          <ArrowLeft size={18} /> Quay lại
        </button>

        <div className="payment-header">
          <div className="payment-icon-wrapper">
            <Lock size={32} className="lock-icon" />
          </div>
          <h1>Đang chuyển hướng Cổng Thanh Toán</h1>
          <div className="amount-display">
            <span>Tổng tiền thanh toán:</span>
            <h2>{totalAmount?.toLocaleString()}đ</h2>
          </div>
        </div>

        <div className="payment-simulation-content">
          <div className="gateway-info-section" style={{ textAlign: "center", padding: "40px" }}>
            <h3>Bạn đã chọn thanh toán qua {activePaymentMethod}</h3>
            <p style={{ margin: "20px 0", color: "#666" }}>
              Khi bấm xác nhận, bạn sẽ được hệ thống chuyển hướng tự động sang cổng thanh toán quét mã QR của {activePaymentMethod === 'MOMO' ? 'MoMo' : 'VNPay'}.
            </p>
            
            <button
              className="btn-simulate-payment"
              onClick={handlePayment}
              disabled={loading}
              style={{ padding: "12px 30px", fontSize: "16px", background: activePaymentMethod === 'MOMO' ? '#a50064' : '#005baa' }}
            >
              {loading ? <Loader2 className="spinner" /> : `Thanh toán ngay qua ${activePaymentMethod}`}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Payment;