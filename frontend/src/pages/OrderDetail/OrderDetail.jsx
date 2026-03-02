import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ShoppingCart, CheckCircle, Package, Truck, Check, 
  MapPin, Headphones, Printer, ChevronLeft, Copy
} from "lucide-react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { toast } from "sonner";
import "./OrderDetail.css";

const OrderDetail = () => {
  const { id } = useParams(); // Lấy ID đơn hàng từ URL
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await axios.get(`http://localhost:5000/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrder(res.data);
      } catch (error) {
        toast.error("Không thể tải chi tiết đơn hàng");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id, navigate]);

  // Hàm xác định bước hiện tại trong thanh tiến trình (Stepper)
  const getStepIndex = (status) => {
    switch (status) {
      case "waiting_approval":
      case "pending": return 1;
      case "paid": return 2;
      case "preparing": return 3;
      case "shipping": return 4;
      case "done": return 5;
      case "returned":
      case "cancelled": return 5; // Vẫn cho đi đến cuối nhưng đổi màu đỏ
      default: return 1;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "waiting_approval": return "Chờ xác nhận (COD)";
      case "pending": return "Chờ thanh toán";
      case "paid": return "Đã thanh toán";
      case "preparing": return "Đang đóng gói";
      case "shipping": return "ĐANG GIAO";
      case "done": return "THÀNH CÔNG";
      case "cancelled": return "ĐÃ HỦY";
      case "returned": return "TRẢ HÀNG";
      default: return "Không rõ";
    }
  };

  if (loading) return <div className="loading-screen">Đang tải thông tin đơn hàng...</div>;
  if (!order) return <div className="error-screen">Không tìm thấy đơn hàng!</div>;

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === "cancelled" || order.status === "returned";

  // Mockup dữ liệu lịch sử vận chuyển (Vì DB hiện tại chưa lưu mảng lịch sử)
  const orderDate = new Date(order.createdAt).toLocaleString('vi-VN');
  
  return (
    <div className="order-detail-page">
      <Header />

      <main className="od-container">
        {/* Nút quay lại */}
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} /> Quay lại danh sách đơn hàng
        </button>

        {/* Header Đơn hàng */}
        <div className="od-header-section">
          <div className="od-header-left">
            <h2>Đơn hàng #{order._id.slice(-8).toUpperCase()}</h2>
            <span className={`status-badge status-${order.status}`}>
              {getStatusText(order.status)}
            </span>
            <p className="od-date-text">Đặt ngày {new Date(order.createdAt).toLocaleDateString('vi-VN')} • Dự kiến giao: Sau 2-3 ngày</p>
          </div>
          <div className="od-header-actions">
            <button className="btn-outline"><Headphones size={16}/> Liên hệ hỗ trợ</button>
            <button className="btn-outline"><Printer size={16}/> In hóa đơn</button>
          </div>
        </div>

        {/* Thanh Tiến Trình (Stepper) */}
        <div className="od-stepper-container">
          <div className="stepper-track">
            {/* Thanh màu xanh chạy theo phần trăm */}
            <div 
              className={`stepper-progress ${isCancelled ? 'cancelled' : ''}`} 
              style={{ width: `${(currentStep - 1) * 25}%` }}
            ></div>
          </div>
          
          <div className="stepper-steps">
            <div className={`step ${currentStep >= 1 ? 'active' : ''} ${isCancelled ? 'error' : ''}`}>
              <div className="step-icon"><ShoppingCart size={20}/></div>
              <p>Đã đặt</p>
              <span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''} ${isCancelled ? 'error' : ''}`}>
              <div className="step-icon"><CheckCircle size={20}/></div>
              <p>Đã xác nhận</p>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''} ${isCancelled ? 'error' : ''}`}>
              <div className="step-icon"><Package size={20}/></div>
              <p>Đang đóng gói</p>
            </div>
            <div className={`step ${currentStep >= 4 ? 'active' : ''} ${isCancelled ? 'error' : ''}`}>
              <div className="step-icon"><Truck size={20}/></div>
              <p>Đang giao</p>
            </div>
            <div className={`step ${currentStep >= 5 ? 'active' : ''} ${isCancelled ? 'error' : ''}`}>
              <div className="step-icon"><Check size={20}/></div>
              <p>{isCancelled ? (order.status === 'cancelled' ? 'Đã hủy' : 'Trả hàng') : 'Thành công'}</p>
            </div>
          </div>
        </div>

        {/* Khung nội dung 2 cột */}
        <div className="od-grid">
          
          {/* CỘT TRÁI: Bản đồ & Lịch sử */}
          <div className="od-left-col">
            <div className="map-placeholder">
              <div className="map-badge">VỊ TRÍ HIỆN TẠI</div>
              <p>Trung tâm phân phối khu vực</p>
              {/* Fake image bản đồ cho giống thiết kế */}
              <div className="fake-map-bg">
                 <div className="map-pin"><MapPin size={24} fill="#2563eb" color="white" /></div>
              </div>
            </div>

            <div className="od-card">
              <h3>Lịch sử vận chuyển</h3>
              <div className="timeline">
                
                {/* Dựng giả lập timeline dựa theo trạng thái */}
                {currentStep >= 4 && (
                  <div className="timeline-item active">
                    <div className="tl-dot"></div>
                    <div className="tl-content">
                      <strong>Đang trên đường giao tới bạn.</strong>
                      <p>Đơn hàng đã rời kho phân phối và đang được Shipper giao.</p>
                    </div>
                  </div>
                )}

                {currentStep >= 3 && (
                  <div className="timeline-item">
                    <div className="tl-dot"></div>
                    <div className="tl-content">
                      <strong>Đã bàn giao cho đơn vị vận chuyển.</strong>
                      <p>Đơn hàng đã được đóng gói xong.</p>
                    </div>
                  </div>
                )}

                <div className="timeline-item">
                  <div className="tl-dot"></div>
                  <div className="tl-content">
                    <strong>Đơn hàng đã được tạo thành công.</strong>
                    <p>{orderDate}</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Chi tiết & Tóm tắt */}
          <div className="od-right-col">
            
            {/* Chi tiết sản phẩm */}
            <div className="od-card">
              <h3>Chi tiết đơn hàng</h3>
              <div className="od-product-list">
                {order.items.map((item, idx) => (
                  <div key={idx} className="od-product-item">
                    <img src={item.image} alt={item.name} />
                    <div className="od-product-info">
                      <h4>{item.name}</h4>
                      <p>Phân loại: {item.color} {item.storage ? `| ${item.storage}` : ''}</p>
                      <p>SL: {item.quantity}</p>
                      <strong className="od-price">{(item.price * item.quantity).toLocaleString()}đ</strong>
                    </div>
                  </div>
                ))}
              </div>

              <div className="od-summary-lines">
                <div className="line">
                  <span>Tạm tính</span>
                  <span>{order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}đ</span>
                </div>
                <div className="line">
                  <span>Phí vận chuyển</span>
                  <span>{order.shippingFee === 0 ? "Miễn phí" : `${order.shippingFee.toLocaleString()}đ`}</span>
                </div>
                {order.warrantyFee > 0 && (
                  <div className="line">
                    <span>Gói bảo hành ({order.warrantyType})</span>
                    <span>{order.warrantyFee.toLocaleString()}đ</span>
                  </div>
                )}
                {order.discountAmount > 0 && (
                  <div className="line discount">
                    <span>Giảm giá</span>
                    <span>-{order.discountAmount.toLocaleString()}đ</span>
                  </div>
                )}
                <div className="line total">
                  <span>Tổng thanh toán</span>
                  <span className="total-price">{order.total.toLocaleString()}đ</span>
                </div>
              </div>
            </div>

            {/* Địa chỉ nhận hàng */}
            <div className="od-card address-card">
              <h3><MapPin size={18} color="#2563eb" /> ĐỊA CHỈ NHẬN HÀNG</h3>
              <div className="address-content">
                <strong>{order.shippingInfo.fullName}</strong>
                <p>{order.shippingInfo.phone}</p>
                <p>{order.shippingInfo.addressDetail}, {order.shippingInfo.ward}, {order.shippingInfo.district}, {order.shippingInfo.province}</p>
              </div>
            </div>

            {/* Banner Khuyến mãi giống hình */}
            <div className="od-promo-banner">
              <p className="promo-title">ƯU ĐÃI DÀNH CHO BẠN</p>
              <h4>Giảm 10% cho đơn hàng tiếp theo</h4>
              <div className="promo-code-box">
                <span>TECHNOVA10</span>
                <button><Copy size={14}/> Sao chép</button>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderDetail;