import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Ticket, X } from "lucide-react";
import "./ManageVoucher.css";

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
        <div className="manage-voucher-container">
            {/* Toolbar */}
            <div className="mv-toolbar">
                <div className="mv-search">
                    <Search size={16} color="#94A3B8" />
                    <input
                        type="text"
                        placeholder="Tìm theo mã hoặc mô tả..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn-create-voucher" onClick={openCreateModal}>
                    <Plus size={16} /> Tạo Voucher Mới
                </button>
            </div>

            {/* Table */}
            {filteredVouchers.length === 0 ? (
                <div className="mv-empty-state">
                    <Ticket size={48} />
                    <h3>Chưa có voucher nào</h3>
                    <p>Nhấn "Tạo Voucher Mới" để bắt đầu</p>
                </div>
            ) : (
                <div className="mv-table-wrapper">
                    <table className="mv-table">
                        <thead>
                            <tr>
                                <th>Mã</th>
                                <th>Loại</th>
                                <th>Giá trị</th>
                                <th>Đơn tối thiểu</th>
                                <th>Hết hạn</th>
                                <th>Đã dùng</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVouchers.map((v) => (
                                <tr key={v._id}>
                                    <td><span className="mv-code">{v.code}</span></td>
                                    <td>
                                        <span className={`mv-badge ${v.discountType}`}>
                                            {v.discountType === "percentage" ? "Phần trăm" : "Cố định"}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>
                                        {v.discountType === "percentage"
                                            ? `${v.value}%`
                                            : `${v.value.toLocaleString()}đ`}
                                    </td>
                                    <td>{v.minOrderValue ? `${v.minOrderValue.toLocaleString()}đ` : "—"}</td>
                                    <td>{new Date(v.expiryDate).toLocaleDateString("vi-VN")}</td>
                                    <td>
                                        <span className="mv-usage">
                                            {v.usedCount}/{v.usageLimit}
                                        </span>
                                    </td>
                                    <td>{getStatusBadge(v)}</td>
                                    <td>
                                        <div className="mv-actions">
                                            <button className="mv-btn-edit" onClick={() => openEditModal(v)}>
                                                <Pencil size={14} /> Sửa
                                            </button>
                                            <button className="mv-btn-delete" onClick={() => handleDelete(v._id)}>
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
                <div className="mv-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="mv-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="mv-modal-header">
                            <h2>{editingId ? "Chỉnh sửa Voucher" : "Tạo Voucher Mới"}</h2>
                            <button className="mv-modal-close" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mv-modal-body">
                            <div className="mv-form-group">
                                <label>Mã Voucher *</label>
                                <input
                                    type="text"
                                    name="code"
                                    placeholder="VD: GIAM50K, SALE10"
                                    value={form.code}
                                    onChange={handleChange}
                                    style={{ textTransform: "uppercase" }}
                                />
                            </div>

                            <div className="mv-form-row">
                                <div className="mv-form-group">
                                    <label>Loại giảm giá *</label>
                                    <select name="discountType" value={form.discountType} onChange={handleChange}>
                                        <option value="percentage">Phần trăm (%)</option>
                                        <option value="fixed">Số tiền cố định (VNĐ)</option>
                                    </select>
                                </div>
                                <div className="mv-form-group">
                                    <label>Giá trị * {form.discountType === "percentage" ? "(%)" : "(VNĐ)"}</label>
                                    <input
                                        type="number"
                                        name="value"
                                        placeholder={form.discountType === "percentage" ? "VD: 10" : "VD: 50000"}
                                        value={form.value}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="mv-form-row">
                                <div className="mv-form-group">
                                    <label>Đơn hàng tối thiểu (VNĐ)</label>
                                    <input
                                        type="number"
                                        name="minOrderValue"
                                        placeholder="VD: 500000"
                                        value={form.minOrderValue}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>
                                <div className="mv-form-group">
                                    <label>Giảm tối đa (VNĐ)</label>
                                    <input
                                        type="number"
                                        name="maxDiscountAmount"
                                        placeholder="Để trống = không giới hạn"
                                        value={form.maxDiscountAmount}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="mv-form-row">
                                <div className="mv-form-group">
                                    <label>Ngày hết hạn *</label>
                                    <input
                                        type="date"
                                        name="expiryDate"
                                        value={form.expiryDate}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="mv-form-group">
                                    <label>Tổng lượt dùng</label>
                                    <input
                                        type="number"
                                        name="usageLimit"
                                        placeholder="VD: 100"
                                        value={form.usageLimit}
                                        onChange={handleChange}
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div className="mv-form-group">
                                <label>Mô tả</label>
                                <input
                                    type="text"
                                    name="description"
                                    placeholder="VD: Giảm 10% cho đơn từ 500K"
                                    value={form.description}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mv-form-group" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={form.isActive}
                                    onChange={handleChange}
                                    style={{ width: "auto" }}
                                />
                                <label style={{ margin: 0, cursor: "pointer" }}>Kích hoạt ngay</label>
                            </div>

                            <div className="mv-form-group" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <input
                                    type="checkbox"
                                    name="isPublic"
                                    checked={form.isPublic}
                                    onChange={handleChange}
                                    style={{ width: "auto" }}
                                />
                                <label style={{ margin: 0, cursor: "pointer" }}>Phát công khai (mọi khách hàng đều thấy mã này)</label>
                            </div>

                            <div className="mv-form-group" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <input
                                    type="checkbox"
                                    name="isShocking"
                                    checked={form.isShocking}
                                    onChange={handleChange}
                                    style={{ width: "auto" }}
                                />
                                <label style={{ margin: 0, cursor: "pointer" }}>
                                    🔔 Thông báo mã giảm giá sốc (đẩy thông báo tới tất cả khách hàng)
                                </label>
                            </div>
                        </div>

                        <div className="mv-modal-footer">
                            <button className="mv-btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                            <button className="mv-btn-save" onClick={handleSubmit}>
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
