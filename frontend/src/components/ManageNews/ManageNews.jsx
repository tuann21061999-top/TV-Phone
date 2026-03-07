import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
    Plus, Edit, Trash2, Search, X, Image as ImageIcon,
    Type, ArrowUp, ArrowDown, Link2
} from "lucide-react";
import "./ManageNews.css";

const API = "http://localhost:5000/api";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const CATEGORIES = ["Đánh giá", "Mẹo hay", "Thị trường", "Khuyến mãi", "Thủ thuật", "Custom ROM", "Khác"];

function ManageNews() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [products, setProducts] = useState([]);
    const [productSearch, setProductSearch] = useState("");

    const [formConfig, setFormConfig] = useState({ title: "Thêm Bài Viết Mới", isEdit: false, editId: null });

    const emptyForm = {
        title: "",
        shortDescription: "",
        thumbnail: "",
        category: "Khác",
        contentBlocks: [],
        relatedProduct: "",
        isActive: true,
    };
    const [form, setForm] = useState(emptyForm);
    const [thumbPreview, setThumbPreview] = useState(null);

    const token = localStorage.getItem("token");
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    /* ===== FETCH ===== */
    const fetchNews = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API}/news/admin/all`, authHeader);
            setNews(data);
        } catch { toast.error("Lỗi tải danh sách bài viết"); }
        finally { setLoading(false); }
    };

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get(`${API}/products`);
            setProducts(data);
        } catch { console.error("Lỗi tải danh sách sản phẩm"); }
    };

    useEffect(() => { fetchNews(); fetchProducts(); }, []);

    /* ===== IMAGE UPLOAD (Cloudinary via middleware) ===== */
    const uploadImage = async (file) => {
        if (file.size > MAX_FILE_SIZE) { toast.error("Ảnh quá lớn (>5MB)"); return null; }
        const fd = new FormData();
        fd.append("image", file);
        try {
            toast.loading("Đang tải ảnh…", { id: "img-up" });
            const { data } = await axios.post(`${API}/news/upload-image`, fd, authHeader);
            toast.success("Tải ảnh OK!", { id: "img-up" });
            return data.imageUrl;
        } catch {
            toast.error("Lỗi upload ảnh", { id: "img-up" });
            return null;
        }
    };

    /* ===== THUMBNAIL UPLOAD ===== */
    const handleThumbUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setThumbPreview(URL.createObjectURL(file));
        const url = await uploadImage(file);
        if (url) setForm((p) => ({ ...p, thumbnail: url }));
        else setThumbPreview(null);
    };

    /* ===== BLOCK MANAGEMENT ===== */
    const addBlock = (type) => {
        setForm((p) => ({
            ...p,
            contentBlocks: [...p.contentBlocks, { type, value: "" }],
        }));
    };

    const updateBlock = (idx, value) => {
        setForm((p) => {
            const blocks = [...p.contentBlocks];
            blocks[idx] = { ...blocks[idx], value };
            return { ...p, contentBlocks: blocks };
        });
    };

    const removeBlock = (idx) => {
        setForm((p) => ({
            ...p,
            contentBlocks: p.contentBlocks.filter((_, i) => i !== idx),
        }));
    };

    const moveBlock = (idx, dir) => {
        setForm((p) => {
            const blocks = [...p.contentBlocks];
            const target = idx + dir;
            if (target < 0 || target >= blocks.length) return p;
            [blocks[idx], blocks[target]] = [blocks[target], blocks[idx]];
            return { ...p, contentBlocks: blocks };
        });
    };

    const handleBlockImageUpload = async (idx, e) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = await uploadImage(file);
        if (url) updateBlock(idx, url);
    };

    /* ===== MODAL ===== */
    const openAddModal = () => {
        setForm(emptyForm);
        setThumbPreview(null);
        setProductSearch("");
        setFormConfig({ title: "Thêm Bài Viết Mới", isEdit: false, editId: null });
        setShowModal(true);
    };

    const openEditModal = (a) => {
        setForm({
            title: a.title,
            shortDescription: a.shortDescription,
            thumbnail: a.thumbnail,
            category: a.category,
            contentBlocks: a.contentBlocks || [],
            relatedProduct: a.relatedProduct?._id || a.relatedProduct || "",
            isActive: a.isActive,
        });
        setThumbPreview(a.thumbnail);
        const linked = products.find((p) => p._id === (a.relatedProduct?._id || a.relatedProduct));
        setProductSearch(linked ? linked.name : "");
        setFormConfig({ title: "Chỉnh sửa bài viết", isEdit: true, editId: a._id });
        setShowModal(true);
    };

    const closeModal = () => { if (!isSubmitting) setShowModal(false); };

    /* ===== CRUD ===== */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.thumbnail) return toast.error("Vui lòng tải ảnh bìa");
        if (form.contentBlocks.length === 0) return toast.error("Bài viết cần ít nhất 1 khối nội dung");

        setIsSubmitting(true);
        try {
            const payload = { ...form };
            if (!payload.relatedProduct) delete payload.relatedProduct;
            // Lọc bỏ các block trống (ảnh chưa upload hoặc text rỗng)
            payload.contentBlocks = payload.contentBlocks.filter(b => b.value && b.value.trim() !== "");

            if (formConfig.isEdit) {
                await axios.put(`${API}/news/${formConfig.editId}`, payload, authHeader);
                toast.success("Cập nhật thành công!");
            } else {
                await axios.post(`${API}/news`, payload, authHeader);
                toast.success("Thêm bài viết thành công!");
            }
            fetchNews();
            setShowModal(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi lưu bài viết");
        } finally { setIsSubmitting(false); }
    };

    const toggleStatus = async (id) => {
        try {
            await axios.patch(`${API}/news/${id}/toggle`, {}, authHeader);
            fetchNews();
            toast.success("Đổi trạng thái thành công");
        } catch { toast.error("Lỗi"); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa bài viết này?")) return;
        try {
            await axios.delete(`${API}/news/${id}`, authHeader);
            fetchNews();
            toast.success("Đã xóa");
        } catch { toast.error("Lỗi xóa"); }
    };

    /* ===== PRODUCT SEARCH ===== */
    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    const filteredNews = news.filter((n) =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    /* ===== RENDER ===== */
    return (
        <div className="manage-news-container">
            <div className="manage-header">
                <h2>Quản lý Tin tức</h2>
                <button className="add-btn" onClick={openAddModal}><Plus size={18} /> Thêm bài viết</button>
            </div>

            <div className="controls-bar">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input type="text" placeholder="Tìm kiếm tiêu đề…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            {/* TABLE */}
            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Ảnh bìa</th><th>Tiêu đề</th><th>Danh mục</th><th>Sản phẩm</th><th>Ngày tạo</th><th>Lượt xem</th><th>Trạng thái</th><th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="8" className="text-center">Đang tải dữ liệu…</td></tr>
                        ) : filteredNews.length === 0 ? (
                            <tr><td colSpan="8" className="text-center">Chưa có bài viết nào.</td></tr>
                        ) : (
                            filteredNews.map((n) => (
                                <tr key={n._id}>
                                    <td><img src={n.thumbnail} alt="" className="news-thumb-sm" /></td>
                                    <td className="news-title-cell"><strong>{n.title}</strong></td>
                                    <td><span className="badge category-badge">{n.category}</span></td>
                                    <td>{n.relatedProduct?.name || "—"}</td>
                                    <td>{new Date(n.createdAt).toLocaleDateString("vi-VN")}</td>
                                    <td>{n.views}</td>
                                    <td>
                                        <button className={`status-btn ${n.isActive ? "active" : "inactive"}`} onClick={() => toggleStatus(n._id)}>
                                            {n.isActive ? "Hiển thị" : "Đã ẩn"}
                                        </button>
                                    </td>
                                    <td className="actions-cell">
                                        <button className="action-btn edit" onClick={() => openEditModal(n)}><Edit size={16} /></button>
                                        <button className="action-btn delete" onClick={() => handleDelete(n._id)}><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="news-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{formConfig.title}</h3>
                            <button className="close-btn" onClick={closeModal}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="news-form">
                            {/* Row 1: Title + Category */}
                            <div className="form-row">
                                <div className="form-group flex-2">
                                    <label>Tiêu đề <span className="req">*</span></label>
                                    <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nhập tiêu đề bài viết…" />
                                </div>
                                <div className="form-group flex-1">
                                    <label>Danh mục <span className="req">*</span></label>
                                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Short Desc */}
                            <div className="form-group">
                                <label>Mô tả ngắn <span className="req">*</span></label>
                                <textarea rows="2" required value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} placeholder="Đoạn mô tả ngắn hiển thị trên trang chủ…" />
                            </div>

                            {/* Thumbnail */}
                            <div className="form-row align-center">
                                <div className="form-group flex-1">
                                    <label>Ảnh bìa <span className="req">*</span></label>
                                    <input type="file" id="news-thumb" accept="image/*" onChange={handleThumbUpload} hidden />
                                    <label htmlFor="news-thumb" className="upload-label-btn"><ImageIcon size={16} /> Chọn ảnh bìa</label>
                                </div>
                                <div className="form-group flex-1">
                                    {thumbPreview && <div className="preview-img-box"><img src={thumbPreview} alt="Preview" /></div>}
                                </div>
                            </div>

                            {/* Product Selector */}
                            <div className="form-group">
                                <label><Link2 size={14} /> Liên kết sản phẩm (tùy chọn)</label>
                                <div className="product-selector">
                                    <input
                                        type="text"
                                        placeholder="Tìm tên sản phẩm…"
                                        value={productSearch}
                                        onChange={(e) => { setProductSearch(e.target.value); setForm({ ...form, relatedProduct: "" }); }}
                                    />
                                    {productSearch && !form.relatedProduct && (
                                        <div className="product-dropdown">
                                            {filteredProducts.slice(0, 8).map((p) => (
                                                <div key={p._id} className="product-option" onClick={() => { setForm({ ...form, relatedProduct: p._id }); setProductSearch(p.name); }}>
                                                    {p.colorImages?.[0]?.images?.[0] && <img src={p.colorImages[0].images[0]} alt="" className="product-option-img" />}
                                                    <span>{p.name}</span>
                                                </div>
                                            ))}
                                            {filteredProducts.length === 0 && <div className="product-option disabled">Không tìm thấy sản phẩm</div>}
                                        </div>
                                    )}
                                    {form.relatedProduct && (
                                        <button type="button" className="clear-product" onClick={() => { setForm({ ...form, relatedProduct: "" }); setProductSearch(""); }}>
                                            <X size={14} /> Bỏ liên kết
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* ===== BLOCK EDITOR ===== */}
                            <div className="form-group">
                                <label>Nội dung bài viết <span className="req">*</span></label>
                                <div className="block-editor">
                                    {form.contentBlocks.map((block, idx) => (
                                        <div key={idx} className="block-item">
                                            <div className="block-toolbar">
                                                <span className="block-type-label">{block.type === "text" ? "📝 Văn bản" : "🖼️ Ảnh"} #{idx + 1}</span>
                                                <div className="block-actions">
                                                    <button type="button" onClick={() => moveBlock(idx, -1)} disabled={idx === 0}><ArrowUp size={14} /></button>
                                                    <button type="button" onClick={() => moveBlock(idx, 1)} disabled={idx === form.contentBlocks.length - 1}><ArrowDown size={14} /></button>
                                                    <button type="button" className="block-delete" onClick={() => removeBlock(idx)}><Trash2 size={14} /></button>
                                                </div>
                                            </div>

                                            {block.type === "text" ? (
                                                <textarea
                                                    rows="4"
                                                    value={block.value}
                                                    onChange={(e) => updateBlock(idx, e.target.value)}
                                                    placeholder="Nhập nội dung văn bản (hỗ trợ HTML)…"
                                                    className="block-textarea"
                                                />
                                            ) : (
                                                <div className="block-image-row">
                                                    {block.value ? (
                                                        <div className="block-image-preview">
                                                            <img src={block.value} alt={`Block ${idx}`} />
                                                            <button type="button" className="change-img-btn" onClick={() => document.getElementById(`block-img-${idx}`).click()}>Đổi ảnh</button>
                                                        </div>
                                                    ) : (
                                                        <label htmlFor={`block-img-${idx}`} className="upload-label-btn"><ImageIcon size={16} /> Chọn ảnh</label>
                                                    )}
                                                    <input type="file" id={`block-img-${idx}`} accept="image/*" onChange={(e) => handleBlockImageUpload(idx, e)} hidden />
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <div className="add-block-row">
                                        <button type="button" className="add-block-btn text" onClick={() => addBlock("text")}><Type size={16} /> + Văn bản</button>
                                        <button type="button" className="add-block-btn image" onClick={() => addBlock("image")}><ImageIcon size={16} /> + Ảnh</button>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="modal-footer">
                                <label className="switch-label">
                                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                                    <span>Công khai</span>
                                </label>
                                <div className="footer-btns">
                                    <button type="button" className="btn-cancel" onClick={closeModal} disabled={isSubmitting}>Hủy</button>
                                    <button type="submit" className="btn-save" disabled={isSubmitting}>{isSubmitting ? "Đang lưu…" : "Lưu bài viết"}</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageNews;
