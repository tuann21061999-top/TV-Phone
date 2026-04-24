import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ShoppingCart, CheckCircle, Package, Truck, Check, 
  MapPin, Headphones, Printer, ChevronLeft, Copy
} from "lucide-react";
import Header from "../../components/Layout/Header";
import Footer from "../../components/Layout/Footer";
import { toast } from "sonner";

const OrderDetail = () => {
  const { id } = useParams(); // Lấy ID đơn hàng từ URL
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrder(res.data);
      } catch (error) {
        toast.error("Không thể tải chi tiết đơn hàng");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id, navigate]);

  // Hàm xác định bước hiện tại trong thanh tiến trình (Stepper)
  const getStepIndex = (status) => {
    switch (status) {
      case "waiting_approval":
      case "pending": return 1;
      case "paid": return 2;
      case "preparing": return 3;
      case "shipping": return 4;
      case "done": return 5;
      case "returned":
      case "cancelled": return 5; // Vẫn cho đi đến cuối nhưng đổi màu đỏ
      default: return 1;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "waiting_approval": return "Chờ xác nhận (COD)";
      case "pending": return "Chờ thanh toán";
      case "paid": return "Đã thanh toán";
      case "preparing": return "Đang đóng gói";
      case "shipping": return "ĐANG GIAO";
      case "done": return "THÀNH CÔNG";
      case "cancelled": return "ĐÃ HỦY";
      case "returned": return "TRẢ HÀNG";
      default: return "Không rõ";
    }
  };

  if (loading) return <div className="text-center mt-24 text-slate-500">Đang tải thông tin đơn hàng...</div>;
  if (!order) return <div className="text-center mt-24 text-slate-500">Không tìm thấy đơn hàng!</div>;

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === "cancelled" || order.status === "returned";

  // Mockup dữ liệu lịch sử vận chuyển (Vì DB hiện tại chưa lưu mảng lịch sử)
  const orderDate = new Date(order.createdAt).toLocaleString('vi-VN');
  
  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Header />

      <main className="max-w-[1100px] mx-auto px-4 py-8 pb-16">
        {/* Nút quay lại */}
        <button 
          className="flex items-center gap-1 bg-transparent border-none text-slate-500 text-sm font-medium cursor-pointer mb-6 p-0 transition-colors hover:text-blue-600" 
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={20} /> Quay lại danh sách đơn hàng
        </button>

        {/* Header Đơn hàng */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-slate-800 m-0">Đơn hàng #{order._id.slice(-8).toUpperCase()}</h2>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                order.status === "done" ? "bg-emerald-100 text-emerald-700" :
                (order.status === "cancelled" || order.status === "returned") ? "bg-red-100 text-red-700" :
                (order.status === "shipping") ? "bg-indigo-100 text-indigo-700" :
                "bg-amber-100 text-amber-600"
              }`}>
                {getStatusText(order.status)}
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-2 font-medium">
              Đặt ngày {new Date(order.createdAt).toLocaleDateString('vi-VN')} • Dự kiến giao: Sau 2-3 ngày
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 py-2 px-4 bg-white border border-slate-200 rounded-lg text-slate-600 font-semibold text-sm transition-all hover:bg-slate-50 hover:border-slate-300">
              <Headphones size={16}/> Hỗ trợ
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 py-2 px-4 bg-white border border-slate-200 rounded-lg text-slate-600 font-semibold text-sm transition-all hover:bg-slate-50 hover:border-slate-300">
              <Printer size={16}/> In hóa đơn
            </button>
          </div>
        </div>

        {/* Thanh Tiến Trình (Stepper) */}
        <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm mb-6 relative overflow-hidden">
          <div className="absolute top-[55px] left-[10%] right-[10%] h-1 bg-slate-100 z-0 hidden md:block">
            <div 
              className={`h-full transition-all duration-500 ${isCancelled ? 'bg-red-500' : 'bg-blue-600'}`} 
              style={{ width: `${(currentStep - 1) * 25}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between relative z-10">
            {[
              { label: "Đã đặt", icon: ShoppingCart, date: new Date(order.createdAt).toLocaleDateString('vi-VN') },
              { label: "Đã xác nhận", icon: CheckCircle },
              { label: "Đang đóng gói", icon: Package },
              { label: "Đang giao", icon: Truck },
              { label: isCancelled ? (order.status === 'cancelled' ? 'Đã hủy' : 'Trả hàng') : 'Thành công', icon: Check }
            ].map((step, idx) => {
              const stepNum = idx + 1;
              const isActive = currentStep >= stepNum;
              return (
                <div key={idx} className={`flex flex-col items-center text-center w-20 md:w-32 ${isActive ? (isCancelled ? 'text-red-500' : 'text-slate-800') : 'text-slate-300'}`}>
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-3 border-2 transition-all duration-300 ${
                    isActive 
                      ? (isCancelled ? 'bg-red-500 border-red-500 text-white' : 'bg-blue-600 border-blue-600 text-white') 
                      : 'bg-white border-slate-100 text-slate-300'
                  }`}>
                    <step.icon size={20} className="md:w-6 md:h-6" />
                  </div>
                  <p className="m-0 text-xs md:text-sm font-bold hidden sm:block">{step.label}</p>
                  {step.date && <span className="text-[10px] md:text-xs mt-1 opacity-70">{step.date}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Khung nội dung 2 cột */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
          
          {/* CỘT TRÁI: Bản đồ & Lịch sử */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="inline-block bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded mb-2 uppercase">Vị trí hiện tại</div>
              <p className="m-0 mb-4 font-bold text-slate-800 text-sm">Trung tâm phân phối khu vực</p>
              <div className="h-48 bg-slate-50 rounded-xl relative flex items-center justify-center border border-slate-100 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
                  <div className="p-2 bg-white rounded-full shadow-lg border border-blue-100">
                    <MapPin size={28} className="fill-blue-600 text-white" />
                  </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 m-0 mb-6 flex items-center gap-2">Lịch sử vận chuyển</h3>
              <div className="flex flex-col gap-6">
                {currentStep >= 4 && (
                  <div className="flex gap-4 relative pb-1">
                    <div className="absolute left-[5px] top-5 bottom-[-24px] w-0.5 bg-slate-100"></div>
                    <div className="w-3 h-3 bg-blue-600 rounded-full mt-1.5 z-10 ring-4 ring-blue-100"></div>
                    <div className="flex-1">
                      <strong className="block text-sm text-blue-600 mb-1">Đang trên đường giao tới bạn.</strong>
                      <p className="m-0 text-[13px] text-slate-500 leading-relaxed">Đơn hàng đã rời kho phân phối và đang được Shipper giao.</p>
                    </div>
                  </div>
                )}

                {currentStep >= 3 && (
                  <div className="flex gap-4 relative pb-1">
                    <div className="absolute left-[5px] top-5 bottom-[-24px] w-0.5 bg-slate-100"></div>
                    <div className={`w-3 h-3 rounded-full mt-1.5 z-10 ${currentStep === 3 ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-slate-300'}`}></div>
                    <div className="flex-1">
                      <strong className={`block text-sm mb-1 ${currentStep === 3 ? 'text-blue-600' : 'text-slate-800'}`}>Đã bàn giao cho đơn vị vận chuyển.</strong>
                      <p className="m-0 text-[13px] text-slate-500 leading-relaxed">Đơn hàng đã được đóng gói xong.</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 relative">
                  <div className={`w-3 h-3 rounded-full mt-1.5 z-10 ${currentStep < 3 ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-slate-300'}`}></div>
                  <div className="flex-1">
                    <strong className={`block text-sm mb-1 ${currentStep < 3 ? 'text-blue-600' : 'text-slate-800'}`}>Đơn hàng đã được tạo thành công.</strong>
                    <p className="m-0 text-[13px] text-slate-500 leading-relaxed">{orderDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Chi tiết & Tóm tắt */}
          <div className="flex flex-col gap-6">
            
            {/* Chi tiết sản phẩm */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 m-0 mb-5">Chi tiết đơn hàng</h3>
              <div className="flex flex-col gap-4 mb-6">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 pb-4 border-b border-dashed border-slate-100 last:border-none last:pb-0">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg border border-slate-50 object-contain shrink-0 bg-slate-50" />
                    <div className="flex-1 min-w-0">
                      <h4 className="m-0 mb-1 text-sm font-bold text-slate-800 truncate">{item.name}</h4>
                      <p className="m-0 text-xs text-slate-500 mb-1">Màu: {item.color} {item.storage ? `| ${item.storage}` : ''}</p>
                      <p className="m-0 text-xs text-slate-500">SL: {item.quantity}</p>
                    </div>
                    <strong className="text-sm text-blue-600 shrink-0">{(item.price * item.quantity).toLocaleString()}đ</strong>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Tạm tính</span>
                  <span className="font-medium text-slate-700">{order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium text-slate-700">{order.shippingFee === 0 ? "Miễn phí" : `${order.shippingFee.toLocaleString()}đ`}</span>
                </div>
                {order.warrantyFee > 0 && (
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Bảo hành ({order.warrantyType})</span>
                    <span className="font-medium text-slate-700">{order.warrantyFee.toLocaleString()}đ</span>
                  </div>
                )}
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600 font-medium">
                    <span>Giảm giá</span>
                    <span>-{order.discountAmount.toLocaleString()}đ</span>
                  </div>
                )}
                <div className="flex justify-between items-center mt-3 pt-4 border-t border-slate-100">
                  <span className="font-bold text-slate-800">Tổng thanh toán</span>
                  <span className="text-xl font-extrabold text-blue-600">{order.total.toLocaleString()}đ</span>
                </div>
              </div>
            </div>

            {/* Địa chỉ nhận hàng */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-blue-600">
              <h3 className="text-sm font-bold text-slate-800 m-0 mb-4 flex items-center gap-2 uppercase tracking-wide">
                <MapPin size={18} className="text-blue-600" /> Địa chỉ nhận hàng
              </h3>
              <div className="text-sm leading-relaxed">
                <strong className="block text-slate-800 mb-1">{order.shippingInfo.fullName}</strong>
                <p className="m-0 text-slate-600 mb-1 font-medium">{order.shippingInfo.phone}</p>
                <p className="m-0 text-slate-500">{order.shippingInfo.addressDetail}, {order.shippingInfo.ward}, {order.shippingInfo.district}, {order.shippingInfo.province}</p>
              </div>
            </div>



          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderDetail;