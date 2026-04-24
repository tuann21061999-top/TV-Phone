import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, ShieldCheck, Truck, Ticket, ChevronRight } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import Header from "../Layout/Header";
import Footer from "../Layout/Footer";
import AIRecommend from "../AI/AIRecommend";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [myVouchers, setMyVouchers] = useState([]);
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [applying, setApplying] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setCart(null);
      return;
    }

    const fetchOptions = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const fetchCart = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, fetchOptions);
        if (!res.ok) throw new Error("Lỗi tải giỏ hàng");
        const data = await res.json();
        setCart(data);
      } catch (err) {
        console.error(err);
        setCart(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchMyVouchers = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/vouchers/my-vouchers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyVouchers(data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCart();
    fetchMyVouchers();
  }, []);

  const handleApplyVoucher = async (codeToApply) => {
    const code = codeToApply || voucherCode;
    if (!code) return;
    setApplying(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/vouchers/apply`, {
        code,
        orderTotal: cart.total
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setAppliedVoucher(data);
      setVoucherCode(code);
      setShowVoucherList(false);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Mã không hợp lệ");
      setAppliedVoucher(null);
    } finally {
      setApplying(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/update`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        method: "PUT",
        body: JSON.stringify({ itemId, quantity: newQty }),
      });
      const data = await res.json();
      if(res.ok) {
        setCart(data);
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (err) {
      toast.error("Lỗi cập nhật");
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm("Xóa sản phẩm khỏi giỏ hàng?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/remove/${itemId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        method: "DELETE",
      });
      const data = await res.json();
      if(res.ok) {
        setCart(data);
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (err) {
      toast.error("Lỗi khi xóa");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Đang tải giỏ hàng...</div>;

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="bg-[#f4f7fa] min-h-screen w-full relative overflow-x-hidden">
        <Header />
        <div className="w-full h-full flex flex-col justify-start">
          <main className="w-full max-w-[1200px] mx-auto py-10 px-4 text-center mt-6">
            <div className="flex justify-center mb-5">
              <ShoppingCart size={70} className="text-slate-300" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-3">Giỏ hàng trống</h2>
            <p className="text-sm md:text-base text-slate-500 mb-8 max-w-[280px] md:max-w-sm mx-auto leading-relaxed">
              Hãy khám phá các ưu đãi hấp dẫn và thêm sản phẩm vào giỏ nhé!
            </p>
            <button className="bg-blue-600 text-white px-8 py-3.5 rounded-full font-bold shadow-lg md:text-base hover:bg-blue-700 transition" onClick={() => navigate("/")}>
              Bắt đầu mua sắm
            </button>
            <div className="w-full mt-12 mb-6 block overflow-hidden">
              <AIRecommend />
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  const finalTotal = Math.max(0, cart.total - (appliedVoucher ? appliedVoucher.discountAmount : 0));

  return (
    <div className="bg-[#f4f7fa] min-h-screen font-sans flex flex-col pb-24 lg:pb-0 max-w-[100vw] overflow-x-hidden w-full">
      <Header />
      <main className="max-w-[1200px] mx-auto py-6 md:py-10 px-4 md:px-5 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 md:gap-[30px] flex-1 w-full min-w-0">

        {/* --- DANH SÁCH SẢN PHẨM --- */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-[32px] font-extrabold text-slate-900 m-0">Giỏ hàng</h1>
            <span className="bg-white px-3 py-1 rounded-full text-slate-500 text-sm font-semibold border border-slate-200">{cart.items.length} SP</span>
          </div>

          <div className="flex flex-col gap-3">
            {cart.items.map((item) => (
              <div key={item._id} className="bg-white p-3 md:p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center md:items-center gap-3 md:gap-5">
                {/* Ảnh */}
                <div className="w-20 h-20 md:w-[100px] md:h-[100px] shrink-0 bg-slate-50 rounded-xl overflow-hidden p-1">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                </div>

                {/* Thông tin */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm md:text-base font-bold text-slate-900 mb-0.5 md:mb-1 line-clamp-2">{item.name}</h3>
                      <p className="text-xs md:text-[13px] text-slate-500 mb-0 truncate">{item.color} | {item.storage}</p>
                    </div>
                    {/* Nút xóa */}
                    <button className="text-slate-400 hover:text-red-500 transition-colors p-1 shrink-0 -mt-1 -mr-1" onClick={() => handleRemoveItem(item._id)} title="Xóa">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="flex items-end justify-between mt-3">
                    <div className="text-blue-600 font-bold text-[15px] md:text-lg min-w-0 truncate">
                      {item.price.toLocaleString()}đ
                    </div>
                    
                    {/* Bộ tăng giảm số lượng */}
                    <div className="flex items-center shadow-sm border border-slate-200 bg-white rounded-lg h-8 md:h-9 shrink-0 overflow-hidden">
                      <button className="w-7 md:w-8 h-full flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors" onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}><Minus size={14}/></button>
                      <span className="w-7 md:w-8 text-center font-semibold text-[13px] md:text-sm text-slate-900 bg-slate-50 border-x border-slate-200 h-full flex items-center justify-center">{item.quantity}</span>
                      <button className="w-7 md:w-8 h-full flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors" onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}><Plus size={14}/></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-6 bg-transparent border-none text-slate-500 font-semibold flex items-center gap-2 text-sm hover:text-blue-600" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Quay lại mua sắm
          </button>
        </div>

        {/* --- THANH TOÁN & VOUCHER --- */}
        <aside>
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 lg:sticky lg:top-[100px]">
            <h3 className="text-lg font-bold mb-6 text-slate-900">Chi tiết thanh toán</h3>

            {/* Voucher Section */}
            <div className="space-y-3 mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập mã giảm giá"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  disabled={!!appliedVoucher}
                  className="flex-1 min-w-0 h-11 px-3 md:px-4 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-blue-500 disabled:opacity-50 text-[13px] md:text-sm"
                />
                {!appliedVoucher ? (
                  <button className="bg-slate-900 text-white px-4 md:px-5 shrink-0 rounded-xl text-[13px] md:text-sm font-bold disabled:opacity-50" onClick={() => handleApplyVoucher()} disabled={applying || !voucherCode.trim()}>
                    {applying ? "..." : "Dùng"}
                  </button>
                ) : (
                  <button className="text-red-500 font-bold text-sm px-2" onClick={() => {setAppliedVoucher(null); setVoucherCode("");}}>Hủy</button>
                )}
              </div>

              {myVouchers.length > 0 && !appliedVoucher && (
                <div className="relative">
                  <button className="flex items-center justify-between px-4 py-2.5 bg-blue-50 border border-dashed border-blue-200 text-blue-600 rounded-xl text-[13px] font-bold w-full" onClick={() => setShowVoucherList(!showVoucherList)}>
                    <div className="flex items-center gap-2"><Ticket size={16}/> Voucher của bạn</div>
                    <ChevronRight size={14} className={showVoucherList ? "rotate-90" : ""}/>
                  </button>
                  {showVoucherList && (
                    <div className="absolute top-full left-0 w-full bg-white border border-slate-100 rounded-xl shadow-xl mt-2 z-20 max-h-48 overflow-y-auto p-2 space-y-1">
                      {myVouchers.map(v => (
                        <div key={v._id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg border border-slate-50">
                          <div>
                            <div className="font-bold text-sm">{v.code}</div>
                            <div className="text-[11px] text-slate-400">{v.discountType === "percentage" ? `Giảm ${v.value}%` : `Giảm ${v.value.toLocaleString()}đ`}</div>
                          </div>
                          <button className="text-blue-600 text-xs font-bold" onClick={() => handleApplyVoucher(v.code)}>Dùng ngay</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Price Info */}
            <div className="space-y-4 border-t border-slate-50 pt-6">
              <div className="flex justify-between text-slate-500 text-sm">
                <span>Tạm tính</span>
                <span className="font-semibold text-slate-900">{cart.total.toLocaleString()}đ</span>
              </div>
              {appliedVoucher && (
                <div className="flex justify-between text-emerald-500 text-sm">
                  <span>Giảm giá ({appliedVoucher.voucherCode})</span>
                  <span className="font-bold">-{appliedVoucher.discountAmount.toLocaleString()}đ</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="text-slate-900 font-bold">Tổng cộng</span>
                <span className="text-xl md:text-2xl font-black text-blue-600">{finalTotal.toLocaleString()}đ</span>
              </div>
            </div>

            <button className="hidden lg:block w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-blue-200 mt-8 transition-transform active:scale-95" 
              onClick={() => navigate('/checkout', { state: { items: cart.items, isBuyNow: false, appliedVoucher } })}>
              TIẾN HÀNH ĐẶT HÀNG
            </button>

            <div className="mt-6 flex items-center justify-center gap-4 text-slate-400">
              <ShieldCheck size={20} /><Truck size={20} /><span className="text-[11px] text-slate-400">Cam kết bảo mật & Giao hàng nhanh</span>
            </div>
          </div>
        </aside>
      </main>

      {/* --- STICKY MOBILE CHECKOUT BAR --- */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white p-3 md:p-4 border-t border-slate-200 shadow-[0_-4px_15px_rgba(0,0,0,0.06)] z-[100] flex items-center justify-between gap-3 overflow-hidden">
        <div className="flex flex-col min-w-0 shrink-0 max-w-[45%]">
          <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">Tổng cộng</span>
          <span className="text-base sm:text-lg font-black text-blue-600 leading-tight truncate">{finalTotal.toLocaleString()}đ</span>
        </div>
        <button 
          className="flex-1 min-w-0 bg-blue-600 text-white py-3 sm:py-3.5 px-2 rounded-xl font-bold text-[13px] sm:text-sm shadow-lg shadow-blue-200 active:bg-blue-700 truncate"
          onClick={() => navigate('/checkout', { state: { items: cart.items, isBuyNow: false, appliedVoucher } })}
        >
          MUA HÀNG ({cart.items.length})
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;