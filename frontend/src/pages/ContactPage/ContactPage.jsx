import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { toast } from "sonner";
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
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/feedbacks/mine`, {
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
      await axios.post(`${import.meta.env.VITE_API_URL}/api/feedbacks`, formData, config);
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
    case "new":
      return (
        <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-blue-100 text-blue-700 whitespace-nowrap">
          <Clock size={12} /> Chờ xử lý
        </span>
      );
    case "read":
      return (
        <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-600 whitespace-nowrap">
          <Info size={12} /> Đang xử lý
        </span>
      );
    case "resolved":
      return (
        <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-600 whitespace-nowrap">
          <CheckCircle size={12} /> Đã giải quyết
        </span>
      );
    default:
      return null;
  }
};

  return (
  <div className="bg-slate-50 min-h-screen">
    <Header />

    <div className="w-full max-w-[1400px] mx-auto my-10 px-4 md:px-10">

      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Liên hệ với TechNova</h1>
        <p className="text-slate-500 text-base max-w-[600px] mx-auto">
          Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn 24/7. Hãy gửi lời nhắn nếu bạn có bất kỳ thắc mắc nào.
        </p>
      </div>

      {/* LAYOUT 2 CỘT */}
      <div className="flex flex-col lg:flex-row gap-10 items-start">

        {/* CỘT TRÁI */}
        <div className="flex-[6] w-full bg-white rounded-2xl shadow-sm overflow-hidden">

          {/* TABS */}
          <div className="flex border-b border-slate-200 bg-slate-100">
            <button
              onClick={() => setActiveTab("form")}
              className={`flex-1 flex items-center justify-center gap-2 px-5 py-4 text-sm font-semibold cursor-pointer border-none transition-all border-b-[3px]
                ${activeTab === "form"
                  ? "text-blue-700 bg-white border-b-blue-700"
                  : "text-slate-500 bg-transparent border-b-transparent hover:bg-slate-200"
                }`}
            >
              <MessageSquare size={18} /> Gửi tin nhắn mới
            </button>
            {token && (
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 flex items-center justify-center gap-2 px-5 py-4 text-sm font-semibold cursor-pointer border-none transition-all border-b-[3px]
                  ${activeTab === "history"
                    ? "text-blue-700 bg-white border-b-blue-700"
                    : "text-slate-500 bg-transparent border-b-transparent hover:bg-slate-200"
                  }`}
              >
                <History size={18} /> Lịch sử hỗ trợ
              </button>
            )}
          </div>

          {/* NỘI DUNG TABS */}
          <div className="p-8">

            {/* TAB 1: FORM */}
            {activeTab === "form" && (
              <div className="animate-[fadeIn_0.4s_ease]">
                <h2 className="text-xl font-bold text-slate-800 mt-0 mb-6">Bạn cần hỗ trợ điều gì?</h2>
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col md:flex-row gap-5 mb-5">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-slate-600 mb-2">Họ và tên</label>
                      <input
                        type="text" name="name" value={formData.name} onChange={handleInputChange}
                        placeholder="VD: Nguyễn Văn A" required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 outline-none text-sm transition-all focus:border-blue-700 focus:bg-white focus:shadow-[0_0_0_3px_rgba(29,78,216,0.1)] box-border"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-slate-600 mb-2">Email liên hệ</label>
                      <input
                        type="email" name="email" value={formData.email} onChange={handleInputChange}
                        placeholder="name@example.com" required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 outline-none text-sm transition-all focus:border-blue-700 focus:bg-white focus:shadow-[0_0_0_3px_rgba(29,78,216,0.1)] box-border"
                      />
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-slate-600 mb-2">Chủ đề (Vấn đề bạn gặp phải)</label>
                    <input
                      type="text" name="subject" value={formData.subject} onChange={handleInputChange}
                      placeholder="VD: Hỗ trợ bảo hành, Tư vấn mua hàng..." required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 outline-none text-sm transition-all focus:border-blue-700 focus:bg-white focus:shadow-[0_0_0_3px_rgba(29,78,216,0.1)] box-border"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-slate-600 mb-2">Nội dung chi tiết</label>
                    <textarea
                      rows="5" name="message" value={formData.message} onChange={handleInputChange}
                      placeholder="Mô tả chi tiết vấn đề để chúng tôi hỗ trợ tốt nhất..." required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 outline-none text-sm transition-all focus:border-blue-700 focus:bg-white focus:shadow-[0_0_0_3px_rgba(29,78,216,0.1)] box-border resize-y"
                    />
                  </div>

                  <button
                    type="submit" disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 hover:-translate-y-0.5 text-white border-none py-3.5 px-6 rounded-lg text-sm font-semibold cursor-pointer transition-all disabled:opacity-60"
                  >
                    <Send size={18} /> {isSubmitting ? "Đang xử lý..." : "Gửi yêu cầu hỗ trợ"}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: LỊCH SỬ */}
            {activeTab === "history" && (
              <div className="animate-[fadeIn_0.4s_ease]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800 m-0">Lịch sử yêu cầu của bạn</h2>
                  <span className="text-[13px] font-semibold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
                    Bạn có {myFeedbacks.length} yêu cầu
                  </span>
                </div>

                {loadingHistory ? (
                  <p className="text-center text-slate-400 py-10">Đang tải dữ liệu...</p>
                ) : myFeedbacks.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    <AlertCircle size={40} color="#CBD5E1" className="mx-auto" />
                    <p className="mt-4 mb-4 text-sm">Bạn chưa gửi yêu cầu hỗ trợ nào.</p>
                    <button
                      onClick={() => setActiveTab("form")}
                      className="border border-blue-700 text-blue-700 bg-transparent px-5 py-2.5 rounded-lg font-semibold cursor-pointer hover:bg-blue-50 transition-colors text-sm"
                    >
                      Gửi yêu cầu ngay
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5 max-h-[600px] overflow-y-auto pr-2">
                    {myFeedbacks.map((fb) => (
                      <div
                        key={fb._id}
                        className={`p-5 rounded-xl transition-all border-l-4
                          ${fb.status === "resolved"
                            ? "bg-slate-50 border border-dashed border-slate-300 border-l-emerald-500 opacity-70 hover:opacity-90"
                            : "bg-white border border-slate-200 border-l-blue-500 shadow-[0_10px_25px_rgba(59,130,246,0.08)]"
                          }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="m-0 text-base text-slate-900 leading-snug">{fb.subject}</h4>
                          {getStatusDisplay(fb.status)}
                        </div>

                        <span className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                          <Clock size={12} /> {new Date(fb.createdAt).toLocaleString('vi-VN')}
                        </span>

                        <div className="text-sm text-slate-600 bg-slate-100 p-3 rounded-lg">
                          <strong>Nội dung gửi:</strong>
                          <p className="m-0 mt-1">{fb.message}</p>
                        </div>

                        {fb.adminNote ? (
                          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mb-1.5">
                              <CheckCircle size={14} /> TechNova phản hồi:
                            </div>
                            <p className="m-0 text-sm text-emerald-900 leading-relaxed">{fb.adminNote}</p>
                          </div>
                        ) : (
                          fb.status !== "resolved" && (
                            <div className="mt-3 text-xs text-amber-500 italic">
                              Đội ngũ CSKH đang xem xét và sẽ phản hồi sớm nhất...
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

        {/* CỘT PHẢI */}
        <div className="flex-[4] w-full flex flex-col gap-6">

          {/* THÔNG TIN LIÊN HỆ */}
          <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-sm">
            {[
              { icon: <MapPin size={20} color="#1D4ED8" />, title: "Địa chỉ Showroom", content: "12 Nguyễn Văn Bảo, Gò Vấp, Hồ Chí Minh" },
              { icon: <Phone size={20} color="#1D4ED8" />, title: "Hotline Hỗ Trợ",   content: <><strong>1900 1234 567</strong> (24/7)</> },
              { icon: <Mail size={20} color="#1D4ED8" />,  title: "Email Liên Hệ",    content: "support@technova.vn" },
            ].map(({ icon, title, content }) => (
              <div key={title} className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-xl flex items-center justify-center shrink-0">
                  {icon}
                </div>
                <div>
                  <h3 className="m-0 mb-1 text-sm font-semibold text-slate-500">{title}</h3>
                  <p className="m-0 text-sm font-medium text-slate-900">{content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* BẢN ĐỒ */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="m-0 mb-4 text-lg font-bold text-slate-900">Vị trí trên bản đồ</h3>
            <div className="w-full h-[300px] rounded-xl overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.858237841926!2d106.68427047460395!3d10.822158889329432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174deb3ef536f31%3A0x8b7bb8b7c956157b!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBDw7RuZyBuZ2hp4buHcCBUUC5IQ00!5e0!3m2!1svi!2s"
                width="100%" height="100%"
                style={{ border: 0 }}
                allowFullScreen="" loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Map IUH"
              />
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