import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, ArrowRight, Home } from "lucide-react";
import "./PaymentResult.css";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    // VNPay returns ?vnp_ResponseCode=00 or ?status=success
    // MoMo returns ?resultCode=0 or ?status=success
    const vnpResponseCode = searchParams.get("vnp_ResponseCode");
    const momoResultCode = searchParams.get("resultCode");
    const explicitStatus = searchParams.get("status");

    if (explicitStatus === "success" || vnpResponseCode === "00" || momoResultCode === "0") {
      setStatus("success");
    } else if (explicitStatus === "error" || explicitStatus === "invalid_signature" || vnpResponseCode || momoResultCode) {
      setStatus("error");
    } else {
      // Missing parameters, maybe direct navigation
      setStatus("error"); 
    }
  }, [searchParams]);

  return (
    <div className="payment-result-container">
      <div className={`result-card ${status}`}>
        {status === "success" ? (
          <>
            <CheckCircle className="result-icon success" size={80} />
            <h1>Thanh toán thành công!</h1>
            <p>Cảm ơn bạn đã mua sắm tại TechNova. Đơn hàng của bạn đang được xử lý.</p>
          </>
        ) : (
          <>
            <XCircle className="result-icon error" size={80} />
            <h1>Giao dịch thất bại</h1>
            <p>Rất tiếc, đã có lỗi xảy ra hoặc bạn đã hủy giao dịch.</p>
          </>
        )}

        <div className="result-actions">
          <button className="btn-home" onClick={() => navigate("/")}>
            <Home size={18} /> Về Trang Chủ
          </button>
          <button className="btn-orders" onClick={() => navigate("/profile")}>
            Xem Đơn Hàng <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
