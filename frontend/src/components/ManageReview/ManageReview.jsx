import React, { useState, useEffect } from "react";
import axios from "axios";
import { Star, EyeOff, Eye, Search, MessageSquare, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

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
    if (replyingId === review._id) { 
      setReplyingId(null); 
    } else { 
      setReplyingId(review._id); 
      setReplyText(review.adminReply || ""); 
    }
  };

  const submitReply = async (id) => {
    if (!replyText.trim()) { toast.error("Vui lòng nhập câu trả lời"); return; }
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/reviews/admin/${id}/reply`, { reply: replyText }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Đã gửi phản hồi thành công!");
      setReplyingId(null); 
      setReplyText(""); 
      fetchReviews();
    } catch (error) { toast.error("Lỗi khi gửi phản hồi"); }
  };

  const filteredReviews = reviews.filter(rev => 
    rev.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    rev.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rev.productId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-full min-w-0 box-border font-sans">
      
      {/* Thanh công cụ Tìm kiếm */}
      <div className="flex justify-between items-center mb-2.5 w-full pb-4 border-b-2 border-slate-200">
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg py-3 px-5 w-[400px] shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
          <Search size={18} className="text-slate-500 shrink-0" />
          <input 
            type="text" 
            placeholder="Tìm theo tên KH, nội dung, sản phẩm..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-none outline-none w-full text-sm text-slate-800 bg-transparent"
          />
        </div>
      </div>

      {/* Danh sách thẻ Review */}
      {loading ? (
        <div className="text-center p-16 text-slate-500 text-[15px] w-full">Đang tải danh sách đánh giá...</div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center p-16 text-slate-500 text-[15px] w-full">Không tìm thấy đánh giá nào phù hợp.</div>
      ) : (
        <div className="flex flex-col gap-6 w-full">
          {filteredReviews.map((rev) => (
            <div key={rev._id} className="bg-white border border-slate-200 rounded-xl shadow-[0_2px_5px_rgba(0,0,0,0.03)] w-full box-border overflow-hidden flex flex-col">
              
              {/* Header của thẻ (Tên KH & Ngày) */}
              <div className="flex flex-wrap justify-between items-center py-5 px-7 bg-slate-50 border-b border-slate-200 gap-4">
                <div className="flex items-center gap-6 flex-wrap">
                  <strong className="text-base text-slate-900">{rev.username}</strong>
                  <span className="text-sm text-slate-500 bg-white py-1.5 px-3 rounded-md border border-slate-200">
                    Sản phẩm: <strong className="text-blue-600 text-sm">{rev.productId?.name || "Sản phẩm đã xóa"}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-5">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => <Star key={s} size={16} fill={s <= rev.rating ? "#F59E0B" : "none"} color={s <= rev.rating ? "#F59E0B" : "#CBD5E1"}/>)}
                  </div>
                  <span className="text-[13px] text-slate-500">
                    {new Date(rev.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
              
              {/* Body của thẻ (Nội dung) */}
              <div className="p-7 flex flex-col gap-5">
                <div className="text-[15px] text-slate-700 leading-relaxed bg-slate-100 py-5 px-6 rounded-lg border-l-4 border-slate-400 min-h-[50px]">
                  {rev.comment}
                </div>

                {/* Phản hồi của Shop (Nếu đã có) */}
                {rev.adminReply && replyingId !== rev._id && (
                  <div className="bg-blue-50 border-l-4 border-blue-600 py-5 px-6 rounded-r-lg">
                    <strong className="text-sm text-blue-700 flex items-center gap-2 mb-2">
                      <CheckCircle2 size={15}/> Phản hồi của bạn:
                    </strong>
                    <p className="m-0 text-sm text-slate-600 italic leading-relaxed">"{rev.adminReply}"</p>
                  </div>
                )}

                {/* Form nhập phản hồi */}
                {replyingId === rev._id && (
                  <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    <p className="m-0 mb-3 text-sm font-semibold text-slate-800">Nhập phản hồi của Shop:</p>
                    <textarea 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows="3"
                      placeholder="Nhập nội dung trả lời khách hàng..."
                      className="w-full p-4 rounded-lg border border-slate-300 text-sm mb-4 outline-none box-border font-sans resize-y focus:border-blue-500"
                    />
                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <button onClick={() => setReplyText(autoReplyTemplate)} className="bg-slate-100 text-slate-600 border-none py-2.5 px-4 rounded-lg text-[13px] cursor-pointer font-medium hover:bg-slate-200 transition-colors">
                        ✨ Dùng câu trả lời mẫu
                      </button>
                      <div className="flex gap-3">
                        <button onClick={() => { setReplyingId(null); setReplyText(""); }} className="bg-white border border-slate-300 py-2.5 px-5 rounded-lg cursor-pointer text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">Hủy</button>
                        <button onClick={() => submitReply(rev._id)} className="bg-blue-600 text-white border-none py-2.5 px-5 rounded-lg cursor-pointer text-[13px] font-semibold hover:bg-blue-700 transition-colors">Gửi phản hồi</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer của thẻ (Hành động) */}
              <div className="flex flex-wrap justify-between items-center py-5 px-7 border-t border-slate-200 bg-white gap-4">
                <span className={`py-2 px-4 rounded-full text-[13px] font-semibold inline-flex items-center border ${rev.status === "active" ? "bg-green-100 text-green-600 border-green-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                  {rev.status === "active" ? "Đang hiển thị" : "Đã bị ẩn"}
                </span>
                
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => toggleStatus(rev._id)} 
                    className={`py-2.5 px-4.5 rounded-lg text-[13px] font-semibold cursor-pointer flex items-center gap-2 transition-colors border ${rev.status === "active" ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800" : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"}`}
                  >
                    {rev.status === "active" ? <><EyeOff size={15}/> Ẩn</> : <><Eye size={15}/> Hiện</>}
                  </button>
                  <button 
                    onClick={() => openReplyBox(rev)} 
                    className="bg-blue-50 text-blue-600 border border-blue-200 py-2.5 px-4.5 rounded-lg text-[13px] font-semibold cursor-pointer flex items-center gap-2 transition-colors hover:bg-blue-100"
                  >
                    <MessageSquare size={15}/> {rev.adminReply ? "Sửa phản hồi" : "Trả lời"}
                  </button>
                  <button 
                    onClick={() => handleDelete(rev._id)} 
                    className="bg-red-50 text-red-500 border border-red-200 py-2.5 px-4.5 rounded-lg text-[13px] font-semibold cursor-pointer flex items-center gap-2 transition-colors hover:bg-red-100"
                  >
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