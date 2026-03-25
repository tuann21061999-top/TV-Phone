import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { toast } from "sonner";
import "./ContactPage.css";
import {
  MapPin, Phone, Mail, Send, Clock,
  MessageSquare, History, CheckCircle, Info, AlertCircle
} from "lucide-react";

function ContactPage() {
  const [activeTab, setActiveTab] = useState("form");
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Lấy token mỗi khi component render
  const token = localStorage.getItem("token");

  const fetchMyFeedbacks = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const res = await axios.get("http://localhost:5000/api/feedbacks/mine", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyFeedbacks(res.data);
    } catch (error) {
      console.error("Lỗi tải lịch sử:", error);
      toast.error("Không thể tải lịch sử phản hồi. Vui lòng thử lại!");
    } finally {
      setLoadingHistory(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === "history" && token) {
      fetchMyFeedbacks();
    }
  }, [activeTab, token, fetchMyFeedbacks]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setIsSubmitting(true);
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.post("http://localhost:5000/api/feedbacks", formData, config);
      toast.success("Gửi lời nhắn thành công. Chúng tôi sẽ sớm liên hệ!");
      setFormData({ name: "", email: "", subject: "", message: "" });

      if (token) {
        setActiveTab("history");
        fetchMyFeedbacks(); // Cập nhật lại list ngay lập tức
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi gửi lời nhắn");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case "new": return <span className="status-badge new"><Clock size={12} /> Chờ xử lý</span>;
      case "read": return <span className="status-badge read"><Info size={12} /> Đang xử lý</span>;
      case "resolved": return <span className="status-badge resolved"><CheckCircle size={12} /> Đã giải quyết</span>;
      default: return null;
    }
  };

  return (
    <div className="contact-page">
      <Header />

      <div className="contact-container">
        <div className="contact-header">
          <h1>Liên hệ với TechNova</h1>
          <p>Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn 24/7. Hãy gửi lời nhắn nếu bạn có bất kỳ thắc mắc nào.</p>
        </div>

        <div className="contact-layout">
          {/* ======================= CỘT TRÁI: FORM & LỊCH SỬ ======================= */}
          <div className="contact-left">

            {/* TAB ĐIỀU HƯỚNG */}
            <div className="contact-tabs">
              <button className={`tab-btn ${activeTab === "form" ? "active" : ""}`} onClick={() => setActiveTab("form")}>
                <MessageSquare size={18} /> Gửi tin nhắn mới
              </button>
              {token && (
                <button className={`tab-btn ${activeTab === "history" ? "active" : ""}`} onClick={() => setActiveTab("history")}>
                  <History size={18} /> Lịch sử hỗ trợ
                </button>
              )}
            </div>

            {/* NỘI DUNG TABS */}
            <div className="contact-content-area">

              {/* TAB 1: FORM */}
              {activeTab === "form" ? (
                <div className="contact-form-box fade-in">
                  <h2>Bạn cần hỗ trợ điều gì?</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Họ và tên</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="VD: Nguyễn Văn A" required />
                      </div>
                      <div className="form-group">
                        <label>Email liên hệ</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="name@example.com" required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Chủ đề (Vấn đề bạn gặp phải)</label>
                      <input type="text" name="subject" value={formData.subject} onChange={handleInputChange} placeholder="VD: Hỗ trợ bảo hành, Tư vấn mua hàng..." required />
                    </div>
                    <div className="form-group">
                      <label>Nội dung chi tiết</label>
                      <textarea rows="5" name="message" value={formData.message} onChange={handleInputChange} placeholder="Mô tả chi tiết vấn đề để chúng tôi hỗ trợ tốt nhất..." required />
                    </div>
                    <button type="submit" className="send-btn" disabled={isSubmitting}>
                      <Send size={18} /> {isSubmitting ? "Đang xử lý..." : "Gửi yêu cầu hỗ trợ"}
                    </button>
                  </form>
                </div>
              ) : (

                /* TAB 2: LỊCH SỬ PHẢN HỒI */
                <div className="contact-history-box fade-in">
                  <div className="history-header-title">
                    <h2>Lịch sử yêu cầu của bạn</h2>
                    <span className="history-count">Bạn có {myFeedbacks.length} yêu cầu</span>
                  </div>

                  {loadingHistory ? (
                    <p className="history-msg">Đang tải dữ liệu...</p>
                  ) : myFeedbacks.length === 0 ? (
                    <div className="history-empty">
                      <AlertCircle size={40} color="#CBD5E1" />
                      <p>Bạn chưa gửi yêu cầu hỗ trợ nào.</p>
                      <button onClick={() => setActiveTab("form")} className="btn-outline">Gửi yêu cầu ngay</button>
                    </div>
                  ) : (
                    <div className="history-list">
                      {myFeedbacks.map((fb) => (
                        /* Gắn thêm class dựa trên status để làm hiệu ứng Sáng/Tối */
                        <div key={fb._id} className={`history-card ${fb.status}`}>
                          <div className="hc-header">
                            <h4>{fb.subject}</h4>
                            {getStatusDisplay(fb.status)}
                          </div>
                          <span className="hc-date"><Clock size={12} /> {new Date(fb.createdAt).toLocaleString('vi-VN')}</span>

                          <div className="hc-message">
                            <strong>Nội dung gửi:</strong>
                            <p>{fb.message}</p>
                          </div>

                          {/* PHẢN HỒI TỪ ADMIN */}
                          {fb.adminNote ? (
                            <div className="hc-admin-reply">
                              <div className="reply-title"><CheckCircle size={14} /> TechNova phản hồi:</div>
                              <p>{fb.adminNote}</p>
                            </div>
                          ) : (
                            fb.status !== "resolved" && (
                              <div className="hc-admin-waiting">
                                <span>Đội ngũ CSKH đang xem xét và sẽ phản hồi sớm nhất...</span>
                              </div>
                            )
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ======================= CỘT PHẢI: THÔNG TIN & MAP ======================= */}
          <div className="contact-right">

            <div className="contact-cards-compact">
              <div className="card-item">
                <div className="icon-box"><MapPin size={20} color="#1D4ED8" /></div>
                <div>
                  <h3>Địa chỉ Showroom</h3>
                  <p>12 Nguyễn Văn Bảo, Gò Vấp, Hồ Chí Minh</p>
                </div>
              </div>
              <div className="card-item">
                <div className="icon-box"><Phone size={20} color="#1D4ED8" /></div>
                <div>
                  <h3>Hotline Hỗ Trợ</h3>
                  <p><strong>1900 1234 567</strong> (24/7)</p>
                </div>
              </div>
              <div className="card-item">
                <div className="icon-box"><Mail size={20} color="#1D4ED8" /></div>
                <div>
                  <h3>Email Liên Hệ</h3>
                  <p>support@technova.vn</p>
                </div>
              </div>
            </div>

            <div className="map-wrapper shadow-box">
              <h3>Vị trí trên bản đồ</h3>
              <div className="map-container" style={{ width: "100%", height: "300px", borderRadius: "12px", overflow: "hidden", marginTop: "16px" }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.858237841926!2d106.68427047460395!3d10.822158889329432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174deb3ef536f31%3A0x8b7bb8b7c956157b!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBDw7RuZyBuZ2hp4buHcCBUUC5IQ00!5e0!3m2!1svi!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Map IUH"
                ></iframe>
              </div>
            </div>

          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ContactPage;