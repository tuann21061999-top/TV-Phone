import React, { useState, useEffect } from "react";
import axios from "axios";
import { Star, ThumbsUp, Edit, ShieldCheck, UserCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ProductReview = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // States Form Đánh giá
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Phân quyền
  const [canReview, setCanReview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const token = localStorage.getItem("token");

  // Fetch Danh sách Reviews
  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/reviews/${productId}`);
      setReviews(res.data);
    } catch (error) {
      console.error("Lỗi tải đánh giá:", error);
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra quyền (Đã mua hàng chưa)
  const checkUserEligibility = async () => {
    const token = localStorage.getItem("token");

    // Nếu khách vãng lai -> Dừng
    if (!token) {
      setCanReview(false);
      return;
    }

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/reviews/check-eligibility/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 1. Mở khóa nút viết đánh giá
      setCanReview(res.data.canReview);

      // 2. Tự động điền dữ liệu cũ nếu khách đã từng đánh giá (Tính năng Sửa đánh giá)
      if (res.data.existingReview) {
        setIsEditing(true);
        setRating(res.data.existingReview.rating);
        setComment(res.data.existingReview.comment);
      } else {
        setIsEditing(false);
        setRating(5);
        setComment("");
      }

    } catch (error) {
      setCanReview(false);
      if (error.response?.status !== 401) {
        console.error("Lỗi kiểm tra quyền:", error);
      }
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
      checkUserEligibility();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // --- GỬI ĐÁNH GIÁ (JSON THUẦN) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) { toast.error("Vui lòng đăng nhập!"); return; }
    if (!comment.trim()) { toast.error("Vui lòng nhập nội dung!"); return; }

    setIsSubmitting(true);
    try {
      // GỬI DỮ LIỆU DẠNG JSON (BỎ FORM DATA VÀ IMAGE)
      await axios.post(`${import.meta.env.VITE_API_URL}/api/reviews`, {
        productId,
        rating,
        comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(isEditing ? "Đã cập nhật đánh giá!" : "Cảm ơn bạn đã đánh giá!");
      setShowForm(false);
      fetchReviews();
      checkUserEligibility();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi gửi đánh giá!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tính Thống Kê
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? (reviews.reduce((a, c) => a + c.rating, 0) / totalReviews).toFixed(1) : 0;
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => { if (starCounts[r.rating] !== undefined) starCounts[r.rating]++; });
  const getPercent = (star) => totalReviews > 0 ? Math.round((starCounts[star] / totalReviews) * 100) : 0;

  // Lọc & Sắp xếp
  let displayReviews = [...reviews];
  if (activeFilter !== "all") {
    displayReviews = displayReviews.filter(r => r.rating === parseInt(activeFilter));
  }
  if (sortBy === "newest") displayReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (sortBy === "oldest") displayReviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
  <div className="bg-white rounded-2xl p-8 mt-8 shadow-sm border border-slate-100 font-sans text-slate-800">

    {/* HEADER */}
    <div className="flex justify-between items-start mb-6">
      <div>
        <h2 className="text-2xl font-bold m-0 mb-1.5">Đánh giá từ khách hàng</h2>
        <p className="text-sm text-slate-500 m-0">Dựa trên {totalReviews.toLocaleString()} đánh giá thực tế từ người dùng</p>
      </div>

      {!token ? (
        <p className="text-sm text-slate-500">Vui lòng đăng nhập để đánh giá.</p>
      ) : !canReview ? (
        <p className="text-sm text-amber-500 flex items-center gap-1.5">
          <ShieldCheck size={16} /> Chỉ khách hàng đã mua và nhận hàng mới được đánh giá.
        </p>
      ) : (
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white border-none px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors"
          onClick={() => setShowForm(!showForm)}
        >
          <Edit size={16} /> {isEditing ? "Sửa đánh giá của bạn" : "Viết đánh giá"}
        </button>
      )}
    </div>

    {/* SUMMARY BOX */}
    <div className="flex items-center bg-white rounded-xl border border-slate-200 mb-6">
      <div className="w-[30%] p-8 text-center border-r border-slate-200">
        <div className="text-5xl font-extrabold text-slate-800 leading-none mb-2">{avgRating}</div>
        <div className="flex justify-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={20}
              fill={star <= Math.round(avgRating) ? "#2563EB" : "none"}
              color={star <= Math.round(avgRating) ? "#2563EB" : "#CBD5E1"}
            />
          ))}
        </div>
        <div className="text-xs text-slate-500">{totalReviews.toLocaleString()} lượt đánh giá</div>
      </div>

      <div className="w-[70%] px-10 py-8 flex flex-col gap-3">
        {[5, 4, 3, 2, 1].map(star => (
          <div key={star} className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-500 w-11">{star} sao</span>
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${getPercent(star)}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 w-9 text-right">{getPercent(star)}%</span>
          </div>
        ))}
      </div>
    </div>

    {/* FORM VIẾT ĐÁNH GIÁ */}
    {showForm && (
      <div className="bg-slate-50 p-6 rounded-xl mb-6 border border-slate-200">
        <h4 className="text-base font-semibold m-0 mb-4">
          {isEditing ? "Cập nhật đánh giá của bạn" : "Gửi đánh giá của bạn"}
        </h4>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-3 mb-4 text-sm font-semibold">
            <span>Chất lượng sản phẩm:</span>
            <div className="flex gap-1 cursor-pointer">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={28}
                  className="cursor-pointer"
                  fill={star <= rating ? "#F59E0B" : "none"}
                  color={star <= rating ? "#F59E0B" : "#CBD5E1"}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>

          <textarea
            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="4"
            className="w-full p-4 border border-slate-200 rounded-lg font-sans text-sm mb-4 resize-y box-border focus:border-blue-400 focus:outline-none"
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-white border border-slate-200 px-5 py-2.5 rounded-lg font-semibold cursor-pointer text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !token}
              className="bg-blue-600 border-none text-white px-6 py-2.5 rounded-lg font-semibold cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {isSubmitting
                ? <><Loader2 size={16} className="animate-spin" /> Đang gửi...</>
                : (isEditing ? "Cập nhật" : "Gửi đánh giá")}
            </button>
          </div>
        </form>
      </div>
    )}

    {/* FILTER & SORT */}
    <div className="flex justify-between items-center pb-5 border-b border-slate-200 mb-6">
      <div className="flex gap-2.5">
        {["all", "5", "4", "3"].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`border px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-colors
              ${activeFilter === f
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300"
              }`}
          >
            {f === "all" ? "Tất cả" : `${f} sao`}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Sắp xếp:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border-none bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
        </select>
      </div>
    </div>

    {/* DANH SÁCH REVIEW */}
    <div className="flex flex-col gap-6">
      {loading ? (
        <p className="text-center text-slate-400 py-8">Đang tải đánh giá...</p>
      ) : displayReviews.length === 0 ? (
        <p className="text-center text-slate-400 py-8">Không có đánh giá nào phù hợp.</p>
      ) : (
        displayReviews.map((rev) => (
          <div key={rev._id} className="flex gap-4 border-b border-slate-50 pb-6 last:border-none last:pb-0">
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
              <UserCircle size={48} color="#94A3B8" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <strong className="text-sm text-slate-800">{rev.username}</strong>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                  <ShieldCheck size={14} /> ĐÃ MUA HÀNG
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      fill={star <= rev.rating ? "#2563EB" : "none"}
                      color={star <= rev.rating ? "#2563EB" : "#CBD5E1"}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed m-0 mb-4">{rev.comment}</p>

              <div className="flex items-center gap-4">
                <button className="bg-white border border-slate-200 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-500 flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-colors">
                  <ThumbsUp size={14} /> Hữu ích
                </button>
                <button className="bg-none border-none text-slate-400 text-xs cursor-pointer p-0 hover:text-slate-800 hover:underline transition-colors">
                  Báo cáo vi phạm
                </button>
              </div>

              {rev.adminReply && (
                <div className="bg-slate-50 border-l-4 border-blue-600 pl-4 pr-4 py-4 rounded-r-lg mt-4">
                  <div className="flex items-center gap-3 mb-2">
                    <strong className="text-sm text-slate-800">TechNova Shop</strong>
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded">QUẢN TRỊ VIÊN</span>
                    <span className="text-xs text-slate-400 ml-auto">
                      {new Date(rev.adminReplyDate || rev.updatedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <p className="m-0 text-sm text-slate-500 italic leading-relaxed">"{rev.adminReply}"</p>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);
};

export default ProductReview;