import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  MapPin, Truck, CreditCard, ShieldCheck, ChevronRight,
  CheckCircle2, Plus, Phone, Home, User, Wallet, Shield, Ticket
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
const PROVINCE_REGIONS = {
  // Miền Nam (Giao nhanh nhất nếu kho của bạn ở TP.HCM)
  SOUTH: ["Thành phố Hồ Chí Minh", "Bình Dương", "Đồng Nai", "Long An", "Bà Rịa - Vũng Tàu", "Tây Ninh", "Bình Phước", "Tiền Giang", "Bến Tre", "Trà Vinh", "Vĩnh Long", "Đồng Tháp", "An Giang", "Kiên Giang", "Cần Thơ", "Hậu Giang", "Sóc Trăng", "Bạc Liêu", "Cà Mau"],

  // Miền Trung
  CENTRAL: ["Đà Nẵng", "Quảng Nam", "Quảng Ngãi", "Bình Định", "Phú Yên", "Khánh Hòa", "Ninh Thuận", "Bình Thuận", "Kon Tum", "Gia Lai", "Đắk Lắk", "Đắk Nông", "Lâm Đồng", "Thừa Thiên Huế", "Quảng Trị", "Quảng Bình", "Hà Tĩnh", "Nghệ An", "Thanh Hóa"],

  // Miền Bắc
  NORTH: ["Hà Nội", "Hải Phòng", "Hải Dương", "Hưng Yên", "Bắc Ninh", "Bắc Giang", "Vĩnh Phúc", "Phú Thọ", "Quảng Ninh", "Thái Bình", "Nam Định", "Ninh Bình", "Hà Nam", "Hòa Bình", "Sơn La", "Điện Biên", "Lai Châu", "Lào Cai", "Yên Bái", "Hà Giang", "Tuyên Quang", "Cao Bằng", "Bắc Kạn", "Thái Nguyên", "Lạng Sơn"]
};

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
  const [myVouchers, setMyVouchers] = useState([]);
  const [showVoucherList, setShowVoucherList] = useState(false);

  // State Bảo hành
  const [selectedWarranty, setSelectedWarranty] = useState(warrantyOptions[0]);

  /* ================= FETCH DATA ================= */

  const fetchUserProfile = async (token) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const userRes = await axios.get("http://localhost:5000/api/users/profile", { headers });

      // ĐOẠN CODE BỊ THIẾU ĐỂ LƯU ĐỊA CHỈ:
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

    } catch (error) {
      // ✅ XỬ LÝ TOKEN HẾT HẠN
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        console.error("Lỗi tải profile:", error);
      }
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
        await fetchMyVouchers();

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

        // Pre-fill voucher from Cart if passed
        const passedVoucher = location.state?.appliedVoucher;
        if (passedVoucher) {
          setDiscountCode(passedVoucher.voucherCode);
          setDiscountAmount(passedVoucher.discountAmount);
          setAppliedVoucherCode(passedVoucher.voucherCode);
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
  // eslint-disable-next-line no-unused-vars
  const getEstimatedDeliveryDate = (province, shippingFee) => {
    if (!province) return "Vui lòng chọn địa chỉ";

    const today = new Date();
    let minDays = 2;
    let maxDays = 4;

    // Giả sử kho ở TP.HCM
    if (PROVINCE_REGIONS.SOUTH.includes(province)) {
      minDays = 1;
      maxDays = 2;
    } else if (PROVINCE_REGIONS.CENTRAL.includes(province)) {
      minDays = 3;
      maxDays = 4;
    } else if (PROVINCE_REGIONS.NORTH.includes(province)) {
      minDays = 3;
      maxDays = 5;
    }

    // Nếu là giao hàng hỏa tốc (phí 55k)
    if (shippingFee > 30000) {
      return "Giao trong ngày hôm nay (trước 18:00)";
    }

    const minDate = new Date(today);
    minDate.setDate(today.getDate() + minDays);

    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + maxDays);

    const options = { day: '2-digit', month: '2-digit' };
    return `Dự kiến nhận hàng: ${minDate.toLocaleDateString('vi-VN', options)} - ${maxDate.toLocaleDateString('vi-VN', options)}`;
  };
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

  const [appliedVoucherCode, setAppliedVoucherCode] = useState(null);

  const handleApplyVoucher = async (codeParam) => {
    const code = codeParam || discountCode.trim();
    if (!code) {
      toast.error("Vui lòng nhập mã giảm giá!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/vouchers/apply",
        { code, orderTotal: subTotal },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDiscountAmount(res.data.discountAmount);
      setAppliedVoucherCode(res.data.voucherCode);
      setDiscountCode(res.data.voucherCode);
      toast.success(res.data.message);
    } catch (error) {
      const msg = error.response?.data?.message || "Mã không hợp lệ!";
      toast.error(msg);
      setDiscountAmount(0);
      setAppliedVoucherCode(null);
    }
  };

  const handleRemoveVoucher = () => {
    setDiscountAmount(0);
    setAppliedVoucherCode(null);
    setDiscountCode("");
    toast.info("Đã hủy mã giảm giá");
  };

  const handleSubmit = async () => {
    if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.addressDetail) {
      toast.error("Vui lòng chọn hoặc thêm địa chỉ giao hàng!");
      return;
    }

    const isBuyNow = location.state?.isBuyNow || false;

    // Chuẩn hóa lại Payload để khớp 100% với Backend
    const orderPayload = {
      items: checkoutItems.map(item => ({
        productId: item.productId,
        variantId: item.variantId, // Bắt buộc phải có để trừ kho và lấy giá nhập
        name: item.name,
        image: item.image,
        color: item.color,
        storage: item.storage,
        quantity: item.quantity,
        price: item.price,
        // Không gửi importPrice từ đây (để Backend tự truy vấn cho bảo mật)
      })),
      shippingInfo,
      shippingFee,
      warrantyFee: selectedWarranty.price,
      warrantyType: selectedWarranty.name,
      paymentMethod,
      discountAmount,
      voucherCode: appliedVoucherCode || null,
      total: total, // Đổi từ totalAmount thành total cho khớp Model
      isBuyNow
    };

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // 1. Tạo đơn hàng
      const res = await axios.post("http://localhost:5000/api/orders/checkout", orderPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const createdOrder = res.data.order;

      // 2. Điều hướng sau khi tạo đơn thành công
      if (paymentMethod === "COD") {
        toast.success("Đặt hàng thành công!");
        navigate("/profile"); // Nên về trang đơn hàng của tôi để khách theo dõi
      } else {
        // NẾU LÀ ONLINE (VNPAY/MOMO)
        // Thông thường ở đây bạn sẽ gọi API lấy URL thanh toán
        // Hoặc chuyển sang trang Payment trung gian như bạn đã viết
        navigate("/payment", {
          state: {
            orderId: createdOrder._id,
            total: total, // Đồng bộ tên biến
            paymentMethod: paymentMethod
          }
        });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Lỗi khi tạo đơn hàng!";
      toast.error(errorMsg);
      console.error(error);
    } finally {
      setLoading(false);
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
            {location.state?.isBuyNow ? (
              <>
                <Link to="#" onClick={(e) => { e.preventDefault(); navigate(-1); }}>Sản phẩm</Link> <ChevronRight size={14} />
              </>
            ) : (
              <>
                <Link to="/cart">Giỏ hàng</Link> <ChevronRight size={14} />
              </>
            )}
            <span className="active">Thanh toán</span> <ChevronRight size={14} />
            <span>Hoàn tất</span>
          </div>
        </div>
      </header>

      <main className="checkout-container">
        <div className="checkout-left">

          {/* SECTION 1: ĐỊA CHỈ GIAO HÀNG */}
          <section className="checkout-section">
            <div className="section-header-flex">
              <h2 className="section-title"><MapPin size={20} /> Thông tin giao hàng</h2>
              {shippingInfo.province && (
                <div className="estimated-delivery-alert">
                  <CheckCircle2 size={16} color="#059669" />
                  <span>{getEstimatedDeliveryDate(shippingInfo.province, shippingFee)}</span>
                </div>
              )}
              <button className="btn-add-address-toggle" onClick={() => setShowAddressModal(true)}>
                <Plus size={16} /> Thêm địa chỉ mới
              </button>
            </div>

            {savedAddresses.length > 0 ? (
              <div className="saved-address-list">
                {savedAddresses.map(addr => (
                  <label key={addr._id} className={`address-card ${selectedAddressId === addr._id ? "active" : ""}`}>
                    <input type="radio" name="selectedAddress" checked={selectedAddressId === addr._id} onChange={() => handleSelectAddress(addr)} className="hidden-radio" />
                    <div className="address-card-header">
                      <div className="user-name">
                        <User size={16} /> <strong>{addr.fullName}</strong>
                        {addr.isDefault && <span className="badge-default">Mặc định</span>}
                      </div>
                      {selectedAddressId === addr._id && <CheckCircle2 size={20} className="check-icon" />}
                    </div>
                    <div className="address-card-body">
                      <p><Phone size={14} /> {addr.phone}</p>
                      <p><Home size={14} /> {addr.detail}, {addr.ward ? addr.ward + ", " : ""}{addr.district}, {addr.province}</p>
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
            <h2 className="section-title"><Truck size={20} /> Phương thức vận chuyển</h2>
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
            <h2 className="section-title"><Shield size={20} /> Gói bảo hành (Tùy chọn)</h2>
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
            <h2 className="section-title"><Wallet size={20} /> Phương thức thanh toán</h2>
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
                    <p className="variant-info">
                      SL: {item.quantity}
                      {(item.color || item.colorName) ? ` | ${item.color || item.colorName}` : ''}
                      {(item.storage && item.storage !== "N/A") ? ` | ${item.storage}` : ''}
                      {(!item.storage && item.size && item.size !== "Standard") ? ` | ${item.size}` : ''}
                    </p>
                  </div>
                  <div className="sum-price">{(item.price * item.quantity).toLocaleString()}đ</div>
                </div>
              ))}
            </div>

            <div className="voucher-section">
              <label>Mã giảm giá / Quà tặng</label>
              <div className="voucher-input-group">
                <input
                  type="text"
                  placeholder="NHẬP MÃ ƯU ĐÃI"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  disabled={!!appliedVoucherCode}
                />
                {appliedVoucherCode ? (
                  <button onClick={handleRemoveVoucher} className="btn-remove-voucher">Hủy mã</button>
                ) : (
                  <button onClick={handleApplyVoucher}>Áp dụng</button>
                )}
              </div>
              {appliedVoucherCode && (
                <p className="voucher-applied-msg">✅ Đã áp dụng mã: <strong>{appliedVoucherCode}</strong></p>
              )}

              {myVouchers.length > 0 && !appliedVoucherCode && (
                <div className="checkout-wallet-vouchers">
                  <button className="btn-show-wallet" onClick={() => setShowVoucherList(!showVoucherList)}>
                    <Ticket size={16} /> Mã giảm giá của bạn {showVoucherList ? '▲' : '▼'}
                  </button>
                  {showVoucherList && (
                    <div className="wallet-dropdown">
                      {myVouchers.map(v => (
                        <div key={v._id} className="wallet-voucher-item">
                          <div>
                            <strong>{v.code}</strong>
                            <span>{v.discountType === "percentage" ? `Giảm ${v.value}%` : `Giảm ${v.value.toLocaleString()}đ`}</span>
                            {v.minOrderValue > 0 && <span className="min-order">Đơn tối thiểu {v.minOrderValue.toLocaleString()}đ</span>}
                          </div>
                          <button onClick={() => { setShowVoucherList(false); handleApplyVoucher(v.code); }}>Dùng</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
              {paymentMethod === "COD" ? "ĐẶT HÀNG NGAY" : "TIẾN HÀNH THANH TOÁN"} <ChevronRight size={18} />
            </button>

            <div className="security-badges">
              <span><ShieldCheck size={14} /> Bảo mật 100%</span>
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