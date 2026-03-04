import React, { useState, useEffect } from "react";
import axios from "axios";
import { Eye, Trash2, Search, X, CheckCircle, Mail, Clock } from "lucide-react";
import { toast } from "sonner";
import "./ManageFeedback.css";

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
      const res = await axios.get("http://localhost:5000/api/feedbacks/admin", {
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
        `http://localhost:5000/api/feedbacks/admin/${selectedFeedback._id}`,
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
      await axios.delete(`http://localhost:5000/api/feedbacks/admin/${id}`, {
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
      case "new": return <span className="fb-badge fb-badge-new">Mới gửi</span>;
      case "read": return <span className="fb-badge fb-badge-read">Đã xem</span>;
      case "resolved": return <span className="fb-badge fb-badge-resolved">Đã giải quyết</span>;
      default: return null;
    }
  };

  return (
    <div className="manage-feedback-container">
      {/* TOOLBAR & FILTER */}
      <div className="fb-toolbar">
        <h2>Quản lý Phản hồi & Góp ý</h2>
        <div className="fb-filters">
          <label>Lọc theo trạng thái:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="fb-filter-select"
          >
            <option value="all">Tất cả phản hồi</option>
            <option value="new">Mới gửi chưa xem</option>
            <option value="read">Đã xem (Đang xử lý)</option>
            <option value="resolved">Đã giải quyết xong</option>
          </select>
        </div>
      </div>

      {/* DANH SÁCH BẢNG */}
      <div className="fb-table-container">
        {loading ? (
          <div className="fb-message">Đang tải dữ liệu...</div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="fb-message">Không có phản hồi nào trong mục này.</div>
        ) : (
          <table className="fb-table">
            <thead>
              <tr>
                <th>Ngày gửi</th>
                <th>Khách hàng</th>
                <th>Chủ đề (Subject)</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.map((fb) => (
                <tr key={fb._id} className={fb.status === "new" ? "fb-row-new" : ""}>
                  <td>{new Date(fb.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <div className="fb-user-info">
                      <span className="fb-name">{fb.name}</span>
                      <span className="fb-email">{fb.email}</span>
                    </div>
                  </td>
                  <td className="fb-subject">{fb.subject}</td>
                  <td>{renderStatusBadge(fb.status)}</td>
                  <td className="fb-actions">
                    <button onClick={() => openModal(fb)} className="btn-icon btn-blue" title="Xem chi tiết">
                      <Eye size={16} /> Xem
                    </button>
                    <button onClick={() => handleDelete(fb._id)} className="btn-icon btn-red" title="Xóa">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL XEM CHI TIẾT & XỬ LÝ */}
      {showModal && selectedFeedback && (
        <div className="fb-modal-overlay">
          <div className="fb-modal-content">
            <div className="fb-modal-header">
              <h3>Chi tiết Phản hồi</h3>
              <button className="fb-close-btn" onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>
            
            <div className="fb-modal-body">
              {/* Thông tin từ khách gửi (Đọc/Không sửa được) */}
              <div className="fb-customer-section">
                <div className="fb-row">
                  <strong><Mail size={14} className="inline-icon"/> Người gửi:</strong> {selectedFeedback.name} ({selectedFeedback.email})
                </div>
                <div className="fb-row">
                  <strong><Clock size={14} className="inline-icon"/> Thời gian:</strong> {new Date(selectedFeedback.createdAt).toLocaleString('vi-VN')}
                </div>
                <div className="fb-row">
                  <strong>Chủ đề:</strong> <span style={{color: '#2563EB', fontWeight: 600}}>{selectedFeedback.subject}</span>
                </div>
                <div className="fb-message-box">
                  <strong>Nội dung:</strong>
                  <p>{selectedFeedback.message}</p>
                </div>
              </div>

              {/* Khu vực xử lý của Admin */}
              <form onSubmit={handleUpdate} className="fb-admin-section">
                <div className="fb-form-group">
                  <label>Cập nhật trạng thái:</label>
                  <select 
                    value={updateStatus} 
                    onChange={(e) => setUpdateStatus(e.target.value)}
                  >
                    <option value="new">Mới gửi</option>
                    <option value="read">Đã xem (Đang xử lý)</option>
                    <option value="resolved">Đã giải quyết</option>
                  </select>
                </div>

                <div className="fb-form-group">
                  <label>Ghi chú nội bộ (Chỉ Admin xem):</label>
                  <textarea 
                    value={adminNote} 
                    onChange={(e) => setAdminNote(e.target.value)} 
                    placeholder="Ghi chú lại cách bạn đã giải quyết vấn đề này..."
                    rows="4"
                  ></textarea>
                </div>

                <div className="fb-modal-footer">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-cancel" disabled={isSubmitting}>Hủy</button>
                  <button type="submit" className="btn-submit" disabled={isSubmitting}>
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