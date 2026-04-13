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
    if (!token) {
      setCanReview(false);
      return;
    }

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/reviews/check-eligibility/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCanReview(res.data.canReview);
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
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) { toast.error("Vui lòng đăng nhập!"); return; }
    if (!comment.trim()) { toast.error("Vui lòng nhập nội dung!"); return; }

    setIsSubmitting(true);
    try {
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
    <div className="bg-white rounded-2xl p-4 md:p-8 mt-6 md:mt-8 shadow-sm border border-slate-100 font-sans text-slate-800">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold m-0 mb-1">Đánh giá từ khách hàng</h2>
          <p className="text-[13px] md:text-sm text-slate-500 m-0">Dựa trên {totalReviews.toLocaleString()} đánh giá thực tế</p>
        </div>

        {!token ? (
          <p className="text-[13px] text-slate-500 italic">Vui lòng đăng nhập để đánh giá.</p>
        ) : !canReview ? (
          <p className="text-[13px] text-amber-600 bg-amber-50 p-2 rounded-lg flex items-center gap-1.5 font-medium border border-amber-100">
            <ShieldCheck size={16} /> Chỉ khách hàng đã nhận hàng mới được đánh giá.
          </p>
        ) : (
          <button
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white border-none px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
            onClick={() => setShowForm(!showForm)}
          >
            <Edit size={16} /> {isEditing ? "Sửa đánh giá của bạn" : "Viết đánh giá"}
          </button>
        )}
      </div>

      {/* SUMMARY BOX - Responsive: Dọc trên Mobile, Ngang trên PC */}
      <div className="flex flex-col md:flex-row items-center bg-slate-50/50 rounded-2xl border border-slate-100 mb-8 overflow-hidden">
        <div className="w-full md:w-[35%] p-6 md:p-8 text-center border-b md:border-b-0 md:border-r border-slate-200 bg-white md:bg-transparent">
          <div className="text-5xl md:text-6xl font-black text-slate-800 leading-none mb-3">{avgRating}</div>
          <div className="flex justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={22}
                fill={star <= Math.round(avgRating) ? "#F59E0B" : "none"}
                color={star <= Math.round(avgRating) ? "#F59E0B" : "#CBD5E1"}
              />
            ))}
          </div>
          <div className="text-[13px] text-slate-500 font-medium">{totalReviews.toLocaleString()} lượt đánh giá</div>
        </div>

        <div className="w-full md:w-[65%] p-6 md:px-10 md:py-8 flex flex-col gap-3">
          {[5, 4, 3, 2, 1].map(star => (
            <div key={star} className="flex items-center gap-3 md:gap-4">
              <span className="text-[13px] font-bold text-slate-600 w-11 shrink-0">{star} sao</span>
              <div className="flex-1 h-2.5 bg-white rounded-full overflow-hidden border border-slate-100">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-700"
                  style={{ width: `${getPercent(star)}%` }}
                />
              </div>
              <span className="text-[13px] font-semibold text-slate-500 w-9 text-right">{getPercent(star)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* FORM VIẾT ĐÁNH GIÁ (GIỮ NGUYÊN LOGIC) */}
      {showForm && (
        <div className="bg-white p-5 md:p-6 rounded-xl mb-8 border-2 border-blue-100 shadow-lg animate-[slideUp_0.3s_ease]">
          <h4 className="text-base font-bold m-0 mb-4 text-slate-800">
            {isEditing ? "Cập nhật đánh giá của bạn" : "Gửi đánh giá của bạn"}
          </h4>
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-4 mb-5 p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-bold text-slate-700">Chất lượng:</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={32}
                    className="cursor-pointer active:scale-125 transition-transform"
                    fill={star <= rating ? "#F59E0B" : "none"}
                    color={star <= rating ? "#F59E0B" : "#CBD5E1"}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>

            <textarea
              placeholder="Chia sẻ cảm nhận của bạn về sản phẩm (ví dụ: giao hàng nhanh, máy đẹp, chụp ảnh nét...)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              className="w-full p-4 border border-slate-200 rounded-xl font-sans text-[14.5px] mb-4 resize-y box-border focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 rounded-lg font-bold cursor-pointer text-slate-500 hover:bg-slate-100 transition-colors border-none bg-transparent"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !token}
                className="bg-blue-600 border-none text-white px-8 py-2.5 rounded-lg font-bold cursor-pointer hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting
                  ? <><Loader2 size={18} className="animate-spin" /> Đang gửi...</>
                  : (isEditing ? "Cập nhật" : "Gửi đánh giá")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTER & SORT - Fix tràn trên Mobile */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-100 mb-8">
        {/* VUỐT NGANG BỘ LỌC SAO */}
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide [&::-webkit-scrollbar]:hidden">
          {["all", "5", "4", "3"].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-[13px] font-bold transition-all border shrink-0
                ${activeFilter === f
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 active:bg-slate-50"
                }`}
            >
              {f === "all" ? "Tất cả" : `${f} sao`}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3 text-[13px] text-slate-500 bg-slate-100/50 px-3 py-1.5 rounded-lg w-full sm:w-auto justify-between sm:justify-start">
          <span className="font-medium whitespace-nowrap">Sắp xếp theo:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border-none bg-transparent text-[13px] font-bold text-slate-800 outline-none cursor-pointer p-0"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>
        </div>
      </div>

      {/* DANH SÁCH REVIEW */}
      <div className="flex flex-col gap-8">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-300" size={40} /></div>
        ) : displayReviews.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium m-0">Chưa có đánh giá nào phù hợp.</p>
          </div>
        ) : (
          displayReviews.map((rev) => (
            <div key={rev._id} className="flex gap-3 md:gap-5 border-b border-slate-50 pb-8 last:border-none last:pb-0">
              <div className="shrink-0 pt-1">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                  <UserCircle size={32} strokeWidth={1.5} />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                  <strong className="text-[15px] md:text-base text-slate-900 truncate">{rev.username}</strong>
                  <span className="flex items-center gap-1 text-[10px] md:text-[11px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    <ShieldCheck size={13} className="shrink-0" /> Đã mua hàng
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="flex gap-0.5 shrink-0">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        fill={star <= rev.rating ? "#F59E0B" : "none"}
                        color={star <= rev.rating ? "#F59E0B" : "#CBD5E1"}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] md:text-xs text-slate-400 font-medium">
                    {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <p className="text-sm md:text-[15px] text-slate-700 leading-relaxed m-0 mb-4 whitespace-pre-wrap break-words">{rev.comment}</p>

                <div className="flex items-center gap-4">
                  <button className="bg-white border border-slate-200 px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95">
                    <ThumbsUp size={14} /> Hữu ích
                  </button>
                  <button className="bg-none border-none text-slate-400 text-[11px] md:text-xs font-medium cursor-pointer p-0 hover:text-slate-800 hover:underline transition-colors">
                    Báo cáo vi phạm
                  </button>
                </div>

                {rev.adminReply && (
                  <div className="bg-blue-50/50 border-l-4 border-blue-500 px-4 md:px-5 py-4 rounded-r-2xl mt-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold shrink-0">V&T</div>
                      <strong className="text-[13px] md:text-sm text-blue-800">V&T Nexis Shop</strong>
                      <span className="bg-blue-600 text-white text-[8px] md:text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase">Quản trị viên</span>
                      <span className="text-[10px] md:text-xs text-slate-400 ml-auto font-medium">
                        {new Date(rev.adminReplyDate || rev.updatedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <p className="m-0 text-[13.5px] md:text-sm text-slate-600 italic leading-relaxed">"{rev.adminReply}"</p>
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