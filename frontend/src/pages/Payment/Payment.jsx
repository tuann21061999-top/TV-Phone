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
  const [activePaymentMethod, setActivePaymentMethod] = useState(null);

  // Data passed from CheckoutPage
  const orderPayload = location.state?.orderData;

  useEffect(() => {
    if (!orderPayload) {
      toast.error("Không tìm thấy thông tin đơn hàng để thanh toán");
      navigate("/cart");
    } else {
       // Automatically select the method passed from checkout
       setActivePaymentMethod(orderPayload.paymentMethod);
    }
  }, [orderPayload, navigate]);

  const handleSimulatedPayment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // We send the order payload to the backend to CREATE the order
      // In this simulated flow, we are treating this as a successful "payment"
      // and creating the order directly as if it was a COD order.
      
      // Update the payload to reflect the simulated "paid" status if needed by your backend
      const finalPayload = {
          ...orderPayload,
          paymentMethod: activePaymentMethod,
          isSimulatedPaymentSuccess: true // Flag for backend
      }

      // eslint-disable-next-line no-unused-vars
      const res = await axios.post(
        "http://localhost:5000/api/orders/checkout", 
        finalPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Thanh toán thành công (Simulated)!");
      navigate("/"); // Or redirect to a success page

    } catch (error) {
      console.error("Payment Simulation Error:", error);
      toast.error("Lỗi khi tạo đơn hàng sau thanh toán");
    } finally {
      setLoading(false);
    }
  };

  if (!orderPayload) return null;

  return (
    <div className="payment-page-container">
      <div className="payment-card payment-simulation-card">
        <button className="btn-back" onClick={() => navigate(-1)} disabled={loading}>
          <ArrowLeft size={18} /> Quay lại thông tin giao hàng
        </button>

        <div className="payment-header">
          <div className="payment-icon-wrapper">
            <Lock size={32} className="lock-icon" />
          </div>
          <h1>Mô phỏng Thanh toán</h1>
          <div className="amount-display">
            <span>Tổng tiền thanh toán:</span>
            <h2>{orderPayload.totalAmount.toLocaleString()}đ</h2>
          </div>
        </div>

        <div className="payment-simulation-content">
            {/* Left Side: QR Code Simulation */}
            <div className="qr-section">
                <h3>Quét mã QR để thanh toán</h3>
                <div className={`qr-placeholder ${activePaymentMethod?.toLowerCase()}`}>
                    <QrCode size={120} />
                    <p>Mã QR {activePaymentMethod}</p>
                </div>
            </div>

            {/* Right Side: Test Card Input Forms */}
            <div className="card-input-section">
                <h3>Thông tin thẻ Test</h3>
                
                {activePaymentMethod === 'MOMO' && (
                    <div className="momo-test-form">
                        <div className="form-group">
                            <label>Ngân hàng</label>
                            <input type="text" value="NCB" readOnly />
                        </div>
                        <div className="form-group">
                            <label>Số thẻ</label>
                            <input type="text" placeholder="9704198526191432198" />
                        </div>
                         <div className="form-group">
                            <label>Tên chủ thẻ</label>
                            <input type="text" placeholder="NGUYEN VAN A" />
                        </div>
                         <div className="form-group">
                            <label>Ngày phát hành</label>
                            <input type="text" placeholder="07/15" />
                        </div>
                         <div className="form-group">
                            <label>Mật khẩu OTP</label>
                            <input type="text" placeholder="123456" />
                        </div>
                    </div>
                )}

                {activePaymentMethod === 'VNPAY' && (
                     <div className="vnpay-test-form">
                         <div className="form-group">
                            <label>Ngân hàng Test</label>
                            <select>
                                <option value="NCB">NCB</option>
                                <option value="VNPAYQR">VNPAYQR</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Số thẻ Test (Thành công)</label>
                            <input type="text" placeholder="9704 0000 0000 0018" />
                        </div>
                         <div className="form-group">
                            <label>Tên chủ thẻ</label>
                            <input type="text" placeholder="NGUYEN VAN A" />
                        </div>
                         <div className="form-group">
                            <label>Ngày phát hành</label>
                            <input type="text" placeholder="03/07" />
                        </div>
                         <div className="form-group">
                            <label>OTP</label>
                            <input type="text" placeholder="123456" />
                        </div>
                    </div>
                )}

                <button 
                    className="btn-simulate-payment" 
                    onClick={handleSimulatedPayment}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="spinner" /> : "Xác nhận Thanh toán Test"}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Payment;