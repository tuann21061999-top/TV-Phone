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
  const totalAmount = location.state?.totalAmount;
  const activePaymentMethod = location.state?.paymentMethod;

  // Nếu không có ID đơn hàng (do người dùng gõ URL trực tiếp vào trang này), đá về giỏ hàng
  useEffect(() => {
    if (!orderId) {
      toast.error("Không tìm thấy mã đơn hàng để thanh toán!");
      navigate("/cart");
    }
  }, [orderId, navigate]);

  const handleSimulatedPayment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // GỌI API CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG THÀNH "PAID"
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/pay`, 
        {}, // body để trống vì API chỉ cần ID trên URL
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Thanh toán thành công!");
      navigate("/"); // Hoặc bạn có thể tạo một trang "/thank-you" và navigate về đó

    } catch (error) {
      console.error("Payment Simulation Error:", error);
      toast.error("Lỗi xác nhận thanh toán, vui lòng thử lại!");
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
          <h1>Mô phỏng Thanh toán</h1>
          <div className="amount-display">
            <span>Tổng tiền thanh toán:</span>
            <h2>{totalAmount?.toLocaleString()}đ</h2>
          </div>
        </div>

        <div className="payment-simulation-content">
            {/* Cột trái: Hiển thị QR Code giả lập */}
            <div className="qr-section">
                <h3>Quét mã QR để thanh toán</h3>
                <div className={`qr-placeholder ${activePaymentMethod?.toLowerCase()}`}>
                    <QrCode size={120} />
                    <p>Mã QR {activePaymentMethod}</p>
                </div>
            </div>

            {/* Cột phải: Thông tin thẻ Test */}
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