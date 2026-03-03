import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Trash2, UserCog, Mail, Calendar, User, ShieldCheck } from "lucide-react";
import { toast, Toaster } from "sonner";
import "./ManageUser.css"; 

export default function ManageUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem("token");

  // Khởi tạo instance axios để dùng chung token
  const api = axios.create({
    baseURL: "http://localhost:5000/api/users",
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/all");
      setUsers(res.data);
    } catch (err) {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Thay đổi quyền hạn (Admin <-> User)
  const handleToggleRole = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    
    if (!window.confirm(`Xác nhận đổi quyền của "${user.name}" thành ${newRole.toUpperCase()}?`)) return;

    const loadingToast = toast.loading("Đang cập nhật...");
    try {
      await api.put(`/admin/${user._id}/role`, { role: newRole });
      toast.success(`Đã chuyển ${user.name} thành ${newRole}`, { id: loadingToast });
      fetchUsers();
    } catch (err) {
      toast.error("Lỗi khi cập nhật quyền", { id: loadingToast });
    }
  };

  // Xóa người dùng
  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa vĩnh viễn tài khoản "${name}"?`)) return;

    const loadingToast = toast.loading("Đang xóa...");
    try {
      await api.delete(`/admin/${id}`);
      toast.success("Đã xóa người dùng thành công", { id: loadingToast });
      fetchUsers();
    } catch (err) {
      toast.error("Lỗi khi xóa người dùng", { id: loadingToast });
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="manage-product"> {/* Kế thừa class để giữ độ rộng chuẩn */}
      <Toaster position="top-right" richColors />
      
      <div className="admin-header">
        <div className="header-left">
          <h2>Quản lý Thành viên</h2>
          <div className="search-box">
            <Search size={18} color="#64748b" />
            <input 
              placeholder="Tìm theo tên hoặc email..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
        <div className="user-stats">
            Tổng cộng: <strong>{users.length}</strong> thành viên
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Thông tin liên lạc</th>
              <th>Quyền hạn</th>
              <th>Ngày gia nhập</th>
              <th style={{ textAlign: "center" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{textAlign:'center', padding:'40px'}}>Đang tải dữ liệu...</td></tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="user-info-cell">
                      <div className="user-avatar">
                        {u.avatar ? <img src={u.avatar} alt="avt" /> : <span>{u.name?.charAt(0).toUpperCase()}</span>}
                      </div>
                      <div>
                        <div className="user-name-text">{u.name}</div>
                        <div className="user-id-text">ID: {u._id.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="user-contact">
                      <div className="contact-item"><Mail size={14} /> {u.email}</div>
                      {u.phone && <div className="contact-item">📞 {u.phone}</div>}
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${u.role}`}>
                      {u.role === "admin" ? <ShieldCheck size={12} /> : <User size={12} />}
                      {u.role?.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="user-date">
                      <Calendar size={14} /> {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="actions" style={{ justifyContent: "center" }}>
                    <button 
                      className="edit-btn" 
                      title="Thay đổi quyền"
                      onClick={() => handleToggleRole(u)}
                    >
                      <UserCog size={18} />
                    </button>
                    <button 
                      className="delete-btn" 
                      title="Xóa tài khoản"
                      onClick={() => handleDeleteUser(u._id, u.name)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" style={{textAlign:'center', padding:'40px'}}>Không tìm thấy người dùng phù hợp</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}