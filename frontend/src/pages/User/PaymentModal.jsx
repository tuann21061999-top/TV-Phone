/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { X, CreditCard, Smartphone, Landmark, Truck } from "lucide-react";

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

  useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return () => {
    document.body.style.overflow = "auto";
  };
}, [isOpen]);

  if (!isOpen) return null;

  return (
  <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center">
    <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 relative animate-fadeIn">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold text-slate-800">
          {initialData ? "Cập nhật thanh toán" : "Thêm phương thức thanh toán"}
        </h3>
        <button onClick={onClose} className="text-slate-500 hover:text-red-500">
          <X size={20} />
        </button>
      </div>

      {/* OPTIONS */}
      <div className="flex flex-col gap-3 mb-4">
        {[
          { key: "COD", icon: <Truck size={18} />, label: "Thanh toán khi nhận hàng (COD)" },
          { key: "BANK_TRANSFER", icon: <Landmark size={18} />, label: "Chuyển khoản ngân hàng" },
          { key: "MOMO", icon: <Smartphone size={18} />, label: "Ví điện tử MoMo" },
          { key: "VNPAY", icon: <CreditCard size={18} />, label: "Thanh toán qua VNPay" },
        ].map(opt => (
          <div
            key={opt.key}
            onClick={() => setPaymentType(opt.key)}
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
              ${paymentType === opt.key
                ? "border-blue-600 bg-blue-50 text-blue-600 shadow-sm"
                : "border-slate-200 hover:bg-slate-50"}
            `}
          >
            {opt.icon}
            <span className="text-sm font-medium">{opt.label}</span>
          </div>
        ))}
      </div>

      {/* BANK FORM */}
      {paymentType === "BANK_TRANSFER" && (
        <div className="flex flex-col gap-3 mb-4">
          <select
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={bankInfo.bankName}
            onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
          >
            <option value="">-- Chọn ngân hàng --</option>
            {BANK_OPTIONS.map((bank, index) => (
              <option key={index} value={bank}>{bank}</option>
            ))}
          </select>

          <input
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Số tài khoản"
            value={bankInfo.accountNumber}
            onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
          />

          <input
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tên chủ tài khoản"
            value={bankInfo.holderName}
            onChange={(e) => setBankInfo({ ...bankInfo, holderName: e.target.value })}
          />
        </div>
      )}

      {/* INFO */}
      {paymentType === "MOMO" && (
        <div className="text-sm text-pink-600 bg-pink-50 p-3 rounded-lg mb-4">
          Thanh toán sẽ được xử lý qua cổng MoMo khi đặt hàng.
        </div>
      )}

      {paymentType === "VNPAY" && (
        <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg mb-4">
          Bạn sẽ được chuyển sang cổng VNPay khi xác nhận đơn hàng.
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-100"
        >
          Hủy
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          {initialData ? "Lưu thay đổi" : "Lưu phương thức"}
        </button>
      </div>
    </div>
  </div>
);
};

export default PaymentModal;