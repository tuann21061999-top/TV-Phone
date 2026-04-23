import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, ArrowRight, Home } from "lucide-react";
import Header from "../../components/Layout/Header";
import Footer from "../../components/Layout/Footer";

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
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
      <Header />
      <div className="flex-1 flex justify-center items-center p-5">
        <div className={`bg-white rounded-xl p-10 text-center shadow-xl max-w-[500px] w-full border-t-[5px] animate-in fade-in zoom-in duration-300 ${
          status === "success" ? "border-green-500" : "border-red-500"
        }`}>
          {status === "success" ? (
            <>
              <CheckCircle className="mx-auto text-green-500" size={80} />
              <h1 className="text-2xl font-bold mt-5 mb-4 text-slate-800">Thanh toán thành công!</h1>
              <p className="text-slate-600 text-base leading-relaxed mb-8">
                Cảm ơn bạn đã mua sắm tại <span className="font-semibold text-blue-600">V&T Nexis</span>. 
                Đơn hàng của bạn đang được xử lý và sẽ sớm được giao.
              </p>
            </>
          ) : (
            <>
              <XCircle className="mx-auto text-red-500" size={80} />
              <h1 className="text-2xl font-bold mt-5 mb-4 text-slate-800">Giao dịch thất bại</h1>
              <p className="text-slate-600 text-base leading-relaxed mb-8">
                Rất tiếc, đã có lỗi xảy ra trong quá trình thanh toán hoặc bạn đã hủy giao dịch. 
                Vui lòng thử lại hoặc liên hệ hỗ trợ.
              </p>
            </>
          )}

          <div className="flex flex-wrap gap-4 justify-center">
            <button 
              className="flex items-center gap-2 py-3 px-6 bg-slate-100 text-slate-700 rounded-lg text-base font-medium transition-all hover:bg-slate-200 cursor-pointer border-none active:scale-95" 
              onClick={() => navigate("/")}
            >
              <Home size={18} /> Về Trang Chủ
            </button>
            <button 
              className="flex items-center gap-2 py-3 px-6 bg-blue-600 text-white rounded-lg text-base font-medium transition-all hover:bg-blue-700 cursor-pointer border-none shadow-md shadow-blue-600/20 active:scale-95" 
              onClick={() => navigate("/profile?tab=orders")}
            >
              Xem Đơn Hàng <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentResult;

