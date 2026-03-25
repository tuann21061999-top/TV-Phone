import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle, ArrowRight, Home, Truck } from "lucide-react";
import axios from "axios";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./ReviewOrder.css";

const ReviewOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const { data } = await axios.get(`http://localhost:5000/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate]);

  if (loading) return <div style={{textAlign: "center", padding: "100px"}}>Đang tải thông tin đơn hàng...</div>;
  if (!order) return <div style={{textAlign: "center", padding: "100px"}}>Không tìm thấy đơn hàng!</div>;

  return (
    <div className="review-order-page">
      <Header />
      <div className="review-container">
        <div className="success-header">
          <CheckCircle size={64} color="#10B981" />
          <h1>Đặt hàng thành công!</h1>
          <p>Cảm ơn bạn đã mua hàng tại TechNova. Đơn hàng của bạn đang chờ xác nhận.</p>
        </div>

        <div className="order-summary-card">
          <div className="order-summary-header">
            <h3>Mã đơn hàng: #{order._id.substring(0, 8).toUpperCase()}</h3>
            <span className="order-date">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
          
          <div className="order-details-grid">
            <div className="detail-section">
              <h4><Home size={18} /> Thông tin nhận hàng</h4>
              <p><strong>{order.shippingInfo?.fullName}</strong></p>
              <p>{order.shippingInfo?.phone}</p>
              <p>{order.shippingInfo?.addressDetail}, {order.shippingInfo?.ward}, {order.shippingInfo?.district}, {order.shippingInfo?.province}</p>
            </div>
            
            <div className="detail-section">
              <h4><Truck size={18} /> Phương thức thanh toán</h4>
              <p>{order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : order.paymentMethod}</p>
              <p className="payment-status">{order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
            </div>
          </div>

          <div className="ordered-items">
            <h4>Danh sách sản phẩm</h4>
            {order.items?.map(item => (
              <div key={item._id} className="item-row">
                <img src={item.image} alt={item.name} />
                <div className="item-info">
                  <p className="item-name">{item.name}</p>
                  <p className="item-variant">{item.color} {item.storage ? `| ${item.storage}` : ''}</p>
                  <p>Số lượng: {item.quantity}</p>
                </div>
                <div className="item-price">{(item.price * item.quantity).toLocaleString()}đ</div>
              </div>
            ))}
          </div>

          <div className="order-totals">
            <div className="total-row"><span>Tạm tính:</span><span>{order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}đ</span></div>
            <div className="total-row"><span>Phí vận chuyển:</span><span>{order.shippingFee ? order.shippingFee.toLocaleString() : "Miễn phí"}</span></div>
            {order.warrantyFee > 0 && <div className="total-row"><span>Phí bảo hành:</span><span>{order.warrantyFee.toLocaleString()}đ</span></div>}
            {order.discountAmount > 0 && <div className="total-row discount"><span>Giảm giá:</span><span>-{order.discountAmount.toLocaleString()}đ</span></div>}
            <div className="total-row grand-total"><span>Tổng cộng:</span><span>{order.total?.toLocaleString() || 0}đ</span></div>
          </div>
        </div>

        <div className="action-buttons">
          <Link to="/" className="btn-secondary">Tiếp tục mua sắm</Link>
          <Link to="/profile?tab=orders" className="btn-primary">Xem đơn hàng của tôi <ArrowRight size={18}/></Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ReviewOrder;
