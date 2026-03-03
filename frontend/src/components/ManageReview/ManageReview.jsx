import React, { useState, useEffect } from "react";
import axios from "axios";
import { Star, EyeOff, Eye, Search, MessageSquare, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

// IMPORT FILE CSS CỦA PRODUCT ĐỂ LẤY KHUNG RỘNG + IMPORT CSS REVIEW CHO CARD
import "../../components/ManageProduct/ManageProduct.css"; 
import "./ManageReview.css"; 

const ManageReview = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState("");

  const autoReplyTemplate = "Chào bạn, cảm ơn bạn đã tin tưởng và ủng hộ sản phẩm của TechNova. Rất vui khi biết bạn hài lòng với chất lượng sản phẩm và dịch vụ hỗ trợ của đội ngũ. Chúc bạn có những trải nghiệm tuyệt vời cùng sản phẩm mới!";

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/reviews/admin/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(res.data);
    } catch (error) {
      toast.error("Lỗi tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const toggleStatus = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/reviews/admin/${id}/toggle-status`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Đã thay đổi trạng thái hiển thị");
      fetchReviews();
    } catch (error) { toast.error("Lỗi khi thay đổi trạng thái"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/reviews/admin/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Đã xóa đánh giá thành công");
      fetchReviews();
    } catch (error) { toast.error("Lỗi khi xóa đánh giá"); }
  };

  const openReplyBox = (review) => {
    if (replyingId === review._id) { setReplyingId(null); } 
    else { setReplyingId(review._id); setReplyText(review.adminReply || ""); }
  };

  const submitReply = async (id) => {
    if (!replyText.trim()) { toast.error("Vui lòng nhập câu trả lời"); return; }
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/reviews/admin/${id}/reply`, { reply: replyText }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Đã gửi phản hồi thành công!");
      setReplyingId(null); setReplyText(""); fetchReviews();
    } catch (error) { toast.error("Lỗi khi gửi phản hồi"); }
  };

  const filteredReviews = reviews.filter(rev => 
    rev.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    rev.comment?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="manage-product"> {/* Dùng chung class rộng 100% của ManageProduct */}
      
      {/* Khung Header y hệt các trang Sản phẩm */}
      <div className="admin-header">
        <div className="header-left">
          <h2>Quản lý Đánh giá</h2>
          <div className="search-box">
            <Search size={18} color="#64748b" />
            <input 
              type="text" 
              placeholder="Tìm theo tên KH, nội dung..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Danh sách thẻ Review */}
      {loading ? (
        <div className="mo-loading">Đang tải...</div>
      ) : (
        <div className="review-list-container">
          {filteredReviews.map((rev) => (
            <div key={rev._id} className="mo-card" style={{ padding: "24px" }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <div>
                  <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", color: "#1E293B" }}>{rev.username}</h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "#64748B" }}>
                    Sản phẩm: <strong style={{color: "#2563EB"}}>{rev.productId?.name || "Sản phẩm đã xóa"}</strong>
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "2px", justifyContent: "flex-end" }}>
                    {[1,2,3,4,5].map(s => <Star key={s} size={16} fill={s <= rev.rating ? "#F59E0B" : "none"} color={s <= rev.rating ? "#F59E0B" : "#CBD5E1"}/>)}
                  </div>
                  <p style={{ margin: "6px 0 0 0", fontSize: "12px", color: "#94A3B8" }}>
                    {new Date(rev.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
              
              <div style={{ background: "#F8FAFC", padding: "16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", color: "#334155", lineHeight: "1.5" }}>
                {rev.comment}
              </div>

              {rev.adminReply && replyingId !== rev._id && (
                <div style={{ background: "#EFF6FF", borderLeft: "3px solid #2563EB", padding: "12px 16px", borderRadius: "0 8px 8px 0", marginBottom: "16px" }}>
                  <strong style={{ fontSize: "13px", color: "#1D4ED8", display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <CheckCircle2 size={14}/> Phản hồi của bạn:
                  </strong>
                  <p style={{ margin: 0, fontSize: "13px", color: "#475569", fontStyle: "italic" }}>"{rev.adminReply}"</p>
                </div>
              )}

              {replyingId === rev._id && (
                <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
                  <p style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: "600", color: "#1E293B" }}>Nhập phản hồi của Shop:</p>
                  <textarea 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows="3"
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", marginBottom: "10px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                    placeholder="Nhập nội dung trả lời khách hàng..."
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button 
                      onClick={() => setReplyText(autoReplyTemplate)}
                      style={{ background: "#F1F5F9", color: "#475569", border: "none", padding: "8px 12px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}
                    >
                      ✨ Dùng câu trả lời mẫu
                    </button>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => setReplyingId(null)} style={{ background: "white", border: "1px solid #E2E8F0", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>Hủy</button>
                      <button onClick={() => submitReply(rev._id)} style={{ background: "#2563EB", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>Gửi phản hồi</button>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F1F5F9", paddingTop: "16px" }}>
                <span className={`badge ${rev.status === "active" ? "badge-success" : "badge-secondary"}`}>
                  {rev.status === "active" ? "Đang hiển thị" : "Đã bị ẩn"}
                </span>
                
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => toggleStatus(rev._id)} className="btn-icon" style={{ color: rev.status === "active" ? "#475569" : "#2563EB" }}>
                    {rev.status === "active" ? <><EyeOff size={15}/> Ẩn</> : <><Eye size={15}/> Hiện</>}
                  </button>
                  <button onClick={() => openReplyBox(rev)} className="btn-icon" style={{ color: "#2563EB", background: "#EFF6FF", borderColor: "#BFDBFE" }}>
                    <MessageSquare size={15}/> {rev.adminReply ? "Sửa phản hồi" : "Trả lời"}
                  </button>
                  <button onClick={() => handleDelete(rev._id)} className="btn-icon" style={{ color: "#EF4444", background: "#FEF2F2", borderColor: "#FECACA" }}>
                    <Trash2 size={15}/> Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageReview;