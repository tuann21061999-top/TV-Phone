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

  const hasFetchedRef = React.useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      if (hasFetchedRef.current) return;
      hasFetchedRef.current = true;

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
    // Không thêm location vào deps để tránh chạy lại lúc AnimatePresence exit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= CALCULATIONS ================= */
  const subTotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // CỘNG DỒN TIỀN BẢO HÀNH VÀO TỔNG
  const total = subTotal + shippingFee + selectedWarranty.price - discountAmount;

  /* ================= HANDLERS ================= */
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
        navigate("/review-order/" + createdOrder._id);
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

  if (loading) return (
  <div className="flex justify-center items-center h-screen text-lg text-blue-600">
    Đang tải thông tin...
  </div>
);

return (
  <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
    <Header />

    {/* CHECKOUT HEADER */}
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-10 py-4 flex justify-between items-center flex-wrap gap-3">
        <Link to="/" className="flex items-center gap-2.5 no-underline text-xl font-extrabold text-blue-600">
          <div className="w-7 h-7 bg-blue-600 rounded-md" />
          <span>TechNova</span>
        </Link>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          {location.state?.isBuyNow ? (
            <>
              <Link to="#" onClick={(e) => { e.preventDefault(); navigate(-1); }} className="text-blue-600 no-underline">Sản phẩm</Link>
              <ChevronRight size={14} />
            </>
          ) : (
            <>
              <Link to="/cart" className="text-blue-600 no-underline">Giỏ hàng</Link>
              <ChevronRight size={14} />
            </>
          )}
          <span className="text-slate-800 font-semibold">Thanh toán</span>
          <ChevronRight size={14} />
          <span>Hoàn tất</span>
        </div>
      </div>
    </header>

    {/* MAIN: 1 cột mobile → 2 cột từ lg */}
    <main className="w-full max-w-[1400px] mx-auto mt-8 px-4 md:px-10 pb-10 grid grid-cols-1 lg:grid-cols-[1.7fr_1.3fr] gap-8 items-start">

      {/* CỘT TRÁI */}
      <div>

        {/* SECTION 1: ĐỊA CHỈ */}
        <section className="bg-white rounded-xl p-6 mb-5 shadow-sm border border-slate-100">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
            <h2 className="flex items-center gap-2.5 text-lg font-bold text-slate-900 m-0 [&>svg]:text-blue-600">
              <MapPin size={20} /> Thông tin giao hàng
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              {shippingInfo.province && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-2 rounded-lg text-sm text-green-800 font-medium">
                  <CheckCircle2 size={16} color="#059669" />
                  <span className="italic">{getEstimatedDeliveryDate(shippingInfo.province, shippingFee)}</span>
                </div>
              )}
              <button
                onClick={() => setShowAddressModal(true)}
                className="flex items-center gap-1.5 bg-transparent border-none text-blue-600 font-semibold text-sm cursor-pointer px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
              >
                <Plus size={16} /> Thêm địa chỉ mới
              </button>
            </div>
          </div>

          {savedAddresses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedAddresses.map(addr => (
                <label
                  key={addr._id}
                  className={`block border-[1.5px] rounded-xl p-4 cursor-pointer bg-white transition-all relative
                    ${selectedAddressId === addr._id
                      ? "border-blue-600 bg-slate-50 shadow-[0_4px_12px_rgba(37,99,235,0.1)]"
                      : "border-slate-200 hover:border-blue-300 hover:shadow-[0_4px_12px_rgba(37,99,235,0.05)]"
                    }`}
                >
                  <input type="radio" name="selectedAddress" checked={selectedAddressId === addr._id} onChange={() => handleSelectAddress(addr)} className="hidden" />
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 text-slate-800 text-[15px]">
                      <User size={16} />
                      <strong>{addr.fullName}</strong>
                      {addr.isDefault && (
                        <span className="bg-blue-100 text-blue-800 text-[11px] px-2 py-0.5 rounded-full font-semibold">Mặc định</span>
                      )}
                    </div>
                    {selectedAddressId === addr._id && <CheckCircle2 size={20} className="text-blue-600" />}
                  </div>
                  <div className="space-y-2">
                    <p className="flex items-start gap-2 text-sm text-slate-500 m-0 leading-relaxed">
                      <Phone size={14} className="text-slate-400 shrink-0 mt-0.5" /> {addr.phone}
                    </p>
                    <p className="flex items-start gap-2 text-sm text-slate-500 m-0 leading-relaxed">
                      <Home size={14} className="text-slate-400 shrink-0 mt-0.5" />
                      {addr.detail}, {addr.ward ? addr.ward + ", " : ""}{addr.district}, {addr.province}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500 py-4">
              Bạn chưa có địa chỉ giao hàng nào. Vui lòng bấm <strong>"Thêm địa chỉ mới"</strong> ở trên.
            </div>
          )}
        </section>

        {/* SECTION 2: VẬN CHUYỂN */}
        <section className="bg-white rounded-xl p-6 mb-5 shadow-sm border border-slate-100">
          <h2 className="flex items-center gap-2.5 text-lg font-bold text-slate-900 mb-5 [&>svg]:text-blue-600">
            <Truck size={20} /> Phương thức vận chuyển
          </h2>
          <div className="space-y-3">
            {[
              { fee: 30000, title: "Giao hàng nhanh",   desc: "Dự kiến giao hàng: 2-3 ngày làm việc",                   label: "30.000đ" },
              { fee: 55000, title: "Giao hàng Hỏa tốc", desc: "Giao ngay trong vòng 2-4 giờ (Chỉ áp dụng nội thành)", label: "55.000đ" },
            ].map(({ fee, title, desc, label }) => (
              <label key={fee} className={`flex items-center justify-between px-4 py-4 border rounded-lg cursor-pointer transition-all
                ${shippingFee === fee ? "border-blue-600 bg-blue-50" : "border-slate-300 hover:bg-slate-50"}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="shipping" checked={shippingFee === fee} onChange={() => setShippingFee(fee)} className="w-[18px] h-[18px] accent-blue-600 cursor-pointer" />
                  <div>
                    <h4 className="text-sm font-semibold m-0 mb-1">{title}</h4>
                    <p className="text-xs text-slate-500 m-0">{desc}</p>
                  </div>
                </div>
                <span className="font-bold text-blue-600 shrink-0 ml-3">{label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* SECTION 3: BẢO HÀNH */}
        <section className="bg-white rounded-xl p-6 mb-5 shadow-sm border border-slate-100">
          <h2 className="flex items-center gap-2.5 text-lg font-bold text-slate-900 mb-5 [&>svg]:text-blue-600">
            <Shield size={20} /> Gói bảo hành (Tùy chọn)
          </h2>
          <div className="space-y-3">
            {warrantyOptions.map((warranty) => (
              <label key={warranty.id} className={`flex items-center justify-between px-4 py-4 border rounded-lg cursor-pointer transition-all
                ${selectedWarranty.id === warranty.id ? "border-blue-600 bg-blue-50" : "border-slate-300 hover:bg-slate-50"}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="warranty" checked={selectedWarranty.id === warranty.id} onChange={() => setSelectedWarranty(warranty)} className="w-[18px] h-[18px] accent-blue-600 cursor-pointer" />
                  <div>
                    <h4 className="text-sm font-semibold m-0 mb-1">{warranty.name} ({warranty.duration})</h4>
                    <p className="text-xs text-slate-500 m-0">{warranty.desc}</p>
                  </div>
                </div>
                <span className="font-bold text-blue-600 shrink-0 ml-3">
                  {warranty.price === 0 ? "Miễn phí" : `+${warranty.price.toLocaleString()}đ`}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* SECTION 4: THANH TOÁN */}
        <section className="bg-white rounded-xl p-6 mb-5 shadow-sm border border-slate-100">
          <h2 className="flex items-center gap-2.5 text-lg font-bold text-slate-900 mb-5 [&>svg]:text-blue-600">
            <Wallet size={20} /> Phương thức thanh toán
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { method: "COD",   emoji: "💵", label: "Thanh toán khi nhận hàng (COD)" },
              { method: "VNPAY", emoji: "🏦", label: "Thanh toán qua VNPay" },
              { method: "MOMO",  emoji: "📱", label: "Thanh toán qua MoMo" },
            ].map(({ method, emoji, label }) => (
              <label key={method} className={`flex items-center gap-3 px-4 py-4 border rounded-lg cursor-pointer transition-all
                ${paymentMethod === method ? "border-blue-600 bg-blue-50" : "border-slate-300 hover:bg-slate-50"}`}>
                <input type="radio" name="payment" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="accent-blue-600" />
                <span className="text-xl">{emoji}</span>
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </div>
        </section>
      </div>

      {/* CỘT PHẢI: TÓM TẮT — sticky từ lg trở lên */}
      <aside className="lg:sticky lg:top-[90px]">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-5 pb-4 border-b border-slate-200">Tóm tắt đơn hàng</h3>

          {/* ITEMS */}
          <div className="max-h-[300px] overflow-y-auto mb-6 space-y-4">
            {checkoutItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-[60px] h-[60px] bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-semibold m-0 mb-1 line-clamp-2">{item.name}</h4>
                  <p className="text-xs text-slate-500 m-0">
                    SL: {item.quantity}
                    {(item.color || item.colorName) ? ` | ${item.color || item.colorName}` : ''}
                    {(item.storage && item.storage !== "N/A") ? ` | ${item.storage}` : ''}
                    {(!item.storage && item.size && item.size !== "Standard") ? ` | ${item.size}` : ''}
                  </p>
                </div>
                <div className="text-sm font-bold text-slate-900 shrink-0">{(item.price * item.quantity).toLocaleString()}đ</div>
              </div>
            ))}
          </div>

          {/* VOUCHER */}
          <div className="mb-6">
            <label className="text-[13px] font-semibold block mb-2">Mã giảm giá / Quà tặng</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="NHẬP MÃ ƯU ĐÃI"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                disabled={!!appliedVoucherCode}
                className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg outline-none text-sm disabled:bg-slate-100 disabled:text-slate-400 focus:border-blue-400 transition-colors"
              />
              {appliedVoucherCode ? (
                <button onClick={handleRemoveVoucher} className="px-4 bg-red-50 text-red-500 border-none rounded-lg font-semibold cursor-pointer hover:bg-red-100 transition-colors text-sm">
                  Hủy mã
                </button>
              ) : (
                <button onClick={handleApplyVoucher} className="px-4 bg-blue-50 text-blue-600 border-none rounded-lg font-semibold cursor-pointer hover:bg-blue-100 transition-colors text-sm">
                  Áp dụng
                </button>
              )}
            </div>

            {appliedVoucherCode && (
              <p className="text-[13px] text-green-600 font-medium mb-3">
                ✅ Đã áp dụng mã: <strong>{appliedVoucherCode}</strong>
              </p>
            )}

            {myVouchers.length > 0 && !appliedVoucherCode && (
              <div className="relative">
                <button
                  onClick={() => setShowVoucherList(!showVoucherList)}
                  className="flex items-center justify-center gap-1.5 w-full bg-white border border-dashed border-blue-600 text-blue-600 px-3 py-2 rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  <Ticket size={16} /> Mã giảm giá của bạn {showVoucherList ? '▲' : '▼'}
                </button>
                {showVoucherList && (
                  <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-lg shadow-md mt-1 max-h-[200px] overflow-y-auto z-10">
                    {myVouchers.map(v => (
                      <div key={v._id} className="flex justify-between items-center px-4 py-2.5 border-b border-slate-100 last:border-none">
                        <div>
                          <strong className="block text-sm text-slate-900">{v.code}</strong>
                          <span className="block text-xs text-slate-500">
                            {v.discountType === "percentage" ? `Giảm ${v.value}%` : `Giảm ${v.value.toLocaleString()}đ`}
                          </span>
                          {v.minOrderValue > 0 && (
                            <span className="text-[11px] text-slate-400">Đơn tối thiểu {v.minOrderValue.toLocaleString()}đ</span>
                          )}
                        </div>
                        <button
                          onClick={() => { setShowVoucherList(false); handleApplyVoucher(v.code); }}
                          className="bg-emerald-500 text-white border-none px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer shrink-0 ml-3"
                        >
                          Dùng
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* TÍNH TIỀN */}
          <div className="border-t border-slate-200 pt-4 mb-6 space-y-3">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Tạm tính</span><span>{subTotal.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500">
              <span>Phí vận chuyển</span><span>{shippingFee.toLocaleString()}đ</span>
            </div>
            {selectedWarranty.price > 0 && (
              <div className="flex justify-between text-sm text-slate-500">
                <span>{selectedWarranty.name}</span><span>{selectedWarranty.price.toLocaleString()}đ</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Giảm giá</span><span>-{discountAmount.toLocaleString()}đ</span>
              </div>
            )}
            <div className="flex justify-between items-start border-t border-dashed border-slate-300 pt-4 mt-2">
              <span className="font-bold text-slate-900 text-base">Tổng cộng</span>
              <div className="text-right">
                <span className="block text-2xl font-extrabold text-blue-600 mb-1">{total.toLocaleString()}đ</span>
                <span className="text-[11px] text-slate-500">(Đã bao gồm VAT)</span>
              </div>
            </div>
          </div>

          {/* NÚT ĐẶT HÀNG */}
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none py-4 rounded-lg text-base font-bold cursor-pointer flex items-center justify-center gap-2 transition-colors"
          >
            {paymentMethod === "COD" ? "ĐẶT HÀNG NGAY" : "TIẾN HÀNH THANH TOÁN"} <ChevronRight size={18} />
          </button>

          {/* SECURITY BADGES */}
          <div className="flex justify-between mt-5 text-[11px] text-slate-500 flex-wrap gap-2">
            <span className="flex items-center gap-1"><ShieldCheck size={14} /> Bảo mật 100%</span>
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