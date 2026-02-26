import React, { useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./Cart.css";
import {
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  Truck
} from "lucide-react";

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "iPhone 14 Pro Max",
      variant: "Midnight Green | 256GB",
      status: "Còn hàng",
      price: 10990000,
      quantity: 1
    },
    {
      id: 2,
      name: "MagSafe Silicone Case",
      variant: "Succulent",
      status: "",
      price: 490000,
      quantity: 1
    }
  ]);

  const updateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="cart-page">
      <Header />

      <div className="container">
        <div className="cart-header">
          <h1>Giỏ hàng của bạn</h1>
          <span>{cartItems.length} sản phẩm</span>
        </div>

        <div className="cart-layout">
          {/* LEFT - Product List */}
          <div className="cart-products">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-info">
                  <div className="cart-image"></div>

                  <div className="cart-details">
                    <h3>{item.name}</h3>
                    <p>{item.variant}</p>
                    {item.status && (
                      <span className="status">{item.status}</span>
                    )}
                  </div>
                </div>

                <div className="cart-price">
                  {item.price.toLocaleString("vi-VN")}₫
                </div>

                <div className="cart-quantity">
                  <button onClick={() => updateQuantity(item.id, -1)}>
                    <Minus size={14} />
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)}>
                    <Plus size={14} />
                  </button>
                </div>

                <div className="cart-total">
                  {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                </div>

                <button
                  className="remove-btn"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button className="continue-btn">
              <ArrowLeft size={16} /> Tiếp tục mua sắm
            </button>
          </div>

          {/* RIGHT - Summary */}
          <div className="cart-summary">
            <h2>Tóm tắt đơn hàng</h2>

            <div className="summary-row">
              <span>Tạm tính</span>
              <span>{subtotal.toLocaleString("vi-VN")}₫</span>
            </div>

            <div className="summary-row">
              <span>Phí vận chuyển</span>
              <span className="free">Miễn phí</span>
            </div>

            <div className="summary-total">
              <span>Tổng cộng</span>
              <span>{subtotal.toLocaleString("vi-VN")}₫</span>
            </div>

            <button className="checkout-btn">
              <CreditCard size={18} /> Thanh toán ngay
            </button>

            <div className="secure-info">
              <ShieldCheck size={16} />
              <Truck size={16} />
              <span>Thanh toán an toàn & giao hàng nhanh</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;