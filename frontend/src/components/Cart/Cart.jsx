import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, ShieldCheck, Truck } from "lucide-react";
import Header from "../Header/Header"; // Giữ lại Header nếu bạn cần
import Footer from "../Footer/Footer"; // Giữ lại Footer nếu bạn cần
import "./Cart.css";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOptions = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

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

  useEffect(() => {
    fetchCart();
  }, []);

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
      <div className="cart-empty-state">
        <ShoppingCart size={80} strokeWidth={1} />
        <h2>Giỏ hàng của bạn đang trống</h2>
        <button className="btn-return" onClick={() => navigate(-1)}>Quay lại cửa hàng</button>
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
                <span>{cart.total.toLocaleString()} $</span>
              </div>
              <div className="sum-row">
                <span>Phí vận chuyển</span>
                <span>0,00 $</span>
              </div>
              <div className="sum-row">
                <span>Thuế dự kiến</span>
                <span>{(cart.total * 0.08).toLocaleString()} $</span>
              </div>
            </div>

            <div className="promo-code-box">
              <input type="text" placeholder="Mã giảm giá" />
              <button>Áp dụng</button>
            </div>

            <div className="sum-row grand-total">
              <span>Tổng cộng</span>
              <span>{(cart.total * 1.08).toLocaleString()} $</span>
            </div>

            <button 
              className="btn-primary-checkout" 
              onClick={() => navigate('/checkout', { 
                state: { 
                  items: cart.items, 
                  isBuyNow: false 
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