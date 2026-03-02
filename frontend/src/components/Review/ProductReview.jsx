import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Star, Image as ImageIcon, ThumbsUp, Flag, Edit, X, ShieldCheck, UserCircle } from "lucide-react";
import { toast } from "sonner";
import "./ProductReview.css";

const ProductReview = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States cho Form viết/sửa đánh giá
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]); // Chứa file thật (dùng khi backend đã có multer)
  const [imagePreviews, setImagePreviews] = useState([]); // Chứa URL preview hiển thị UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // States quản lý quyền Đánh giá & Chỉnh sửa
  const [canReview, setCanReview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // States cho Lọc & Sắp xếp
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const token = localStorage.getItem("token");

  // 1. Fetch Danh sách Reviews
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

  // 2. Fetch Kiểm tra điều kiện mua hàng & Lấy review cũ (nếu có)
  const checkUserEligibility = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/reviews/check-eligibility/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCanReview(res.data.canReview);
      
      // Nếu đã từng đánh giá, điền sẵn thông tin cũ vào Form
      if (res.data.existingReview) {
        setRating(res.data.existingReview.rating);
        setComment(res.data.existingReview.comment);
        setIsEditing(true); // Đánh dấu là đang ở chế độ Sửa
      }
    } catch (error) {
      console.error("Lỗi kiểm tra quyền đánh giá:", error);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
      checkUserEligibility();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // Xử lý chọn ảnh từ máy tính (UI)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error("Chỉ được tải lên tối đa 5 ảnh!");
      return;
    }
    
    setImages([...images, ...files]);
    
    // Tạo preview URL cho ảnh để hiển thị lên màn hình
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  // Xóa ảnh đã chọn
  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  // 3. Xử lý Gửi/Cập nhật Đánh giá
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) { toast.error("Vui lòng đăng nhập!"); return; }
    if (!comment.trim()) { toast.error("Vui lòng nhập nội dung!"); return; }

    setIsSubmitting(true);
    try {
      // Đang dùng chuẩn JSON cơ bản (chưa đính kèm file ảnh) để tránh lỗi 500 do backend chưa có Multer.
      // Nếu sau này bạn code xong API upload ảnh ở Backend, bạn đổi sang dùng FormData ở đây nhé.
      await axios.post("http://localhost:5000/api/reviews", {
        productId,
        rating,
        comment
      }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      toast.success(isEditing ? "Đã cập nhật đánh giá!" : "Cảm ơn bạn đã đánh giá!");
      setShowForm(false);
      fetchReviews(); // Tải lại danh sách review mới nhất
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi gửi đánh giá!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- LOGIC TÍNH TOÁN THỐNG KÊ ---
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1) : 0;
  
  // Đếm số lượng từng loại sao (1-5)
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => { if(starCounts[r.rating] !== undefined) starCounts[r.rating]++; });
  const getPercent = (star) => totalReviews > 0 ? Math.round((starCounts[star] / totalReviews) * 100) : 0;

  // --- LOGIC LỌC & SẮP XẾP ---
  let displayReviews = [...reviews];
  if (activeFilter !== "all") {
    if (activeFilter === "has_image") {
      displayReviews = displayReviews.filter(r => r.images && r.images.length > 0);
    } else {
      displayReviews = displayReviews.filter(r => r.rating === parseInt(activeFilter));
    }
  }

  if (sortBy === "newest") displayReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (sortBy === "oldest") displayReviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div className="pr-wrapper">
      
      {/* HEADER & TỔNG QUAN */}
      <div className="pr-header">
        <div className="pr-title-area">
          <h2>Đánh giá từ khách hàng</h2>
          <p>Dựa trên {totalReviews.toLocaleString()} đánh giá thực tế từ người dùng</p>
        </div>
        
        {/* NÚT VIẾT ĐÁNH GIÁ (Chứa logic kiểm tra mua hàng) */}
        {!token ? (
          <p className="login-warning">Vui lòng đăng nhập để đánh giá.</p>
        ) : !canReview ? (
          <p className="login-warning" style={{color: "#F59E0B", display: "flex", alignItems: "center", gap: "6px"}}>
            <ShieldCheck size={16} /> Chỉ khách hàng đã mua và nhận hàng mới được đánh giá.
          </p>
        ) : (
          <button className="btn-write-review" onClick={() => setShowForm(!showForm)}>
            <Edit size={16} /> {isEditing ? "Sửa đánh giá của bạn" : "Viết đánh giá"}
          </button>
        )}
      </div>

      <div className="pr-summary-box">
        {/* Điểm trung bình */}
        <div className="pr-avg-score">
          <div className="score-number">{avgRating}</div>
          <div className="score-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={20} fill={star <= Math.round(avgRating) ? "#2563EB" : "none"} color={star <= Math.round(avgRating) ? "#2563EB" : "#CBD5E1"} />
            ))}
          </div>
          <div className="score-text">{totalReviews.toLocaleString()} lượt đánh giá</div>
        </div>

        {/* Thanh Progress */}
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

      {/* FORM VIẾT / SỬA ĐÁNH GIÁ (Ẩn/Hiện khi bấm nút) */}
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
            
            {/* Chỗ Upload Ảnh (UI) */}
            <div className="pr-image-upload">
              <input type="file" multiple accept="image/*" hidden ref={fileInputRef} onChange={handleImageChange} />
              <button type="button" className="btn-upload-img" onClick={() => fileInputRef.current.click()}>
                <ImageIcon size={18} /> Thêm hình ảnh (Tối đa 5)
              </button>
              
              {imagePreviews.length > 0 && (
                <div className="preview-grid">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="preview-item">
                      <img src={src} alt="preview" />
                      <button type="button" className="btn-remove-img" onClick={() => removeImage(idx)}><X size={14}/></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pr-form-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Hủy</button>
              <button type="submit" disabled={isSubmitting || !token} className="btn-submit">
                {isSubmitting ? "Đang xử lý..." : (isEditing ? "Cập nhật" : "Gửi đánh giá")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* THANH LỌC & SẮP XẾP */}
      <div className="pr-filter-bar">
        <div className="pr-filters">
          <button className={activeFilter === "all" ? "active" : ""} onClick={() => setActiveFilter("all")}>Tất cả</button>
          <button className={activeFilter === "5" ? "active" : ""} onClick={() => setActiveFilter("5")}>5 sao</button>
          <button className={activeFilter === "4" ? "active" : ""} onClick={() => setActiveFilter("4")}>4 sao</button>
          <button className={activeFilter === "3" ? "active" : ""} onClick={() => setActiveFilter("3")}>3 sao</button>
          <button className={`filter-img-btn ${activeFilter === "has_image" ? "active" : ""}`} onClick={() => setActiveFilter("has_image")}>
            <ImageIcon size={14} /> Có hình ảnh
          </button>
        </div>
        <div className="pr-sort">
          <span>Sắp xếp:</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>
        </div>
      </div>

      {/* DANH SÁCH REVIEW ITEM */}
      <div className="pr-review-list">
        {loading ? (
          <p className="pr-loading">Đang tải đánh giá...</p>
        ) : displayReviews.length === 0 ? (
          <p className="pr-empty">Không có đánh giá nào phù hợp với bộ lọc.</p>
        ) : (
          displayReviews.map((rev) => (
            <div key={rev._id} className="pr-review-item">
              <div className="pr-avatar">
                <UserCircle size={48} color="#94A3B8" />
              </div>
              <div className="pr-content">
                <div className="pr-user-line">
                  <strong className="pr-username">{rev.username}</strong>
                  <span className="pr-verified"><ShieldCheck size={14}/> ĐÃ MUA HÀNG</span>
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

                {/* Hình ảnh đính kèm (nếu DB có mảng images) */}
                {rev.images && rev.images.length > 0 && (
                  <div className="pr-images-grid">
                    {rev.images.map((img, idx) => (
                      <img key={idx} src={img} alt="review" className="pr-review-img" />
                    ))}
                  </div>
                )}

                {/* Nút hành động */}
                <div className="pr-item-actions">
                  <button className="btn-helpful"><ThumbsUp size={14}/> Hữu ích (12)</button>
                  <button className="btn-report">Báo cáo vi phạm</button>
                </div>

                {/* Phản hồi từ Shop (Nằm trong DB field: adminReply) */}
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

      {totalReviews > displayReviews.length && (
        <div className="pr-load-more">
          <button>Xem thêm đánh giá</button>
        </div>
      )}

    </div>
  );
};

export default ProductReview;