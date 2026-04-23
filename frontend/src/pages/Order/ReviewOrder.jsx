import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle, ArrowRight, Home, Truck } from "lucide-react";
import axios from "axios";
import Header from "../../components/Layout/Header";
import Footer from "../../components/Layout/Footer";

const ReviewOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate]);

  if (loading) return <div className="flex justify-center items-center min-h-[50vh] text-slate-500 font-medium animate-pulse">Đang tải thông tin đơn hàng...</div>;
  if (!order) return <div className="flex justify-center items-center min-h-[50vh] text-red-500 font-medium">Không tìm thấy đơn hàng!</div>;

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex flex-col">
      <Header />
      
      <main className="flex-1 w-full max-w-[840px] mx-auto px-5 py-10 md:py-14">
        
        {/* Success Header */}
        <div className="flex flex-col items-center text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5 shadow-[0_0_0_10px_rgba(16,185,129,0.1)]">
            <CheckCircle size={48} className="text-emerald-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 m-0 mb-3">Đặt hàng thành công!</h1>
          <p className="text-slate-500 text-[15px] max-w-[400px] m-0 leading-relaxed">
            Cảm ơn bạn đã mua hàng tại <span className="font-semibold text-blue-600">V&T Nexis</span>. 
            Đơn hàng của bạn đang chờ xác nhận.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-5 mb-6 border-b border-slate-100">
            <h3 className="m-0 text-lg font-bold text-slate-800 flex items-center gap-2">
              Mã đơn hàng: <span className="text-blue-600">#{order._id.substring(0, 8).toUpperCase()}</span>
            </h3>
            <span className="text-sm font-medium text-slate-500 bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-100">
              {new Date(order.createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
          
          {/* Order Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
            <div className="flex flex-col gap-1.5">
              <h4 className="flex items-center gap-2 text-[15px] font-bold text-slate-800 m-0 mb-2">
                <Home size={18} className="text-blue-500" /> Thông tin nhận hàng
              </h4>
              <p className="m-0 text-sm text-slate-800 font-semibold">{order.shippingInfo?.fullName}</p>
              <p className="m-0 text-sm text-slate-600 font-medium">{order.shippingInfo?.phone}</p>
              <p className="m-0 text-sm text-slate-500 leading-relaxed">{order.shippingInfo?.addressDetail}, {order.shippingInfo?.ward}, {order.shippingInfo?.district}, {order.shippingInfo?.province}</p>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <h4 className="flex items-center gap-2 text-[15px] font-bold text-slate-800 m-0 mb-2">
                <Truck size={18} className="text-blue-500" /> Phương thức thanh toán
              </h4>
              <p className="m-0 text-sm text-slate-700 font-medium">{order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : order.paymentMethod}</p>
              <div className="mt-2">
                <span className={`inline-flex items-center py-1 px-2.5 rounded-md text-xs font-bold uppercase tracking-wider ${order.isPaid ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                  {order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </span>
              </div>
            </div>
          </div>

          {/* Ordered Items List */}
          <div className="border-t border-slate-100 pt-6">
            <h4 className="text-[15px] font-bold text-slate-800 m-0 mb-5">Danh sách sản phẩm</h4>
            <div className="flex flex-col gap-4">
              {order.items?.map(item => (
                <div key={item._id} className="flex items-start sm:items-center gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden p-1">
                    <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <div className="flex flex-col gap-1 w-full sm:w-auto">
                      <p className="m-0 text-sm font-bold text-slate-800 truncate">{item.name}</p>
                      <p className="m-0 text-[13px] text-slate-500 font-medium">{item.color} {item.storage ? `| ${item.storage}` : ''}</p>
                      <p className="m-0 text-[13px] text-slate-500">Số lượng: <span className="font-semibold text-slate-700">x{item.quantity}</span></p>
                    </div>
                    <div className="text-[15px] font-bold text-slate-800 shrink-0">
                      {(item.price * item.quantity).toLocaleString()}đ
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Totals */}
          <div className="border-t border-slate-100 pt-6 mt-6 flex flex-col gap-3 w-full sm:w-2/3 md:w-1/2 ml-auto">
            <div className="flex justify-between items-center text-sm text-slate-500">
              <span>Tạm tính:</span>
              <span className="font-medium text-slate-700">{order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between items-center text-sm text-slate-500">
              <span>Phí vận chuyển:</span>
              <span className="font-medium text-slate-700">{order.shippingFee ? `${order.shippingFee.toLocaleString()}đ` : "Miễn phí"}</span>
            </div>
            {order.warrantyFee > 0 && (
              <div className="flex justify-between items-center text-sm text-slate-500">
                <span>Phí bảo hành:</span>
                <span className="font-medium text-slate-700">{order.warrantyFee.toLocaleString()}đ</span>
              </div>
            )}
            {order.discountAmount > 0 && (
              <div className="flex justify-between items-center text-sm text-emerald-600 font-medium">
                <span>Giảm giá:</span>
                <span>-{order.discountAmount.toLocaleString()}đ</span>
              </div>
            )}
            <div className="flex justify-between items-center text-base mt-2 pt-4 border-t border-dashed border-slate-200">
              <span className="font-bold text-slate-800">Tổng cộng:</span>
              <span className="text-xl font-black text-blue-600">{order.total?.toLocaleString() || 0}đ</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          <Link 
            to="/" 
            className="flex-1 sm:flex-none flex justify-center items-center bg-white text-slate-600 border border-slate-300 py-3 px-6 rounded-xl text-sm font-bold no-underline transition-all hover:bg-slate-50 hover:text-slate-800 hover:border-slate-400 focus:ring-4 focus:ring-slate-100"
          >
            Tiếp tục mua sắm
          </Link>
          <Link 
            to="/profile?tab=orders" 
            className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-blue-600 text-white border-none py-3 px-6 rounded-xl text-sm font-bold no-underline shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:-translate-y-0.5 focus:ring-4 focus:ring-blue-600/20"
          >
            Xem đơn hàng của tôi <ArrowRight size={16}/>
          </Link>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default ReviewOrder;
