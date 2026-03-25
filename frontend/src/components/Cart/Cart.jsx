import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, ShieldCheck, Truck, Ticket } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import AIRecommend from "../AIRecommend/AIRecommend";
import "./Cart.css";

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
        const res = await fetch("http://localhost:5000/api/cart", fetchOptions);
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
        const { data } = await axios.get("http://localhost:5000/api/vouchers/my-vouchers", {
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
        const { data } = await axios.post("http://localhost:5000/api/vouchers/apply", {
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
      const res = await fetch("http://localhost:5000/api/cart/update", {
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
      const res = await fetch(`http://localhost:5000/api/cart/remove/${itemId}`, {
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

  if (loading) return <div className="cart-loader-container">Đang tải giỏ hàng...</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-page-wrapper">
        <Header />
        <main className="cart-main-content" style={{ display: 'block', paddingBottom: '40px' }}>
          <div className="cart-empty-state" style={{ margin: '40px auto 60px' }}>
            <ShoppingCart size={80} strokeWidth={1} color="#cbd5e1" />
            <h2 style={{ marginTop: '20px' }}>Giỏ hàng của bạn đang trống</h2>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>Hãy xem qua các sản phẩm gợi ý dành riêng cho bạn bên dưới nhé!</p>
            <button className="btn-return" onClick={() => navigate("/")}>Quay lại trang chủ</button>
          </div>
          <AIRecommend />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper">
      <Header />
      <main className="cart-main-content">
        <div className="cart-left-section">
          <div className="cart-title-area">
            <h1>Giỏ hàng của bạn</h1>
            <span className="cart-count">{cart.items.length} sản phẩm</span>
          </div>

          <div className="cart-table-header">
            <span>Sản phẩm</span>
            <span>Đơn giá</span>
            <span>Số lượng</span>
            <span>Thành tiền</span>
          </div>

          <div className="cart-items-list">
            {cart.items.map((item) => (
              <div key={item._id} className="cart-item-card">
                <div className="item-main-info">
                  <div className="item-thumbnail">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="item-text">
                    <h3>{item.name}</h3>
                    <p className="item-specs">{item.color} | {item.storage}</p>
                    <span className="stock-status">Còn hàng</span>
                  </div>
                </div>

                <div className="item-unit-price">
                  {item.price.toLocaleString()} $
                </div>

                <div className="item-qty-selector">
                  <div className="qty-wrapper">
                    <button onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}><Minus size={14} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}><Plus size={14} /></button>
                  </div>
                  <button className="item-delete-link" onClick={() => handleRemoveItem(item._id)}>
                    <Trash2 size={14} /> Xóa
                  </button>
                </div>

                <div className="item-subtotal">
                  {(item.price * item.quantity).toLocaleString()} $
                </div>
              </div>
            ))}
          </div>

          <button className="back-to-shop" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Tiếp tục mua sắm
          </button>
        </div>

        <aside className="cart-right-section">
          <div className="summary-card">
            <h3>Tóm tắt đơn hàng</h3>
            <div className="summary-details">
              <div className="sum-row">
                <span>Tạm tính</span>
                <span>{cart.total.toLocaleString()} đ</span>
              </div>
              <div className="sum-row">
                <span>Phí vận chuyển</span>
                <span>0 đ</span>
              </div>
              {appliedVoucher && (
                <div className="sum-row discount-row" style={{ color: '#10b981', fontWeight: 600 }}>
                  <span>Giảm giá ({appliedVoucher.voucherCode})</span>
                  <span>-{appliedVoucher.discountAmount.toLocaleString()} đ</span>
                </div>
              )}
            </div>

            <div className="voucher-section-wrapper">
              <div className="promo-code-box">
                <input 
                  type="text" 
                  placeholder="Mã giảm giá" 
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  disabled={appliedVoucher !== null}
                />
                {!appliedVoucher ? (
                  <button onClick={() => handleApplyVoucher()} disabled={applying}>
                    {applying ? "..." : "Áp dụng"}
                  </button>
                ) : (
                  <button onClick={handleRemoveVoucher} style={{ color: 'red', borderColor: 'red' }}>Hủy</button>
                )}
              </div>

              {myVouchers.length > 0 && !appliedVoucher && (
                <div className="wallet-vouchers">
                  <button className="btn-show-vouchers" onClick={() => setShowVoucherList(!showVoucherList)}>
                    <Ticket size={16} /> Mã giảm giá của bạn {showVoucherList ? '▲' : '▼'}
                  </button>
                  {showVoucherList && (
                    <div className="vouchers-dropdown">
                      {myVouchers.map(v => (
                        <div key={v._id} className="voucher-item-mini">
                          <div className="voucher-info-mini">
                            <strong>{v.code}</strong>
                            <span>{v.discountType === "percentage" ? `Giảm ${v.value}%` : `Giảm ${v.value.toLocaleString()}đ`}</span>
                          </div>
                          <button onClick={() => handleApplyVoucher(v.code)}>Dùng</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="sum-row grand-total">
              <span>Tổng cộng</span>
              <span>{Math.max(0, cart.total - (appliedVoucher ? appliedVoucher.discountAmount : 0)).toLocaleString()} đ</span>
            </div>

            <button 
              className="btn-primary-checkout" 
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
            <div className="trust-badges">
              <ShieldCheck size={20} />
              <Truck size={20} />
              <span className="trust-text">Phí vận chuyển & thuế được tính khi thanh toán. Cần hỗ trợ? <a href="#">Liên hệ ngay</a></span>
            </div>
          </div>
        </aside>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;