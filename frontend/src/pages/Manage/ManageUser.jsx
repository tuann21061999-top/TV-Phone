import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Trash2, UserCog, Mail, Calendar, User, ShieldCheck } from "lucide-react";
import { toast, Toaster } from "sonner";

export default function ManageUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem("token");

  // Khởi tạo instance axios để dùng chung token
  const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api/users`,
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
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
      <Toaster position="top-right" richColors />
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div className="w-full md:w-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3 m-0">Quản lý Thành viên</h2>
          <div className="flex items-center bg-white border border-slate-200 p-2.5 px-4 rounded-xl w-full sm:w-[340px] focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all shadow-sm">
            <Search size={18} className="text-slate-500 shrink-0" />
            <input 
              placeholder="Tìm theo tên hoặc email..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="border-none outline-none ml-2.5 w-full text-sm text-slate-800 bg-transparent"
            />
          </div>
        </div>
        <div className="hidden md:block text-sm text-slate-500 bg-white py-2.5 px-5 rounded-xl border border-slate-200 shadow-sm">
            Tổng cộng: <strong className="text-slate-800">{users.length}</strong> thành viên
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl overflow-x-auto border border-slate-200 w-full box-border shadow-sm">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="bg-slate-50 border-b-2 border-slate-200">
              <th className="p-4 font-semibold text-slate-600 text-[13px] uppercase tracking-wide whitespace-nowrap">Người dùng</th>
              <th className="p-4 font-semibold text-slate-600 text-[13px] uppercase tracking-wide whitespace-nowrap">Thông tin liên lạc</th>
              <th className="p-4 font-semibold text-slate-600 text-[13px] uppercase tracking-wide whitespace-nowrap">Quyền hạn</th>
              <th className="p-4 font-semibold text-slate-600 text-[13px] uppercase tracking-wide whitespace-nowrap">Ngày gia nhập</th>
              <th className="p-4 font-semibold text-slate-600 text-[13px] uppercase tracking-wide whitespace-nowrap text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-10 text-slate-500">Đang tải dữ liệu...</td></tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <tr key={u._id} className="group border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold text-base overflow-hidden shrink-0 border-2 border-white shadow-sm transition-transform duration-200 group-hover:scale-110">
                        {u.avatar ? <img src={u.avatar} alt="avt" className="w-full h-full object-cover" /> : <span>{u.name?.charAt(0).toUpperCase()}</span>}
                      </div>
                      <div className="flex flex-col">
                        <div className="font-bold text-slate-800 text-sm">{u.name}</div>
                        <div className="text-[11px] text-slate-400">ID: {u._id.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-[13px] text-slate-600"><Mail size={14} className="text-slate-400" /> {u.email}</div>
                      {u.phone && <div className="flex items-center gap-1.5 text-[13px] text-slate-600">📞 {u.phone}</div>}
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-[11px] font-extrabold tracking-wide uppercase ${
                        u.role === "admin" ? "bg-red-50 text-red-600 border border-red-200" : "bg-slate-50 text-slate-600 border border-slate-200"
                    }`}>
                      {u.role === "admin" ? <ShieldCheck size={12} /> : <User size={12} />}
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-1.5 text-[13px] text-slate-500">
                      <Calendar size={14} className="text-slate-400" /> {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex justify-center gap-2">
                      <button 
                        className="inline-flex items-center justify-center p-2 rounded-lg border-none cursor-pointer transition-all bg-blue-50 text-blue-600 hover:bg-blue-100" 
                        title="Thay đổi quyền"
                        onClick={() => handleToggleRole(u)}
                      >
                        <UserCog size={18} />
                      </button>
                      <button 
                        className="inline-flex items-center justify-center p-2 rounded-lg border-none cursor-pointer transition-all bg-red-50 text-red-500 hover:bg-red-100" 
                        title="Xóa tài khoản"
                        onClick={() => handleDeleteUser(u._id, u.name)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="text-center py-10 text-slate-500">Không tìm thấy người dùng phù hợp</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}