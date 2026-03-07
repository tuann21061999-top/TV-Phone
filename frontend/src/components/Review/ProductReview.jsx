import React, { useState, useEffect } from "react";
import axios from "axios";
import { Star, ThumbsUp, Edit, ShieldCheck, UserCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import "./ProductReview.css";

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
      const res = await axios.get(`http://localhost:5000/api/reviews/${productId}`);
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
      const res = await axios.get(`http://localhost:5000/api/reviews/check-eligibility/${productId}`, {
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
      await axios.post("http://localhost:5000/api/reviews", {
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
    <div className="pr-wrapper">

      {/* HEADER */}
      <div className="pr-header">
        <div className="pr-title-area">
          <h2>Đánh giá từ khách hàng</h2>
          <p>Dựa trên {totalReviews.toLocaleString()} đánh giá thực tế từ người dùng</p>
        </div>

        {/* NÚT VIẾT / SỬA ĐÁNH GIÁ */}
        {!token ? (
          <p className="login-warning">Vui lòng đăng nhập để đánh giá.</p>
        ) : !canReview ? (
          <p className="login-warning" style={{ color: "#F59E0B", display: "flex", alignItems: "center", gap: "6px" }}>
            <ShieldCheck size={16} /> Chỉ khách hàng đã mua và nhận hàng mới được đánh giá.
          </p>
        ) : (
          <button className="btn-write-review" onClick={() => setShowForm(!showForm)}>
            <Edit size={16} /> {isEditing ? "Sửa đánh giá của bạn" : "Viết đánh giá"}
          </button>
        )}
      </div>

      <div className="pr-summary-box">
        <div className="pr-avg-score">
          <div className="score-number">{avgRating}</div>
          <div className="score-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={20} fill={star <= Math.round(avgRating) ? "#2563EB" : "none"} color={star <= Math.round(avgRating) ? "#2563EB" : "#CBD5E1"} />
            ))}
          </div>
          <div className="score-text">{totalReviews.toLocaleString()} lượt đánh giá</div>
        </div>

        <div className="pr-progress-bars">
          {[5, 4, 3, 2, 1].map(star => (
            <div key={star} className="progress-row">
              <span className="star-label">{star} sao</span>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${getPercent(star)}%` }}></div>
              </div>
              <span className="star-percent">{getPercent(star)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* FORM VIẾT ĐÁNH GIÁ (CHỈ CÓ TEXT) */}
      {showForm && (
        <div className="pr-form-container">
          <h4>{isEditing ? "Cập nhật đánh giá của bạn" : "Gửi đánh giá của bạn"}</h4>
          <form onSubmit={handleSubmit}>
            <div className="pr-form-rating">
              <span>Chất lượng sản phẩm:</span>
              <div className="stars-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star} size={28} className="star-clickable"
                    fill={star <= rating ? "#F59E0B" : "none"} color={star <= rating ? "#F59E0B" : "#CBD5E1"}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>

            <textarea
              placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
              value={comment} onChange={(e) => setComment(e.target.value)} rows="4"
            />

            <div className="pr-form-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Hủy</button>
              <button type="submit" disabled={isSubmitting || !token} className="btn-submit">
                {isSubmitting ? <><Loader2 size={16} className="spinner" /> Đang gửi...</> : (isEditing ? "Cập nhật" : "Gửi đánh giá")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTER & LIST */}
      <div className="pr-filter-bar">
        <div className="pr-filters">
          <button className={activeFilter === "all" ? "active" : ""} onClick={() => setActiveFilter("all")}>Tất cả</button>
          <button className={activeFilter === "5" ? "active" : ""} onClick={() => setActiveFilter("5")}>5 sao</button>
          <button className={activeFilter === "4" ? "active" : ""} onClick={() => setActiveFilter("4")}>4 sao</button>
          <button className={activeFilter === "3" ? "active" : ""} onClick={() => setActiveFilter("3")}>3 sao</button>
        </div>
        <div className="pr-sort">
          <span>Sắp xếp:</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>
        </div>
      </div>

      <div className="pr-review-list">
        {loading ? (
          <p className="pr-loading">Đang tải đánh giá...</p>
        ) : displayReviews.length === 0 ? (
          <p className="pr-empty">Không có đánh giá nào phù hợp.</p>
        ) : (
          displayReviews.map((rev) => (
            <div key={rev._id} className="pr-review-item">
              <div className="pr-avatar">
                <UserCircle size={48} color="#94A3B8" />
              </div>
              <div className="pr-content">
                <div className="pr-user-line">
                  <strong className="pr-username">{rev.username}</strong>
                  <span className="pr-verified"><ShieldCheck size={14} /> ĐÃ MUA HÀNG</span>
                </div>

                <div className="pr-stars-date">
                  <div className="pr-stars-mini">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={14} fill={star <= rev.rating ? "#2563EB" : "none"} color={star <= rev.rating ? "#2563EB" : "#CBD5E1"} />
                    ))}
                  </div>
                  <span className="pr-date">{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>

                <p className="pr-comment">{rev.comment}</p>

                <div className="pr-item-actions">
                  <button className="btn-helpful"><ThumbsUp size={14} /> Hữu ích</button>
                  <button className="btn-report">Báo cáo vi phạm</button>
                </div>

                {rev.adminReply && (
                  <div className="pr-admin-reply">
                    <div className="admin-reply-header">
                      <strong>TechNova Shop</strong>
                      <span className="admin-badge">QUẢN TRỊ VIÊN</span>
                      <span className="reply-date">{new Date(rev.adminReplyDate || rev.updatedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <p className="admin-reply-text">"{rev.adminReply}"</p>
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