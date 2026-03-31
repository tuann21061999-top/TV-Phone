import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Ticket, X } from "lucide-react";

const INITIAL_FORM = {
    code: "",
    discountType: "percentage",
    value: "",
    minOrderValue: "",
    maxDiscountAmount: "",
    expiryDate: "",
    usageLimit: "100",
    description: "",
    isActive: true,
    isPublic: true,
    isShocking: false,
};

function ManageVoucher() {
    const [vouchers, setVouchers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(INITIAL_FORM);

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    /* =============== FETCH =============== */
    const fetchVouchers = async () => {
        try {
            const { data } = await axios.get("http://localhost:5000/api/vouchers/admin", { headers });
            setVouchers(data);
        } catch (error) {
            toast.error("Lỗi tải danh sách voucher!");
            console.error(error);
        }
    };

    useEffect(() => {
        fetchVouchers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* =============== HANDLERS =============== */
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const openCreateModal = () => {
        setForm(INITIAL_FORM);
        setEditingId(null);
        setShowModal(true);
    };

    const openEditModal = (voucher) => {
        setForm({
            code: voucher.code,
            discountType: voucher.discountType,
            value: voucher.value.toString(),
            minOrderValue: voucher.minOrderValue?.toString() || "",
            maxDiscountAmount: voucher.maxDiscountAmount?.toString() || "",
            expiryDate: voucher.expiryDate ? voucher.expiryDate.slice(0, 10) : "",
            usageLimit: voucher.usageLimit?.toString() || "100",
            description: voucher.description || "",
            isActive: voucher.isActive,
            isPublic: voucher.isPublic !== false,
            isShocking: false,
        });
        setEditingId(voucher._id);
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!form.code || !form.value || !form.expiryDate) {
            toast.error("Vui lòng điền đầy đủ: Mã, Giá trị, Ngày hết hạn!");
            return;
        }

        const payload = {
            code: form.code,
            discountType: form.discountType,
            value: Number(form.value),
            minOrderValue: Number(form.minOrderValue) || 0,
            maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
            expiryDate: form.expiryDate,
            usageLimit: Number(form.usageLimit) || 100,
            description: form.description,
            isActive: form.isActive,
            isPublic: form.isPublic,
            isShocking: form.isShocking,
        };

        try {
            if (editingId) {
                await axios.put(`http://localhost:5000/api/vouchers/admin/${editingId}`, payload, { headers });
                toast.success("Cập nhật voucher thành công!");
            } else {
                await axios.post("http://localhost:5000/api/vouchers/admin", payload, { headers });
                toast.success("Tạo voucher thành công!");
            }
            setShowModal(false);
            fetchVouchers();
        } catch (error) {
            const msg = error.response?.data?.message || "Lỗi lưu voucher!";
            toast.error(msg);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn chắc chắn muốn xóa voucher này?")) return;

        try {
            await axios.delete(`http://localhost:5000/api/vouchers/admin/${id}`, { headers });
            toast.success("Xóa voucher thành công!");
            fetchVouchers();
        } catch (error) {
            toast.error("Lỗi xóa voucher!");
        }
    };

    /* =============== HELPERS =============== */
    const getStatusBadge = (voucher) => {
        if (!voucher.isActive) return <span className="mv-badge inactive">Vô hiệu</span>;
        if (new Date(voucher.expiryDate) < new Date()) return <span className="mv-badge expired">Hết hạn</span>;
        return <span className="mv-badge active">Hoạt động</span>;
    };

    const filteredVouchers = vouchers.filter((v) =>
        v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.description && v.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    /* =============== RENDER =============== */
    return (
        <div className="flex flex-col gap-5 w-full max-w-full box-border font-sans p-4 md:p-8 bg-slate-50 min-h-screen">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg py-2.5 px-4 w-full md:w-[350px] shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
                    <Search size={16} className="text-slate-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Tìm theo mã hoặc mô tả..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-none outline-none w-full text-sm text-slate-800 bg-transparent"
                    />
                </div>
                <button 
                    className="bg-gradient-to-br from-blue-600 to-purple-600 text-white border-none py-2.5 px-5 rounded-lg font-semibold text-sm cursor-pointer flex items-center justify-center gap-1.5 transition-all hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] w-full md:w-auto" 
                    onClick={openCreateModal}
                >
                    <Plus size={16} /> Tạo Voucher Mới
                </button>
            </div>

            {/* Table */}
            {filteredVouchers.length === 0 ? (
                <div className="text-center py-16 px-5 text-slate-400 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <Ticket size={48} className="mx-auto mb-4 opacity-50" />
                    <h3 className="text-slate-500 font-bold text-lg m-0 mb-2">Chưa có voucher nào</h3>
                    <p className="m-0 text-sm">Nhấn "Tạo Voucher Mới" để bắt đầu</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto w-full">
                    <table className="w-full min-w-[900px] border-collapse text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">Mã</th>
                                <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">Loại</th>
                                <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">Giá trị</th>
                                <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">Đơn tối thiểu</th>
                                <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">Hết hạn</th>
                                <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">Đã dùng</th>
                                <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">Trạng thái</th>
                                <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVouchers.map((v) => (
                                <tr key={v._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="py-3.5 px-4 align-middle">
                                        <span className="font-mono font-bold text-purple-600 bg-purple-50 py-1 px-2.5 rounded-md text-[13px]">{v.code}</span>
                                    </td>
                                    <td className="py-3.5 px-4 align-middle">
                                        <span className={`inline-flex items-center py-1 px-2.5 rounded-md text-xs font-semibold whitespace-nowrap ${v.discountType === "percentage" ? "bg-indigo-100 text-indigo-700" : "bg-blue-100 text-blue-700"}`}>
                                            {v.discountType === "percentage" ? "Phần trăm" : "Cố định"}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 align-middle font-semibold text-slate-700 text-sm">
                                        {v.discountType === "percentage"
                                            ? `${v.value}%`
                                            : `${v.value.toLocaleString()}đ`}
                                    </td>
                                    <td className="py-3.5 px-4 align-middle text-sm text-slate-600">
                                        {v.minOrderValue ? `${v.minOrderValue.toLocaleString()}đ` : "—"}
                                    </td>
                                    <td className="py-3.5 px-4 align-middle text-sm text-slate-600">
                                        {new Date(v.expiryDate).toLocaleDateString("vi-VN")}
                                    </td>
                                    <td className="py-3.5 px-4 align-middle">
                                        <span className="text-[13px] text-slate-500 font-medium">
                                            {v.usedCount}/{v.usageLimit}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 align-middle">
                                        {!v.isActive ? (
                                            <span className="inline-flex items-center py-1 px-2.5 rounded-md text-xs font-semibold bg-red-100 text-red-700 whitespace-nowrap">Vô hiệu</span>
                                        ) : new Date(v.expiryDate) < new Date() ? (
                                            <span className="inline-flex items-center py-1 px-2.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-600 whitespace-nowrap">Hết hạn</span>
                                        ) : (
                                            <span className="inline-flex items-center py-1 px-2.5 rounded-md text-xs font-semibold bg-green-100 text-green-700 whitespace-nowrap">Hoạt động</span>
                                        )}
                                    </td>
                                    <td className="py-3.5 px-4 align-middle">
                                        <div className="flex gap-2">
                                            <button className="border-none py-1.5 px-3 rounded-md text-xs font-semibold cursor-pointer flex items-center gap-1 transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100" onClick={() => openEditModal(v)}>
                                                <Pencil size={14} /> Sửa
                                            </button>
                                            <button className="border-none py-1.5 px-3 rounded-md text-xs font-semibold cursor-pointer flex items-center gap-1 transition-colors bg-red-50 text-red-500 hover:bg-red-100" onClick={() => handleDelete(v._id)}>
                                                <Trash2 size={14} /> Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Tạo/Sửa */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-[9999] p-4 animate-[fadeIn_0.2s_ease-out]" onClick={() => setShowModal(false)}>
                    <div className="bg-white w-full max-w-[560px] rounded-2xl overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-5 px-6 border-b border-slate-200 shrink-0">
                            <h2 className="m-0 text-lg text-slate-800 font-bold">{editingId ? "Chỉnh sửa Voucher" : "Tạo Voucher Mới"}</h2>
                            <button className="bg-transparent border-none text-slate-400 hover:text-red-500 cursor-pointer flex p-1 transition-colors" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 max-h-[70vh] overflow-y-auto flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="block text-[13px] font-semibold text-slate-600">M Mã Voucher *</label>
                                <input
                                    type="text"
                                    name="code"
                                    placeholder="VD: GIAM50K, SALE10"
                                    value={form.code}
                                    onChange={handleChange}
                                    className="w-full p-2.5 px-3.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50 box-border transition-all focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10 focus:bg-white uppercase"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="block text-[13px] font-semibold text-slate-600">Loại giảm giá *</label>
                                    <select 
                                        name="discountType" 
                                        value={form.discountType} 
                                        onChange={handleChange}
                                        className="w-full p-2.5 px-3.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50 box-border transition-all focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10 focus:bg-white appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:16px_16px]"
                                    >
                                        <option value="percentage">Phần trăm (%)</option>
                                        <option value="fixed">Số tiền cố định (VNĐ)</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="block text-[13px] font-semibold text-slate-600">Giá trị * {form.discountType === "percentage" ? "(%)" : "(VNĐ)"}</label>
                                    <input
                                        type="number"
                                        name="value"
                                        placeholder={form.discountType === "percentage" ? "VD: 10" : "VD: 50000"}
                                        value={form.value}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full p-2.5 px-3.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50 box-border transition-all focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="block text-[13px] font-semibold text-slate-600">Đơn hàng tối thiểu (VNĐ)</label>
                                    <input
                                        type="number"
                                        name="minOrderValue"
                                        placeholder="VD: 500000"
                                        value={form.minOrderValue}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full p-2.5 px-3.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50 box-border transition-all focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10 focus:bg-white"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="block text-[13px] font-semibold text-slate-600">Giảm tối đa (VNĐ)</label>
                                    <input
                                        type="number"
                                        name="maxDiscountAmount"
                                        placeholder="Để trống = không giới hạn"
                                        value={form.maxDiscountAmount}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full p-2.5 px-3.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50 box-border transition-all focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="block text-[13px] font-semibold text-slate-600">Ngày hết hạn *</label>
                                    <input
                                        type="date"
                                        name="expiryDate"
                                        value={form.expiryDate}
                                        onChange={handleChange}
                                        className="w-full p-2.5 px-3.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50 box-border transition-all focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10 focus:bg-white"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="block text-[13px] font-semibold text-slate-600">Tổng lượt dùng</label>
                                    <input
                                        type="number"
                                        name="usageLimit"
                                        placeholder="VD: 100"
                                        value={form.usageLimit}
                                        onChange={handleChange}
                                        min="1"
                                        className="w-full p-2.5 px-3.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50 box-border transition-all focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="block text-[13px] font-semibold text-slate-600">Mô tả</label>
                                <input
                                    type="text"
                                    name="description"
                                    placeholder="VD: Giảm 10% cho đơn từ 500K"
                                    value={form.description}
                                    onChange={handleChange}
                                    className="w-full p-2.5 px-3.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50 box-border transition-all focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10 focus:bg-white"
                                />
                            </div>

                            <div className="flex flex-col gap-3 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer text-[13px] font-medium text-slate-700">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={form.isActive}
                                        onChange={handleChange}
                                        className="w-4 h-4 cursor-pointer accent-blue-600"
                                    />
                                    Kích hoạt ngay
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer text-[13px] font-medium text-slate-700">
                                    <input
                                        type="checkbox"
                                        name="isPublic"
                                        checked={form.isPublic}
                                        onChange={handleChange}
                                        className="w-4 h-4 cursor-pointer accent-blue-600"
                                    />
                                    Phát công khai (mọi khách hàng đều thấy mã này)
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer text-[13px] font-medium text-slate-700">
                                    <input
                                        type="checkbox"
                                        name="isShocking"
                                        checked={form.isShocking}
                                        onChange={handleChange}
                                        className="w-4 h-4 cursor-pointer accent-red-500"
                                    />
                                    🔔 Thông báo mã giảm giá sốc (đẩy thông báo tới tất cả khách hàng)
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-4 px-6 border-t border-slate-200 shrink-0 bg-slate-50/50">
                            <button className="bg-white text-slate-600 border border-slate-300 py-2.5 px-5 rounded-lg font-semibold text-sm cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setShowModal(false)}>Hủy</button>
                            <button className="bg-gradient-to-br from-blue-600 to-purple-600 text-white border-none py-2.5 px-6 rounded-lg font-semibold text-sm cursor-pointer transition-all hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:-translate-y-[1px]" onClick={handleSubmit}>
                                {editingId ? "Cập nhật" : "Tạo voucher"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageVoucher;
