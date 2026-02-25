import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

function Cart() {
  const navigate = useNavigate();
  
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "iPhone 14 Pro Max",
      color: "Midnight Green",
      storage: "256GB",
      price: 1099.0,
      quantity: 1,
      image: "https://via.placeholder.com/100x100?text=iPhone14Pro",
      inStock: true,
    },
    {
      id: 2,
      name: "MagSafe Silicone Case",
      color: "Green",
      price: 49.0,
      quantity: 1,
      image: "https://via.placeholder.com/100x100?text=Case",
      inStock: true,
    },
    {
      id: 3,
      name: "20W USB-C Power Adapter",
      color: "Trắng",
      price: 19.0,
      quantity: 1,
      image: "https://via.placeholder.com/100x100?text=Charger",
      inStock: true,
    },
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0; // Free shipping
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  const applyDiscount = () => {
    // TODO: Apply discount code
  };

  return (
    <div className="cart-page">
      <Header />

      <div className="cart-container">
        <h1>Giỏ hàng của bạn</h1>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <h2>Giỏ hàng trống</h2>
            <p>Bạn chưa thêm sản phẩm nào vào giỏ hàng</p>
            <button onClick={() => navigate("/")} className="continue-btn">
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="cart-content">
            {/* Cart Items */}
            <div className="cart-items-section">
              <h2>3 sản phẩm</h2>

              <div className="items-list">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image} alt={item.name} />

                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <p className="item-variant">
                        {item.color} {item.storage && `| ${item.storage}`}
                      </p>
                      {!item.inStock && <p className="out-of-stock">Hết hàng</p>}
                    </div>

                    <div className="item-price">${item.price.toFixed(2)}</div>

                    <div className="quantity-control">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, parseInt(e.target.value) || 1)
                        }
                      />
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>

                    <div className="item-total">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item.id)}
                      title="Xóa"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={() => navigate("/phones")} className="continue-shopping">
                ← Tiếp tục mua sắm
              </button>
            </div>

            {/* Order Summary */}
            <div className="order-summary">
              <h2>Tóm tắt đơn hàng</h2>

              <div className="summary-row">
                <span>Tạm tính</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span className="free">Miễn phí</span>
              </div>

              <div className="summary-row">
                <span>Thuế dự kiến</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <div className="discount-section">
                <input
                  type="text"
                  placeholder="Mã giảm giá"
                  className="discount-input"
                />
                <button onClick={applyDiscount} className="apply-btn">
                  Áp dụng
                </button>
              </div>

              <div className="summary-total">
                <span>Tổng cộng</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div className="benefits">
                <div>📦 Giao hàng miễn phí</div>
                <div>🛡 Thanh toán an toàn</div>
                <div>🔄 Đổi trả trong 30 ngày</div>
              </div>

              <button className="checkout-btn">💳 Tiến hành thanh toán</button>

              <div className="payment-methods">
                <p>Chúng tôi chấp nhận:</p>
                <div className="methods">
                  <span title="Credit Card">💳</span>
                  <span title="Debit Card">🏦</span>
                  <span title="E-wallet">📱</span>
                  <span title="Bank Transfer">📊</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Cart;
