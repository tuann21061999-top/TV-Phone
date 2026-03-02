/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { X, CreditCard, Smartphone, Landmark, Truck } from "lucide-react";
import "./Profile.css";

// Danh sách các ngân hàng phổ biến để chọn
const BANK_OPTIONS = [
  "Vietcombank (Ngoại thương Việt Nam)",
  "Techcombank (Kỹ Thương Việt Nam)",
  "MB Bank (Quân Đội)",
  "ACB (Á Châu)",
  "BIDV (Đầu tư và Phát triển VN)",
  "VietinBank (Công Thương VN)",
  "VPBank (Việt Nam Thịnh Vượng)",
  "Agribank (Nông nghiệp & PTNT)",
  "Sacombank (Sài Gòn Thương Tín)",
  "TPBank (Tiên Phong)",
  "VIB (Quốc Tế)",
  "HDBank (Phát triển TPHCM)",
  "SHB (Sài Gòn - Hà Nội)",
];

const PaymentModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [paymentType, setPaymentType] = useState("COD");

  const [bankInfo, setBankInfo] = useState({
    bankName: "",
    accountNumber: "",
    holderName: ""
  });

  // Tự động điền dữ liệu khi mở Modal (để hỗ trợ chức năng Sửa)
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPaymentType(initialData.type || "COD");
        if (initialData.type === "BANK_TRANSFER") {
          setBankInfo({
            bankName: initialData.bankName || "",
            accountNumber: initialData.accountNumber || "",
            holderName: initialData.holderName || ""
          });
        }
      } else {
        // Reset form khi thêm mới
        setPaymentType("COD");
        setBankInfo({ bankName: "", accountNumber: "", holderName: "" });
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = () => {
    let payload = { type: paymentType };

    if (paymentType === "BANK_TRANSFER") {
      if (!bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.holderName) {
        alert("Vui lòng nhập đầy đủ thông tin ngân hàng");
        return;
      }
      payload = { ...payload, ...bankInfo };
    }

    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        
        <div className="payment-modal-header">
          <h3>{initialData ? "Cập nhật thanh toán" : "Thêm phương thức thanh toán"}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="payment-options">
          
          {/* COD */}
          <div 
            className={`payment-option ${paymentType === "COD" ? "active" : ""}`}
            onClick={() => setPaymentType("COD")}
          >
            <Truck size={20} />
            <span>Thanh toán khi nhận hàng (COD)</span>
          </div>

          {/* BANK TRANSFER */}
          <div 
            className={`payment-option ${paymentType === "BANK_TRANSFER" ? "active" : ""}`}
            onClick={() => setPaymentType("BANK_TRANSFER")}
          >
            <Landmark size={20} />
            <span>Chuyển khoản ngân hàng</span>
          </div>

          {/* MOMO */}
          <div 
            className={`payment-option ${paymentType === "MOMO" ? "active" : ""}`}
            onClick={() => setPaymentType("MOMO")}
          >
            <Smartphone size={20} />
            <span>Ví điện tử MoMo</span>
          </div>

          {/* VNPAY */}
          <div 
            className={`payment-option ${paymentType === "VNPAY" ? "active" : ""}`}
            onClick={() => setPaymentType("VNPAY")}
          >
            <CreditCard size={20} />
            <span>Thanh toán qua VNPay</span>
          </div>
        </div>

        {/* BANK FORM */}
        {paymentType === "BANK_TRANSFER" && (
          <div className="bank-form">
            <select
              value={bankInfo.bankName}
              onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
            >
              <option value="">-- Chọn ngân hàng --</option>
              {BANK_OPTIONS.map((bank, index) => (
                <option key={index} value={bank}>{bank}</option>
              ))}
            </select>
            
            <input
              placeholder="Số tài khoản"
              value={bankInfo.accountNumber}
              onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
            />
            <input
              placeholder="Tên chủ tài khoản"
              value={bankInfo.holderName}
              onChange={(e) => setBankInfo({ ...bankInfo, holderName: e.target.value })}
            />
          </div>
        )}

        {/* INFO TEXT */}
        {paymentType === "MOMO" && (
          <div className="payment-info">
            Thanh toán sẽ được xử lý qua cổng MoMo khi đặt hàng.
          </div>
        )}

        {paymentType === "VNPAY" && (
          <div className="payment-info">
            Bạn sẽ được chuyển sang cổng VNPay khi xác nhận đơn hàng.
          </div>
        )}

        <div className="payment-modal-actions">
          <button className="btn-cancel" onClick={onClose}>Hủy</button>
          <button className="btn-save" onClick={handleSubmit}>
            {initialData ? "Lưu thay đổi" : "Lưu phương thức"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;