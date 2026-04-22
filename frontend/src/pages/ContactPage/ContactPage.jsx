import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  History,
  Info,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
} from "lucide-react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import GlobalArticle from "../../components/GlobalArticle/GlobalArticle";

const QUICK_SUBJECTS = [
  "Tư vấn mua hàng",
  "Hỗ trợ bảo hành",
  "Vấn đề thanh toán",
  "Khiếu nại dịch vụ",
  "Hỗ trợ tài khoản",
];

function ContactPage() {
  const [activeTab, setActiveTab] = useState("form");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const token = localStorage.getItem("token");

  const fetchMyFeedbacks = useCallback(async () => {
    if (!token) return;

    try {
      setLoadingHistory(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/feedbacks/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyFeedbacks(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Lỗi tải lịch sử phản hồi:", error);
      toast.error("Không thể tải lịch sử phản hồi. Vui lòng thử lại.");
    } finally {
      setLoadingHistory(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchMyFeedbacks();
    }
  }, [token, fetchMyFeedbacks]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuickSubject = (subject) => {
    setFormData((prev) => ({ ...prev, subject }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    setIsSubmitting(true);

    try {
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      await axios.post(`${import.meta.env.VITE_API_URL}/api/feedbacks`, formData, config);

      toast.success("Yêu cầu đã được gửi thành công. VTNEXIS sẽ phản hồi sớm.");
      setFormData({ name: "", email: "", subject: "", message: "" });

      if (token) {
        setActiveTab("history");
        fetchMyFeedbacks();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi gửi yêu cầu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case "new":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
            <Clock size={12} /> Chờ xử lý
          </span>
        );
      case "read":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
            <Info size={12} /> Đang xử lý
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
            <CheckCircle size={12} /> Đã giải quyết
          </span>
        );
      default:
        return null;
    }
  };

  const resolvedCount = useMemo(
    () => myFeedbacks.filter((item) => item.status === "resolved").length,
    [myFeedbacks]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-blue-50/70 text-slate-900">
      <Header />

      <main className="mx-auto w-full max-w-[1440px] px-4 pb-12 pt-6 md:px-10 md:pt-9">
        <section className="mb-8 overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-[0_24px_50px_-36px_rgba(37,99,235,0.35)]">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-6 md:p-8">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-500">
                VTNEXIS SUPPORT HUB
              </p>
              <h1 className="m-0 text-3xl font-extrabold leading-tight text-slate-900 md:text-5xl">
                Liên hệ đội ngũ chăm sóc khách hàng
              </h1>
              <p className="mb-0 mt-3 max-w-[680px] text-sm leading-relaxed text-slate-600 md:text-[15px]">
                Gửi yêu cầu hỗ trợ, theo dõi tiến độ phản hồi và nhận trợ giúp từ VTNEXIS theo cách nhanh nhất.
                Chúng tôi luôn ưu tiên xử lý minh bạch và đúng thời gian cam kết.
              </p>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  Hỗ trợ 24/7
                </span>
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  Phản hồi ban đầu trong 24h
                </span>
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  Theo dõi trạng thái trực tiếp
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-blue-100 bg-blue-50/70 p-6 md:p-8 lg:border-l lg:border-t-0">
              <div className="rounded-2xl border border-blue-200 bg-white px-4 py-3">
                <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-500">Yêu cầu của bạn</p>
                <p className="m-0 mt-1 text-2xl font-bold text-slate-900">{myFeedbacks.length}</p>
              </div>
              <div className="rounded-2xl border border-blue-200 bg-white px-4 py-3">
                <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-500">Đã xử lý</p>
                <p className="m-0 mt-1 text-2xl font-bold text-slate-900">{resolvedCount}</p>
              </div>
              <div className="rounded-2xl border border-blue-200 bg-blue-600 px-4 py-3 text-white">
                <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-100">Cam kết</p>
                <p className="m-0 mt-1 text-sm font-semibold">Ưu tiên xử lý theo mức độ khẩn cấp</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1.35fr_1.05fr]">
          <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
            <div className="border-b border-blue-100 bg-blue-50/70 p-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("form")}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                    activeTab === "form"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-500 hover:bg-white/70"
                  }`}
                >
                  <MessageSquare size={17} /> Gửi yêu cầu mới
                </button>

                {token && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("history")}
                    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                      activeTab === "history"
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-slate-500 hover:bg-white/70"
                    }`}
                  >
                    <History size={17} /> Lịch sử hỗ trợ
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 md:p-8">
              {activeTab === "form" && (
                <div>
                  <div className="mb-6">
                    <h2 className="m-0 text-xl font-bold text-slate-900">Mô tả vấn đề của bạn</h2>
                    <p className="mb-0 mt-1 text-sm text-slate-500">
                      Điền đầy đủ thông tin để đội ngũ VTNEXIS phản hồi chính xác hơn.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-600">Họ và tên</span>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="VD: Nguyễn Văn A"
                          required
                          className="h-11 w-full rounded-xl border border-blue-100 bg-blue-50/50 px-3.5 text-sm outline-none transition-colors focus:border-blue-400 focus:bg-white"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-600">Email liên hệ</span>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="name@example.com"
                          required
                          className="h-11 w-full rounded-xl border border-blue-100 bg-blue-50/50 px-3.5 text-sm outline-none transition-colors focus:border-blue-400 focus:bg-white"
                        />
                      </label>
                    </div>

                    <div>
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-600">Chủ đề</span>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder="VD: Hỗ trợ bảo hành, Tư vấn mua hàng..."
                          required
                          className="h-11 w-full rounded-xl border border-blue-100 bg-blue-50/50 px-3.5 text-sm outline-none transition-colors focus:border-blue-400 focus:bg-white"
                        />
                      </label>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {QUICK_SUBJECTS.map((subject) => (
                          <button
                            key={subject}
                            type="button"
                            onClick={() => handleQuickSubject(subject)}
                            className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50"
                          >
                            {subject}
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-600">Nội dung chi tiết</span>
                      <textarea
                        rows="6"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Mô tả chi tiết vấn đề để chúng tôi hỗ trợ tốt nhất..."
                        required
                        className="w-full rounded-xl border border-blue-100 bg-blue-50/50 px-3.5 py-3 text-sm outline-none transition-colors focus:border-blue-400 focus:bg-white"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-0 bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Send size={17} /> {isSubmitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu hỗ trợ"}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "history" && (
                <div>
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="m-0 text-xl font-bold text-slate-900">Lịch sử yêu cầu của bạn</h2>
                    <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                      Tổng cộng {myFeedbacks.length} yêu cầu
                    </span>
                  </div>

                  {loadingHistory ? (
                    <div className="space-y-3">
                      <div className="h-32 animate-pulse rounded-2xl border border-blue-100 bg-blue-50/50" />
                      <div className="h-32 animate-pulse rounded-2xl border border-blue-100 bg-blue-50/50" />
                    </div>
                  ) : myFeedbacks.length === 0 ? (
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-8 text-center">
                      <AlertCircle size={38} className="mx-auto text-blue-300" />
                      <p className="mb-4 mt-3 text-sm text-slate-500">Bạn chưa có yêu cầu hỗ trợ nào.</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab("form")}
                        className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50"
                      >
                        Tạo yêu cầu đầu tiên
                      </button>
                    </div>
                  ) : (
                    <div className="max-h-[640px] space-y-4 overflow-y-auto pr-1">
                      {myFeedbacks.map((fb) => (
                        <article
                          key={fb._id}
                          className={`rounded-2xl border p-4 ${
                            fb.status === "resolved"
                              ? "border-indigo-100 bg-indigo-50/40"
                              : "border-blue-100 bg-white"
                          }`}
                        >
                          <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                            <h3 className="m-0 text-base font-bold leading-snug text-slate-900">{fb.subject}</h3>
                            {getStatusDisplay(fb.status)}
                          </div>

                          <p className="mb-3 mt-0 inline-flex items-center gap-1 text-xs text-slate-500">
                            <Clock size={12} /> {new Date(fb.createdAt).toLocaleString("vi-VN")}
                          </p>

                          <div className="rounded-xl bg-blue-50/70 p-3">
                            <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-blue-600">Nội dung gửi</p>
                            <p className="m-0 mt-1 text-sm text-slate-700">{fb.message}</p>
                          </div>

                          {fb.adminNote ? (
                            <div className="mt-3 rounded-xl border border-blue-200 bg-white p-3">
                              <p className="m-0 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.08em] text-blue-600">
                                <CheckCircle size={13} /> VTNEXIS phản hồi
                              </p>
                              <p className="m-0 mt-1.5 text-sm leading-relaxed text-slate-700">{fb.adminNote}</p>
                            </div>
                          ) : (
                            fb.status !== "resolved" && (
                              <p className="mb-0 mt-3 text-xs font-medium text-blue-600">
                                Đội ngũ CSKH đang xem xét và sẽ phản hồi sớm nhất.
                              </p>
                            )
                          )}
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <aside>
            <section className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm md:p-6">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="space-y-5">
                  <div>
                    <h2 className="m-0 text-lg font-bold text-slate-900">Thông tin liên hệ</h2>
                    <div className="mt-4 space-y-3">
                      {[
                        {
                          icon: <MapPin size={19} className="text-blue-600" />,
                          title: "Địa chỉ showroom",
                          content: "12 Nguyễn Văn Bảo, Gò Vấp, TP.HCM",
                        },
                        {
                          icon: <Phone size={19} className="text-blue-600" />,
                          title: "Hotline hỗ trợ",
                          content: "1900 1234 567 (24/7)",
                        },
                        {
                          icon: <Mail size={19} className="text-blue-600" />,
                          title: "Email liên hệ",
                          content: "support@vtnexis.vn",
                        },
                      ].map((item) => (
                        <div key={item.title} className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-3.5">
                          <div className="rounded-xl bg-white p-2.5 shadow-sm">{item.icon}</div>
                          <div>
                            <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-blue-500">{item.title}</p>
                            <p className="m-0 mt-1 text-sm font-semibold text-slate-800">{item.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                    <h3 className="m-0 text-base font-bold text-slate-900">Quy trình hỗ trợ</h3>
                    <div className="mt-3 space-y-2.5 text-sm text-slate-600">
                      <div className="flex items-start gap-3 rounded-xl bg-white p-3">
                        <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">1</span>
                        <p className="m-0">Tiếp nhận yêu cầu và xác nhận thông tin trong tối đa 24 giờ.</p>
                      </div>
                      <div className="flex items-start gap-3 rounded-xl bg-white p-3">
                        <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">2</span>
                        <p className="m-0">Phân loại và xử lý theo mức độ ưu tiên của vấn đề.</p>
                      </div>
                      <div className="flex items-start gap-3 rounded-xl bg-white p-3">
                        <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">3</span>
                        <p className="m-0">Phản hồi kết quả và hướng dẫn chi tiết ngay trong lịch sử hỗ trợ.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white p-4">
                  <h2 className="m-0 mb-3 text-lg font-bold text-slate-900">Vị trí trên bản đồ</h2>
                  <div className="h-[340px] overflow-hidden rounded-xl border border-blue-100 lg:h-full lg:min-h-[468px]">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.858237841926!2d106.68427047460395!3d10.822158889329432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174deb3ef536f31%3A0x8b7bb8b7c956157b!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBDw7RuZyBuZ2hp4buHcCBUUC5IQ00!5e0!3m2!1svi!2s"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Google Map VTNEXIS"
                    />
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </section>
      </main>

      <GlobalArticle pageCode="contact" />
      <Footer />
    </div>
  );
}

export default ContactPage;
