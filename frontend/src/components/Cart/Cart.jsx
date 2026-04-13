import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, ShieldCheck, Truck, Ticket, ChevronRight } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import AIRecommend from "../AIRecommend/AIRecommend";

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
      if(res.ok) setCart(data);
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
      if(res.ok) setCart(data);
    } catch (err) {
      toast.error("Lỗi khi xóa");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Đang tải giỏ hàng...</div>;

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="bg-[#f4f7fa] min-h-screen flex flex-col">
        <Header />
        <main className="max-w-[1200px] mx-auto py-12 px-5 flex-1 flex flex-col items-center text-center">
          <ShoppingCart size={70} className="text-slate-300 mb-5" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Giỏ hàng trống</h2>
          <p className="text-slate-500 mb-8 max-w-sm">Hãy khám phá các ưu đãi hấp dẫn và thêm sản phẩm vào giỏ nhé!</p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg" onClick={() => navigate("/")}>Bắt đầu mua sắm</button>
          <div className="w-full mt-10"><AIRecommend /></div>
        </main>
        <Footer />
      </div>
    );
  }

  const finalTotal = Math.max(0, cart.total - (appliedVoucher ? appliedVoucher.discountAmount : 0));

  return (
    <div className="bg-[#f4f7fa] min-h-screen font-sans flex flex-col pb-24 lg:pb-0">
      <Header />
      <main className="max-w-[1200px] mx-auto py-6 md:py-10 px-4 md:px-5 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 md:gap-[30px] flex-1 w-full">

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
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm md:text-base font-bold text-slate-900 mb-0.5 md:mb-1 truncate">{item.name}</h3>
                  <p className="text-xs md:text-[13px] text-slate-500 mb-1 md:mb-2">{item.color} | {item.storage}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="text-blue-600 font-bold text-[14px] md:text-lg">
                      {item.price.toLocaleString()}đ
                    </div>
                    
                    {/* Bộ tăng giảm số lượng (Mobile gọn hơn) */}
                    <div className="flex items-center bg-slate-100 rounded-lg p-1 h-8 md:h-9">
                      <button className="w-7 h-full flex items-center justify-center text-slate-500" onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}><Minus size={14}/></button>
                      <span className="w-7 text-center font-bold text-sm text-slate-900">{item.quantity}</span>
                      <button className="w-7 h-full flex items-center justify-center text-slate-500" onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}><Plus size={14}/></button>
                    </div>
                  </div>
                </div>

                {/* Nút xóa */}
                <button className="p-2 text-slate-300 hover:text-red-500 transition-colors" onClick={() => handleRemoveItem(item._id)}>
                  <Trash2 size={18} />
                </button>
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
                  className="flex-1 h-11 px-4 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-blue-500 disabled:opacity-50 text-sm"
                />
                {!appliedVoucher ? (
                  <button className="bg-slate-900 text-white px-5 rounded-xl text-sm font-bold disabled:opacity-50" onClick={() => handleApplyVoucher()} disabled={applying || !voucherCode.trim()}>
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-[100] flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-[11px] text-slate-500 font-medium">Tổng tiền</span>
          <span className="text-lg font-black text-blue-600 leading-tight">{finalTotal.toLocaleString()}đ</span>
        </div>
        <button 
          className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-md active:bg-blue-700"
          onClick={() => navigate('/checkout', { state: { items: cart.items, isBuyNow: false, appliedVoucher } })}
        >
          ĐẶT HÀNG ({cart.items.length})
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;