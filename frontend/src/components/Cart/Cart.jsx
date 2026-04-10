import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, ShieldCheck, Truck, Ticket, ChevronRight, Link } from "lucide-react";
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

  const fetchOptions = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, fetchOptions);
        const data = await res.json();
        setCart(data);
      } catch (err) {
        console.error("Lỗi lấy giỏ hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchMyVouchers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      toast.error(error.response?.data?.message || "Mã giảm giá không hợp lệ");
      setAppliedVoucher(null);
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
  };

  const handleUpdateQuantity = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/update`, {
        ...fetchOptions,
        method: "PUT",
        body: JSON.stringify({ itemId, quantity: newQty }),
      });
      const data = await res.json();
      setCart(data);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Không thể cập nhật số lượng");
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm("Bạn có muốn xóa sản phẩm này?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/remove/${itemId}`, {
        ...fetchOptions,
        method: "DELETE",
      });
      const data = await res.json();
      setCart(data);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Lỗi khi xóa sản phẩm");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7fa] text-slate-500 font-medium">
        Đang tải giỏ hàng...
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-[#f4f7fa] min-h-screen font-sans flex flex-col">
        <Header />
        <main className="block max-w-[1200px] mx-auto py-10 px-5 flex-1 w-full pb-10">
          <div className="my-10 mx-auto mb-[60px] flex flex-col items-center text-center">
            <ShoppingCart size={80} strokeWidth={1} className="text-slate-300" />
            <h2 className="mt-5 text-2xl font-bold text-slate-800">Giỏ hàng của bạn đang trống</h2>
            <p className="text-slate-500 mb-[30px]">Hãy xem qua các sản phẩm gợi ý dành riêng cho bạn bên dưới nhé!</p>
            <button
              className="bg-transparent border-none text-blue-600 font-bold text-base cursor-pointer hover:underline"
              onClick={() => navigate("/")}
            >
              Quay lại trang chủ
            </button>
          </div>
          <AIRecommend />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#f4f7fa] min-h-screen font-sans flex flex-col">
      <Header />
      <main className="max-w-[1200px] mx-auto py-10 px-5 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-[30px] flex-1 w-full">

        {/* === PHẦN TRÁI: DANH SÁCH SẢN PHẨM === */}
        <div>
          <div className="flex items-baseline gap-[15px] mb-[25px]">
            <h1 className="text-[32px] font-extrabold text-[#1a1a1a] m-0">Giỏ hàng của bạn</h1>
            <span className="text-[#6b7280] text-[16px]">{cart.items.length} sản phẩm</span>
          </div>

          {/* Tiêu đề cột (Chia tỷ lệ CHUẨN như CSS cũ: 2/5 - 1/5 - 1/5 - 1/5) */}
          <div className="hidden lg:flex px-2.5 pb-[15px] text-[#6b7280] text-[14px] font-semibold border-b border-[#e5e7eb]">
            <div className="w-[40%]">Sản phẩm</div>
            <div className="w-[20%] text-left">Đơn giá</div>
            <div className="w-[20%] text-left">Số lượng</div>
            <div className="w-[20%] text-left">Thành tiền</div>
          </div>

          {/* Danh sách Item */}
          <div className="flex flex-col mt-[15px] gap-4">
            {cart.items.map((item) => (
              <div key={item._id} className="flex flex-col lg:flex-row items-start lg:items-center bg-white p-5 rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] w-full gap-4 lg:gap-0">

                {/* 1. Thông tin SP (40%) */}
                <div className="w-full lg:w-[40%] flex gap-5 items-center">
                  <div className="w-[80px] h-[80px] shrink-0 bg-[#f9fafb] rounded-lg">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-slate-900 mb-1 leading-tight">{item.name}</h3>
                    <p className="text-[13px] text-[#6b7280] mb-1">{item.color} | {item.storage}</p>
                    <span className="text-[12px] text-[#10b981] font-semibold">Còn hàng</span>
                  </div>
                </div>

                {/* 2. Đơn giá (20%) */}
                <div className="w-full lg:w-[20%] font-bold text-[16px] text-[#111827] hidden lg:block">
                  {item.price.toLocaleString()} đ
                </div>

                {/* 3. Số lượng & Xóa */}
                <div className="flex flex-col items-center justify-center gap-2">
                  {/* Bỏ w-[100px], dùng inline-flex để nền xám tự động ôm khít nội dung */}
                  <div className="inline-flex items-center bg-[#f3f4f6] rounded-lg p-1 h-[36px]">
                    <button
                      className="text-[#4b5563] w-8 h-full flex items-center justify-center hover:text-[#1d72ed] bg-transparent border-none cursor-pointer rounded-md"
                      onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-bold text-[14px] text-[#111827]">
                      {item.quantity}
                    </span>
                    <button
                      className="text-[#4b5563] w-8 h-full flex items-center justify-center hover:text-[#1d72ed] bg-transparent border-none cursor-pointer rounded-md"
                      onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    className="flex items-center gap-1 text-[12px] text-[#9ca3af] hover:text-[#ef4444] transition-colors bg-transparent border-none p-0 cursor-pointer mt-1"
                    onClick={() => handleRemoveItem(item._id)}
                  >
                    <Trash2 size={14} /> Xóa
                  </button>
                </div>
                {/* 4. Tổng tiền của Item (20%) */}
                <div className="w-full lg:w-[20%] font-bold text-[16px] text-[#111827] text-left">
                  <span className="lg:hidden text-[#6b7280] font-normal text-sm mr-2">Thành tiền:</span>
                  {(item.price * item.quantity).toLocaleString()} đ
                </div>
              </div>
            ))}
          </div>

          <button
            className="mt-[30px] bg-transparent border-none text-[#1d72ed] font-bold flex items-center gap-2 cursor-pointer hover:underline"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} /> Tiếp tục mua sắm
          </button>
        </div>

        {/* === PHẦN PHẢI: THANH TOÁN (TÓM TẮT ĐƠN) === */}
        <aside>
          <div className="bg-white p-[30px] rounded-2xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] lg:sticky lg:top-[100px]">
            <h3 className="text-[20px] font-extrabold mb-[25px] text-[#1a1a1a]">Tóm tắt đơn hàng</h3>

            <div className="mb-5">
              <div className="flex justify-between mb-3 text-[#4b5563] font-medium text-[15px]">
                <span>Tạm tính</span>
                <span>{cart.total.toLocaleString()} đ</span>
              </div>
              <div className="flex justify-between mb-3 text-[#4b5563] font-medium text-[15px]">
                <span>Phí vận chuyển</span>
                <span>0 đ</span>
              </div>
              {appliedVoucher && (
                <div className="flex justify-between mb-3 text-[#10b981] font-semibold text-[15px] animate-[fadeIn_0.3s_ease-in]">
                  <span>Giảm giá ({appliedVoucher.voucherCode})</span>
                  <span>-{appliedVoucher.discountAmount.toLocaleString()} đ</span>
                </div>
              )}
            </div>

            {/* Khung nhập Voucher */}
            <div className="flex gap-[10px] my-5 pb-5 border-b border-[#f3f4f6]">
              <input
                type="text"
                placeholder="Mã giảm giá"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                disabled={appliedVoucher !== null}
                className="flex-1 py-2.5 px-[15px] border border-[#e5e7eb] rounded-lg bg-[#f9fafb] outline-none focus:border-[#1d72ed] disabled:opacity-60"
              />
              {!appliedVoucher ? (
                <button
                  className="bg-transparent border border-[#1d72ed] text-[#1d72ed] px-[15px] rounded-lg font-bold text-[13px] cursor-pointer hover:bg-[#eff6ff] disabled:opacity-50"
                  onClick={() => handleApplyVoucher()}
                  disabled={applying || !voucherCode.trim()}
                >
                  {applying ? "..." : "Áp dụng"}
                </button>
              ) : (
                <button
                  className="bg-transparent border border-red-500 text-red-500 px-[15px] rounded-lg font-bold text-[13px] cursor-pointer hover:bg-red-50"
                  onClick={handleRemoveVoucher}
                >
                  Hủy
                </button>
              )}
            </div>

            {/* Nút hiển thị kho Voucher */}
            {myVouchers.length > 0 && !appliedVoucher && (
              <div className="relative mt-2.5">
                <button
                  className="flex items-center justify-center gap-1.5 bg-white border border-dashed border-[#1d72ed] text-[#1d72ed] py-2 px-3 rounded-lg text-[13px] font-semibold w-full cursor-pointer hover:bg-[#eff6ff]"
                  onClick={() => setShowVoucherList(!showVoucherList)}
                >
                  <Ticket size={16} /> Mã giảm giá của bạn {showVoucherList ? '▲' : '▼'}
                </button>

                {/* Dropdown danh sách Voucher */}
                {showVoucherList && (
                  <div className="absolute top-full left-0 w-full bg-white border border-[#e5e7eb] rounded-lg shadow-md mt-[5px] max-h-[200px] overflow-y-auto z-10">
                    {myVouchers.map(v => (
                      <div key={v._id} className="flex justify-between items-center p-[10px_15px] border-b border-[#f3f4f6] last:border-none hover:bg-slate-50">
                        <div>
                          <strong className="block text-[14px] text-[#111827]">{v.code}</strong>
                          <span className="text-[12px] text-[#6b7280]">
                            {v.discountType === "percentage" ? `Giảm ${v.value}%` : `Giảm ${v.value.toLocaleString()}đ`}
                          </span>
                        </div>
                        <button
                          className="bg-[#10b981] text-white border-none py-[5px] px-[10px] rounded-md text-[12px] font-semibold cursor-pointer"
                          onClick={() => handleApplyVoucher(v.code)}
                        >
                          Dùng
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tổng cộng */}
            <div className="border-t border-[#f3f4f6] pt-5 mt-5 flex justify-between items-center text-[#111827] text-[24px] font-extrabold">
              <span className="text-[16px]">Tổng cộng</span>
              <span>{Math.max(0, cart.total - (appliedVoucher ? appliedVoucher.discountAmount : 0)).toLocaleString()} đ</span>
            </div>

            {/* Nút đặt hàng */}
            <button
              className="w-full bg-[#1d72ed] hover:bg-[#1557b7] text-white border-none py-[18px] px-6 rounded-xl font-bold text-[16px] cursor-pointer transition-colors mt-2.5"
              onClick={() => navigate('/checkout', {
                state: {
                  items: cart.items,
                  isBuyNow: false,
                  appliedVoucher
                }
              })}
            >
              ĐẶT HÀNG
            </button>

            {/* Trust Badges */}
            <div className="mt-[25px] flex flex-wrap gap-[10px] text-[#9ca3af]">
              <ShieldCheck size={20} />
              <Truck size={20} />
              <span className="text-[12px] leading-[1.5] text-[#6b7280] w-full">
                Phí vận chuyển & thuế được tính khi thanh toán. Cần hỗ trợ? <Link to="/contact" className="text-[#1d72ed] hover:underline">Liên hệ ngay</Link>
              </span>
            </div>
          </div>
        </aside>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;