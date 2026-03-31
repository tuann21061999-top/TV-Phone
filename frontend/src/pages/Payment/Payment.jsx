import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, CreditCard, Smartphone, ArrowLeft, Loader2, QrCode } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-6 md:p-12 relative overflow-hidden">
        
        {/* Nút quay lại */}
        <button 
          className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-colors border-none bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed z-10" 
          onClick={() => navigate(-1)} 
          disabled={loading}
        >
          <ArrowLeft size={18} /> Quay lại
        </button>

        {/* Header Thanh toán */}
        <div className="flex flex-col items-center text-center mt-10 md:mt-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-blue-100">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 m-0">
            Chuyển hướng Cổng Thanh Toán
          </h1>
          
          <div className="mt-8 py-4 px-8 bg-slate-50 rounded-2xl border border-slate-100 w-full sm:w-auto">
            <span className="text-sm text-slate-500 font-medium uppercase tracking-wider">Tổng tiền thanh toán</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 m-0 mt-1">
              {totalAmount?.toLocaleString()}đ
            </h2>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="mt-12 pt-8 border-t border-slate-100">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-bold text-slate-800">
              Bạn đã chọn thanh toán qua <span className={activePaymentMethod === 'MOMO' ? 'text-[#a50064]' : 'text-[#005baa]'}>{activePaymentMethod}</span>
            </h3>
            
            <p className="my-6 text-slate-500 leading-relaxed text-[15px]">
              Hệ thống sẽ chuyển bạn đến trang quét mã QR an toàn của 
              <span className="font-semibold text-slate-700"> {activePaymentMethod === 'MOMO' ? 'Ví MoMo' : 'Cổng VNPay'}</span>. 
              Vui lòng không đóng trình duyệt cho đến khi giao dịch hoàn tất.
            </p>
            
            <button
              className={`w-full py-4 px-8 rounded-xl font-bold text-lg text-white transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer border-none disabled:opacity-70 disabled:cursor-not-allowed
                ${activePaymentMethod === 'MOMO' 
                  ? 'bg-[#a50064] hover:bg-[#8e0056] shadow-[#a50064]/20' 
                  : 'bg-[#005baa] hover:bg-[#004a8a] shadow-[#005baa]/20'
                }
              `}
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Smartphone size={20} />
                  Thanh toán ngay qua {activePaymentMethod}
                </>
              )}
            </button>

            {/* Footer an toàn */}
            <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
              <ShieldCheck size={16} />
              <span className="text-xs font-medium uppercase tracking-widest">Giao dịch được bảo mật 256-bit</span>
            </div>
          </div>
        </div>

        {/* Trang trí góc thẻ (Optional) */}
        <div className={`absolute -bottom-12 -right-12 w-32 h-32 rounded-full opacity-5 
          ${activePaymentMethod === 'MOMO' ? 'bg-[#a50064]' : 'bg-[#005baa]'}`} 
        />
      </div>
    </div>
  );
};

export default Payment;