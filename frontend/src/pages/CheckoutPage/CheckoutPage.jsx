import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { 
  MapPin, Truck, CreditCard, ShieldCheck, ChevronRight, 
  CheckCircle2, Plus, Phone, Home, User, Wallet, Shield 
} from "lucide-react";
import axios from "axios";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import AddressModal from "../../components/Profile/AddressModal";
import "./CheckoutPage.css";
import { toast } from "sonner"; 

// --- CÁC GÓI BẢO HÀNH ---
const warrantyOptions = [
  { id: 'basic', name: 'Bảo hành cơ bản', duration: '6 tháng', price: 0, desc: 'Bảo hành sửa chữa phần cứng tiêu chuẩn' },
  { id: 'extended', name: 'Bảo hành mở rộng', duration: '12 tháng', price: 300000, desc: 'Gia hạn thêm 6 tháng bảo hành chính hãng' },
  { id: 'gold', name: 'Bảo hành Vàng', duration: '12 tháng', price: 500000, desc: 'Lỗi 1 đổi 1 trong 30 ngày đầu, bảo hành 12 tháng' },
  { id: 'diamond', name: 'Bảo hành Kim cương', duration: '24 tháng', price: 1000000, desc: 'Bảo hành rơi vỡ, vào nước trong 24 tháng' }
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [checkoutItems, setCheckoutItems] = useState([]);
  
  // State quản lý địa chỉ
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // State thông tin giao hàng (Form)
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "", phone: "", email: "", addressDetail: "", province: "", district: "", ward: "",
  });

  const [shippingFee, setShippingFee] = useState(30000); 
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);

  // State Bảo hành
  const [selectedWarranty, setSelectedWarranty] = useState(warrantyOptions[0]);

  /* ================= FETCH DATA ================= */
  const fetchUserProfile = async (token) => {
    const headers = { Authorization: `Bearer ${token}` };
    const userRes = await axios.get("http://localhost:5000/api/users/profile", { headers });
    const user = userRes.data;
    setCurrentUser(user);
    
    if (user.addresses && user.addresses.length > 0) {
      setSavedAddresses(user.addresses);
      if (!selectedAddressId) {
        const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
        handleSelectAddress(defaultAddr, user.email);
      }
    } else {
      setShowAddressModal(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để thanh toán!");
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };

        await fetchUserProfile(token);

        if (location.state?.isBuyNow) {
          setCheckoutItems(location.state.items);
        } else {
          const cartRes = await axios.get("http://localhost:5000/api/cart", { headers });
          if (!cartRes.data || cartRes.data.items.length === 0) {
            toast.error("Giỏ hàng trống!");
            navigate("/cart");
            return;
          }
          setCheckoutItems(cartRes.data.items);
        }
      } catch (error) {
        console.error("Lỗi tải trang thanh toán:", error);
        toast.error("Có lỗi xảy ra, vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, navigate]);

  /* ================= CALCULATIONS ================= */
  const subTotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // CỘNG DỒN TIỀN BẢO HÀNH VÀO TỔNG
  const total = subTotal + shippingFee + selectedWarranty.price - discountAmount;

  /* ================= HANDLERS ================= */
  const handleSelectAddress = (addr, emailParam = "") => {
    setSelectedAddressId(addr._id);
    setShippingInfo({
      fullName: addr.fullName, phone: addr.phone, email: emailParam || currentUser?.email || "", 
      addressDetail: addr.detail, province: addr.province, district: addr.district, ward: addr.ward || "",
    });
  };

  const handleSaveNewAddress = async (addressData) => {
    try {
      const token = localStorage.getItem("token");
      const tokenHeader = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post("http://localhost:5000/api/users/address", addressData, tokenHeader);
      toast.success("Thêm địa chỉ thành công!");
      setShowAddressModal(false);
      await fetchUserProfile(token);
    } catch (err) {
      toast.error("Lỗi lưu địa chỉ");
      console.error(err);
    }
  };

  const handleApplyVoucher = () => {
    if (discountCode === "TECHNOVA") {
      setDiscountAmount(200000);
      toast.success("Áp dụng mã thành công!");
    } else {
      toast.error("Mã không hợp lệ!");
    }
  };

  const handleSubmit = async () => {
    if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.addressDetail) {
      toast.error("Vui lòng chọn hoặc thêm địa chỉ giao hàng!");
      return;
    }

    const isBuyNow = location.state?.isBuyNow || false;

    const orderPayload = {
      items: checkoutItems,
      shippingInfo,
      shippingFee,
      warrantyFee: selectedWarranty.price,     // Gửi phí bảo hành
      warrantyType: selectedWarranty.name,     // Gửi tên gói bảo hành
      paymentMethod,
      discountAmount,
      totalAmount: total,
      isBuyNow
    };

    if (paymentMethod === "COD") {
      try {
        const token = localStorage.getItem("token");
        await axios.post("http://localhost:5000/api/orders/checkout", orderPayload, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        toast.success("Đặt hàng thành công!");
        navigate("/"); 
      } catch (error) {
        toast.error("Lỗi khi tạo đơn hàng COD!");
      }
    } else {
      navigate("/payment", {
        state: { orderData: orderPayload }
      });
    }
  };

  if (loading) return <div className="checkout-loading">Đang tải thông tin...</div>;

  return (
    <div className="checkout-page">
      <Header />
      <header className="checkout-header-wrapper">
        <div className="checkout-header">
          <Link to="/" className="checkout-logo">
            <div className="logo-icon"></div>
            <span>TechNova</span>
          </Link>
          <div className="checkout-steps">
            <Link to="/cart">Giỏ hàng</Link> <ChevronRight size={14}/>
            <span className="active">Thanh toán</span> <ChevronRight size={14}/>
            <span>Hoàn tất</span>
          </div>
        </div>
      </header>

      <main className="checkout-container">
        <div className="checkout-left">
          
          {/* SECTION 1: ĐỊA CHỈ GIAO HÀNG */}
          <section className="checkout-section">
            <div className="section-header-flex">
              <h2 className="section-title"><MapPin size={20}/> Thông tin giao hàng</h2>
              <button className="btn-add-address-toggle" onClick={() => setShowAddressModal(true)}>
                <Plus size={16}/> Thêm địa chỉ mới
              </button>
            </div>

            {savedAddresses.length > 0 ? (
              <div className="saved-address-list">
                {savedAddresses.map(addr => (
                  <label key={addr._id} className={`address-card ${selectedAddressId === addr._id ? "active" : ""}`}>
                    <input type="radio" name="selectedAddress" checked={selectedAddressId === addr._id} onChange={() => handleSelectAddress(addr)} className="hidden-radio" />
                    <div className="address-card-header">
                      <div className="user-name">
                        <User size={16}/> <strong>{addr.fullName}</strong>
                        {addr.isDefault && <span className="badge-default">Mặc định</span>}
                      </div>
                      {selectedAddressId === addr._id && <CheckCircle2 size={20} className="check-icon" />}
                    </div>
                    <div className="address-card-body">
                      <p><Phone size={14}/> {addr.phone}</p>
                      <p><Home size={14}/> {addr.detail}, {addr.ward ? addr.ward + ", " : ""}{addr.district}, {addr.province}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="empty-address-msg">
                Bạn chưa có địa chỉ giao hàng nào. Vui lòng bấm <strong>"Thêm địa chỉ mới"</strong> ở trên.
              </div>
            )}
          </section>

          {/* SECTION 2: VẬN CHUYỂN */}
          <section className="checkout-section">
            <h2 className="section-title"><Truck size={20}/> Phương thức vận chuyển</h2>
            <div className="shipping-methods">
              <label className={`radio-box ${shippingFee === 30000 ? 'active' : ''}`}>
                <div className="radio-left">
                  <input type="radio" name="shipping" checked={shippingFee === 30000} onChange={() => setShippingFee(30000)} />
                  <div className="radio-texts">
                    <h4>Giao hàng nhanh</h4>
                    <p>Dự kiến giao hàng: 2-3 ngày làm việc</p>
                  </div>
                </div>
                <span className="shipping-price">30.000đ</span>
              </label>

              <label className={`radio-box ${shippingFee === 55000 ? 'active' : ''}`}>
                <div className="radio-left">
                  <input type="radio" name="shipping" checked={shippingFee === 55000} onChange={() => setShippingFee(55000)} />
                  <div className="radio-texts">
                    <h4>Giao hàng Hỏa tốc</h4>
                    <p>Giao ngay trong vòng 2-4 giờ (Chỉ áp dụng nội thành)</p>
                  </div>
                </div>
                <span className="shipping-price">55.000đ</span>
              </label>
            </div>
          </section>

          {/* SECTION 3: GÓI BẢO HÀNH */}
          <section className="checkout-section">
            <h2 className="section-title"><Shield size={20}/> Gói bảo hành (Tùy chọn)</h2>
            <div className="shipping-methods">
              {warrantyOptions.map((warranty) => (
                <label key={warranty.id} className={`radio-box ${selectedWarranty.id === warranty.id ? 'active' : ''}`}>
                  <div className="radio-left">
                    <input 
                      type="radio" 
                      name="warranty" 
                      checked={selectedWarranty.id === warranty.id} 
                      onChange={() => setSelectedWarranty(warranty)} 
                    />
                    <div className="radio-texts">
                      <h4>{warranty.name} ({warranty.duration})</h4>
                      <p>{warranty.desc}</p>
                    </div>
                  </div>
                  <span className="shipping-price">
                    {warranty.price === 0 ? "Miễn phí" : `+${warranty.price.toLocaleString()}đ`}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* SECTION 4: THANH TOÁN */}
          <section className="checkout-section">
            <h2 className="section-title"><Wallet size={20}/> Phương thức thanh toán</h2>
            <div className="payment-grid">
              <label className={`radio-box ${paymentMethod === 'COD' ? 'active' : ''}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                <span className="pay-icon cod-icon">💵</span>
                <span>Thanh toán khi nhận hàng (COD)</span>
              </label>

              <label className={`radio-box ${paymentMethod === 'VNPAY' ? 'active' : ''}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'VNPAY'} onChange={() => setPaymentMethod('VNPAY')} />
                <span className="pay-icon">🏦</span>
                <span>Thanh toán qua VNPay</span>
              </label>

              <label className={`radio-box ${paymentMethod === 'MOMO' ? 'active' : ''}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'MOMO'} onChange={() => setPaymentMethod('MOMO')} />
                <span className="pay-icon">📱</span>
                <span>Thanh toán qua MoMo</span>
              </label>
            </div>
          </section>

        </div>

        {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
        <aside className="checkout-right">
          <div className="summary-card">
            <h3>Tóm tắt đơn hàng</h3>
            <div className="summary-items">
              {checkoutItems.map((item, idx) => (
                <div key={idx} className="summary-item">
                  <div className="sum-img"><img src={item.image} alt={item.name} /></div>
                  <div className="sum-info">
                    <h4>{item.name}</h4>
                    <p>SL: {item.quantity} {item.color ? `| ${item.color}` : ''} {item.storage ? `| ${item.storage}` : ''}</p>
                  </div>
                  <div className="sum-price">{(item.price * item.quantity).toLocaleString()}đ</div>
                </div>
              ))}
            </div>

            <div className="voucher-section">
              <label>Mã giảm giá / Quà tặng</label>
              <div className="voucher-input-group">
                <input type="text" placeholder="NHẬP MÃ ƯU ĐÃI" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} />
                <button onClick={handleApplyVoucher}>Áp dụng</button>
              </div>
            </div>

            <div className="summary-calculations">
              <div className="calc-row"><span>Tạm tính</span><span>{subTotal.toLocaleString()}đ</span></div>
              <div className="calc-row"><span>Phí vận chuyển</span><span>{shippingFee.toLocaleString()}đ</span></div>
              
              {/* Thêm dòng hiển thị phí bảo hành */}
              {selectedWarranty.price > 0 && (
                <div className="calc-row">
                  <span>{selectedWarranty.name}</span>
                  <span>{selectedWarranty.price.toLocaleString()}đ</span>
                </div>
              )}

              {discountAmount > 0 && <div className="calc-row discount-row"><span>Giảm giá</span><span>-{discountAmount.toLocaleString()}đ</span></div>}
              
              <div className="calc-row total-row">
                <span>Tổng cộng</span>
                <div className="total-price-wrap">
                  <span className="total-price">{total.toLocaleString()}đ</span>
                  <span className="vat-note">(Đã bao gồm VAT)</span>
                </div>
              </div>
            </div>

            {/* ĐỔI TEXT NÚT TÙY THEO PHƯƠNG THỨC THANH TOÁN */}
            <button className="btn-place-order" onClick={handleSubmit}>
              {paymentMethod === "COD" ? "ĐẶT HÀNG NGAY" : "TIẾN HÀNH THANH TOÁN"} <ChevronRight size={18}/>
            </button>

            <div className="security-badges">
              <span><ShieldCheck size={14}/> Bảo mật 100%</span>
              <span>✔️ Chính hãng 100%</span>
              <span>🔄 Đổi trả 30 ngày</span>
            </div>
          </div>
        </aside>
      </main>

      <Footer />

      <AddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSave={handleSaveNewAddress}
        initialData={null}
      />
    </div>
  );
};

export default CheckoutPage;