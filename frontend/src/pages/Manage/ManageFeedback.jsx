import React, { useState, useEffect } from "react";
import axios from "axios";
import { Eye, Trash2, Search, X, CheckCircle, Mail, Clock } from "lucide-react";
import { toast } from "sonner";

const ManageFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'new', 'read', 'resolved'

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  
  // State cập nhật cho Admin
  const [updateStatus, setUpdateStatus] = useState("new");
  const [adminNote, setAdminNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/feedbacks/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbacks(res.data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách phản hồi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const openModal = (feedback) => {
    setSelectedFeedback(feedback);
    setUpdateStatus(feedback.status);
    setAdminNote(feedback.adminNote || "");
    
    // Nếu tin nhắn đang là 'new', khi Admin mở lên xem tự động chuyển thành 'read' (Tùy chọn UX)
    if (feedback.status === "new") {
      setUpdateStatus("read");
    }
    
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/feedbacks/admin/${selectedFeedback._id}`,
        { status: updateStatus, adminNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Cập nhật phản hồi thành công!");
      setShowModal(false);
      fetchFeedbacks();
    } catch (error) {
      toast.error("Lỗi khi cập nhật phản hồi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa vĩnh viễn phản hồi này?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/feedbacks/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Đã xóa phản hồi");
      fetchFeedbacks();
    } catch (error) {
      toast.error("Lỗi khi xóa phản hồi");
    }
  };

  // Lọc dữ liệu theo trạng thái
  const filteredFeedbacks = feedbacks.filter(fb => 
    filterStatus === "all" ? true : fb.status === filterStatus
  );

  // Hàm render Badge Trạng thái
  const renderStatusBadge = (status) => {
    switch (status) {
      case "new": return <span className="py-[6px] px-[12px] rounded-[20px] text-[12px] font-semibold inline-block bg-[#DBEAFE] text-[#2563EB]">Mới gửi</span>;
      case "read": return <span className="py-[6px] px-[12px] rounded-[20px] text-[12px] font-semibold inline-block bg-[#FEF3C7] text-[#D97706]">Đã xem</span>;
      case "resolved": return <span className="py-[6px] px-[12px] rounded-[20px] text-[12px] font-semibold inline-block bg-[#D1FAE5] text-[#059669]">Đã giải quyết</span>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-[20px] w-full font-sans text-[#1E293B]">
      {/* TOOLBAR & FILTER */}
      <div className="flex justify-between items-center pb-[16px] border-b-[2px] border-[#E2E8F0]">
        <h2 className="m-0 text-[24px] font-extrabold text-[#0F172A]">Quản lý Phản hồi & Góp ý</h2>
        <div className="flex items-center gap-[12px] text-[14px] font-medium">
          <label>Lọc theo trạng thái:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-[8px] px-[12px] rounded-[8px] border border-[#CBD5E1] outline-none bg-[#F8FAFC] cursor-pointer font-medium"
          >
            <option value="all">Tất cả phản hồi</option>
            <option value="new">Mới gửi chưa xem</option>
            <option value="read">Đã xem (Đang xử lý)</option>
            <option value="resolved">Đã giải quyết xong</option>
          </select>
        </div>
      </div>

      {/* DANH SÁCH BẢNG */}
      <div className="bg-white rounded-[12px] border border-[#E2E8F0] overflow-hidden">
        {loading ? (
          <div className="text-center py-[40px] text-[#64748B] text-[15px]">Đang tải dữ liệu...</div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="text-center py-[40px] text-[#64748B] text-[15px]">Không có phản hồi nào trong mục này.</div>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className="bg-[#F8FAFC] py-[14px] px-[20px] text-[13px] font-semibold text-[#475569] border-b border-[#E2E8F0]">Ngày gửi</th>
                <th className="bg-[#F8FAFC] py-[14px] px-[20px] text-[13px] font-semibold text-[#475569] border-b border-[#E2E8F0]">Khách hàng</th>
                <th className="bg-[#F8FAFC] py-[14px] px-[20px] text-[13px] font-semibold text-[#475569] border-b border-[#E2E8F0]">Chủ đề (Subject)</th>
                <th className="bg-[#F8FAFC] py-[14px] px-[20px] text-[13px] font-semibold text-[#475569] border-b border-[#E2E8F0]">Trạng thái</th>
                <th className="bg-[#F8FAFC] py-[14px] px-[20px] text-[13px] font-semibold text-[#475569] border-b border-[#E2E8F0] text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.map((fb) => (
                <tr key={fb._id} className={`hover:bg-[#F8FAFC] transition-colors duration-150 ${fb.status === "new" ? "bg-[#EFF6FF] hover:bg-[#DBEAFE]" : ""}`}>
                  <td className="py-[16px] px-[20px] border-b border-[#E2E8F0] align-middle">{new Date(fb.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="py-[16px] px-[20px] border-b border-[#E2E8F0] align-middle">
                    <div className="flex flex-col gap-[4px]">
                      <span className="font-semibold text-[14px]">{fb.name}</span>
                      <span className="text-[12px] text-[#64748B]">{fb.email}</span>
                    </div>
                  </td>
                  <td className="py-[16px] px-[20px] border-b border-[#E2E8F0] align-middle font-medium max-w-[250px] whitespace-nowrap overflow-hidden text-ellipsis">{fb.subject}</td>
                  <td className="py-[16px] px-[20px] border-b border-[#E2E8F0] align-middle">{renderStatusBadge(fb.status)}</td>
                  <td className="py-[16px] px-[20px] border-b border-[#E2E8F0] align-middle">
                    <div className="flex gap-[8px] justify-center">
                      <button onClick={() => openModal(fb)} className="py-[6px] px-[12px] rounded-[6px] text-[13px] font-semibold cursor-pointer flex items-center gap-[6px] transition-colors bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] hover:bg-[#DBEAFE]" title="Xem chi tiết">
                        <Eye size={16} /> Xem
                      </button>
                      <button onClick={() => handleDelete(fb._id)} className="py-[6px] px-[12px] rounded-[6px] text-[13px] font-semibold cursor-pointer flex items-center gap-[6px] transition-colors bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA] hover:bg-[#FEE2E2]" title="Xóa">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL XEM CHI TIẾT & XỬ LÝ */}
      {showModal && selectedFeedback && (
        <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-[4px] flex items-center justify-center z-[9999]">
          <div className="bg-white w-[600px] max-h-[90vh] rounded-[16px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] flex flex-col">
            <div className="flex justify-between items-center py-[16px] px-[24px] bg-[#F8FAFC] border-b border-[#E2E8F0] shrink-0 rounded-t-[16px]">
              <h3 className="m-0 text-[18px] text-[#0F172A] font-bold">Chi tiết Phản hồi</h3>
              <button className="bg-transparent border-none cursor-pointer text-[#64748B] hover:text-[#0F172A] transition-colors" onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>
            
            <div className="p-[24px] overflow-y-auto flex flex-col gap-[24px]">
              {/* Thông tin từ khách gửi (Đọc/Không sửa được) */}
              <div className="bg-[#F8FAFC] p-[16px] rounded-[8px] border border-[#E2E8F0] flex flex-col gap-[10px] text-[14px]">
                <div className="text-[#475569]">
                  <strong className="text-[#1E293B]"><Mail size={14} className="relative top-[2px] text-[#94A3B8] mr-[4px] inline-block"/> Người gửi:</strong> {selectedFeedback.name} ({selectedFeedback.email})
                </div>
                <div className="text-[#475569]">
                  <strong className="text-[#1E293B]"><Clock size={14} className="relative top-[2px] text-[#94A3B8] mr-[4px] inline-block"/> Thời gian:</strong> {new Date(selectedFeedback.createdAt).toLocaleString('vi-VN')}
                </div>
                <div className="text-[#475569]">
                  <strong className="text-[#1E293B]">Chủ đề:</strong> <span className="text-[#2563EB] font-semibold">{selectedFeedback.subject}</span>
                </div>
                <div className="bg-white p-[12px] rounded-[8px] border border-[#E2E8F0] mt-[8px]">
                  <strong className="text-[#1E293B]">Nội dung:</strong>
                  <p className="mt-[8px] mb-0 mx-0 leading-[1.6] text-[#1E293B] whitespace-pre-wrap">{selectedFeedback.message}</p>
                </div>
              </div>

              {/* Khu vực xử lý của Admin */}
              <form onSubmit={handleUpdate} className="flex flex-col gap-[16px]">
                <div>
                  <label className="block text-[13px] font-semibold text-[#1E293B] mb-[8px]">Cập nhật trạng thái:</label>
                  <select 
                    value={updateStatus} 
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="w-full py-[10px] px-[14px] border border-[#CBD5E1] rounded-[8px] outline-none box-border font-sans transition-colors focus:border-[#2563EB]"
                  >
                    <option value="new">Mới gửi</option>
                    <option value="read">Đã xem (Đang xử lý)</option>
                    <option value="resolved">Đã giải quyết</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1E293B] mb-[8px]">Ghi chú nội bộ (Chỉ Admin xem):</label>
                  <textarea 
                    value={adminNote} 
                    onChange={(e) => setAdminNote(e.target.value)} 
                    placeholder="Ghi chú lại cách bạn đã giải quyết vấn đề này..."
                    rows="4"
                    className="w-full py-[10px] px-[14px] border border-[#CBD5E1] rounded-[8px] outline-none box-border font-sans resize-y transition-colors focus:border-[#2563EB]"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-[12px] border-t border-[#E2E8F0] pt-[20px]">
                  <button type="button" onClick={() => setShowModal(false)} className="bg-white border border-[#E2E8F0] py-[10px] px-[20px] rounded-[8px] font-semibold text-[#475569] cursor-pointer transition-colors hover:bg-slate-50" disabled={isSubmitting}>Hủy</button>
                  <button type="submit" className="bg-[#2563EB] text-white border-none py-[10px] px-[20px] rounded-[8px] font-semibold cursor-pointer flex items-center gap-[8px] transition-colors hover:bg-[#1D4ED8]" disabled={isSubmitting}>
                    <CheckCircle size={16} /> {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFeedback;