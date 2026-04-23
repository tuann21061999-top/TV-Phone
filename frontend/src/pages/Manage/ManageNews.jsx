import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
    Plus, Edit, Trash2, Search, X, Image as ImageIcon,
    Type, ArrowUp, ArrowDown, Link2, Heading
} from "lucide-react";

const API = `${import.meta.env.VITE_API_URL}/api`;
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
        displayLocations: [],
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
            displayLocations: a.displayLocations || [],
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
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Quản lý Tin tức</h2>
                <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold transition-colors" onClick={openAddModal}>
                    <Plus size={18} /> Thêm bài viết
                </button>
            </div>

            <div className="mb-5">
                <div className="flex items-center bg-white border border-slate-200 rounded-lg px-4 w-[350px]">
                    <Search size={18} className="text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm tiêu đề…" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="border-none outline-none py-3 px-2.5 w-full text-sm"
                    />
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="p-3.5 px-4 text-left border-b border-slate-100 text-sm bg-slate-50 font-semibold text-slate-600">Ảnh bìa</th>
                            <th className="p-3.5 px-4 text-left border-b border-slate-100 text-sm bg-slate-50 font-semibold text-slate-600">Tiêu đề</th>
                            <th className="p-3.5 px-4 text-left border-b border-slate-100 text-sm bg-slate-50 font-semibold text-slate-600">Danh mục</th>
                            <th className="p-3.5 px-4 text-left border-b border-slate-100 text-sm bg-slate-50 font-semibold text-slate-600">Sản phẩm</th>
                            <th className="p-3.5 px-4 text-left border-b border-slate-100 text-sm bg-slate-50 font-semibold text-slate-600">Ngày tạo</th>
                            <th className="p-3.5 px-4 text-left border-b border-slate-100 text-sm bg-slate-50 font-semibold text-slate-600">Lượt xem</th>
                            <th className="p-3.5 px-4 text-left border-b border-slate-100 text-sm bg-slate-50 font-semibold text-slate-600">Trạng thái</th>
                            <th className="p-3.5 px-4 text-left border-b border-slate-100 text-sm bg-slate-50 font-semibold text-slate-600">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="8" className="text-center p-10 text-slate-400">Đang tải dữ liệu…</td></tr>
                        ) : filteredNews.length === 0 ? (
                            <tr><td colSpan="8" className="text-center p-10 text-slate-400">Chưa có bài viết nào.</td></tr>
                        ) : (
                            filteredNews.map((n) => (
                                <tr key={n._id}>
                                    <td className="p-3.5 px-4 border-b border-slate-100"><img src={n.thumbnail} alt="" className="w-20 h-[50px] object-cover rounded-md" /></td>
                                    <td className="p-3.5 px-4 border-b border-slate-100 max-w-[220px] whitespace-nowrap overflow-hidden text-ellipsis text-sm text-slate-700"><strong>{n.title}</strong></td>
                                    <td className="p-3.5 px-4 border-b border-slate-100"><span className="py-1 px-2.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{n.category}</span></td>
                                    <td className="p-3.5 px-4 border-b border-slate-100 text-sm text-slate-700">{n.relatedProduct?.name || "—"}</td>
                                    <td className="p-3.5 px-4 border-b border-slate-100 text-sm text-slate-700">{new Date(n.createdAt).toLocaleDateString("vi-VN")}</td>
                                    <td className="p-3.5 px-4 border-b border-slate-100 text-sm text-slate-700">{n.views}</td>
                                    <td className="p-3.5 px-4 border-b border-slate-100">
                                        <button 
                                            className={`py-1.5 px-3 rounded-full text-xs font-semibold ${n.isActive ? "bg-green-100 text-green-600" : "bg-red-50 text-red-600"}`} 
                                            onClick={() => toggleStatus(n._id)}
                                        >
                                            {n.isActive ? "Hiển thị" : "Đã ẩn"}
                                        </button>
                                    </td>
                                    <td className="p-3.5 px-4 border-b border-slate-100">
                                        <div className="flex gap-2.5">
                                            <button className="bg-slate-100 w-8 h-8 rounded-md flex items-center justify-center text-slate-600 hover:bg-blue-50 hover:text-blue-500 transition-colors" onClick={() => openEditModal(n)}><Edit size={16} /></button>
                                            <button className="bg-slate-100 w-8 h-8 rounded-md flex items-center justify-center text-slate-600 hover:bg-red-50 hover:text-red-500 transition-colors" onClick={() => handleDelete(n._id)}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/45 flex justify-center items-start py-8 z-[9999] overflow-y-auto" onClick={closeModal}>
                    <div className="bg-white w-[860px] max-w-[95%] rounded-2xl p-7" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                            <h3 className="text-xl font-bold text-slate-800">{formConfig.title}</h3>
                            <button className="text-slate-400 hover:text-red-500 transition-colors" onClick={closeModal}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Row 1: Title + Category */}
                            <div className="flex gap-5 mb-4">
                                <div className="flex-[2] mb-4">
                                    <label className="flex items-center gap-1.5 font-medium text-slate-800 mb-2 text-sm">Tiêu đề <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" required value={form.title} 
                                        onChange={(e) => setForm({ ...form, title: e.target.value })} 
                                        placeholder="Nhập tiêu đề bài viết…" 
                                        className="w-full py-2.5 px-3 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    />
                                </div>
                                <div className="flex-1 mb-4">
                                    <label className="flex items-center gap-1.5 font-medium text-slate-800 mb-2 text-sm">Danh mục <span className="text-red-500">*</span></label>
                                    <select 
                                        value={form.category} 
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full py-2.5 px-3 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    >
                                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Short Desc */}
                            <div className="mb-4">
                                <label className="flex items-center gap-1.5 font-medium text-slate-800 mb-2 text-sm">Mô tả ngắn <span className="text-red-500">*</span></label>
                                <textarea 
                                    rows="2" required value={form.shortDescription} 
                                    onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} 
                                    placeholder="Đoạn mô tả ngắn hiển thị trên trang chủ…" 
                                    className="w-full py-2.5 px-3 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-y"
                                />
                            </div>

                            {/* Thumbnail */}
                            <div className="flex gap-5 mb-4 items-center">
                                <div className="flex-1 mb-4">
                                    <label className="flex items-center gap-1.5 font-medium text-slate-800 mb-2 text-sm">Ảnh bìa <span className="text-red-500">*</span></label>
                                    <input type="file" id="news-thumb" accept="image/*" onChange={handleThumbUpload} hidden />
                                    <label htmlFor="news-thumb" className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 py-2.5 px-4 rounded-md cursor-pointer font-medium border border-dashed border-slate-300 hover:bg-slate-200 transition-colors">
                                        <ImageIcon size={16} /> Chọn ảnh bìa
                                    </label>
                                </div>
                                <div className="flex-1 mb-4">
                                    {thumbPreview && <div className="w-[150px] h-[90px] rounded-md overflow-hidden border border-slate-200"><img src={thumbPreview} alt="Preview" className="w-full h-full object-cover" /></div>}
                                </div>
                            </div>

                            {/* Product Selector */}
                            <div className="mb-4 relative">
                                <label className="flex items-center gap-1.5 font-medium text-slate-800 mb-2 text-sm"><Link2 size={14} /> Liên kết sản phẩm (tùy chọn)</label>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Tìm tên sản phẩm…"
                                        value={productSearch}
                                        onChange={(e) => { setProductSearch(e.target.value); setForm({ ...form, relatedProduct: "" }); }}
                                        className="w-full py-2.5 px-3 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    />
                                    {productSearch && !form.relatedProduct && (
                                        <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl max-h-[240px] overflow-y-auto z-50">
                                            {filteredProducts.slice(0, 8).map((p) => (
                                                <div key={p._id} className="flex items-center gap-2.5 p-2.5 px-3.5 cursor-pointer text-sm hover:bg-slate-50" onClick={() => { setForm({ ...form, relatedProduct: p._id }); setProductSearch(p.name); }}>
                                                    {p.colorImages?.[0]?.images?.[0] && <img src={p.colorImages[0].images[0]} alt="" className="w-9 h-9 object-cover rounded border border-slate-200" />}
                                                    <span>{p.name}</span>
                                                </div>
                                            ))}
                                            {filteredProducts.length === 0 && <div className="p-2.5 px-3.5 text-sm text-slate-400 cursor-default">Không tìm thấy sản phẩm</div>}
                                        </div>
                                    )}
                                    {form.relatedProduct && (
                                        <button type="button" className="inline-flex items-center gap-1 mt-2 py-1 px-2.5 text-xs text-red-500 bg-red-50 rounded cursor-pointer" onClick={() => { setForm({ ...form, relatedProduct: "" }); setProductSearch(""); }}>
                                            <X size={14} /> Bỏ liên kết
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* ===== BLOCK EDITOR ===== */}
                            <div className="mb-4">
                                <label className="flex items-center gap-1.5 font-medium text-slate-800 mb-2 text-sm">Nội dung bài viết <span className="text-red-500">*</span></label>
                                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                                    {form.contentBlocks.map((block, idx) => (
                                        <div key={idx} className="bg-white border border-slate-200 rounded-lg mb-3 overflow-hidden">
                                            <div className="flex justify-between items-center p-2 px-3 bg-slate-50 border-b border-slate-100">
                                                <span className="text-xs font-semibold text-slate-500">{block.type === "heading" ? "📌 Mục chính" : block.type === "text" ? "📝 Văn bản" : "🖼️ Ảnh"} #{idx + 1}</span>
                                                <div className="flex gap-1.5">
                                                    <button type="button" className="bg-slate-100 w-[26px] h-[26px] rounded flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-35 disabled:cursor-not-allowed" onClick={() => moveBlock(idx, -1)} disabled={idx === 0}><ArrowUp size={14} /></button>
                                                    <button type="button" className="bg-slate-100 w-[26px] h-[26px] rounded flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-35 disabled:cursor-not-allowed" onClick={() => moveBlock(idx, 1)} disabled={idx === form.contentBlocks.length - 1}><ArrowDown size={14} /></button>
                                                    <button type="button" className="bg-slate-100 w-[26px] h-[26px] rounded flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors" onClick={() => removeBlock(idx)}><Trash2 size={14} /></button>
                                                </div>
                                            </div>

                                            {block.type === "heading" ? (
                                                <input
                                                    type="text"
                                                    value={block.value}
                                                    onChange={(e) => updateBlock(idx, e.target.value)}
                                                    placeholder="Nhập tiêu đề mục chính (sẽ tạo mục lục tự động)…"
                                                    className="w-full p-3 text-base font-bold outline-none border-l-4 border-blue-500 bg-blue-50/30"
                                                />
                                            ) : block.type === "text" ? (
                                                <textarea
                                                    rows="4"
                                                    value={block.value}
                                                    onChange={(e) => updateBlock(idx, e.target.value)}
                                                    placeholder="Nhập nội dung văn bản (hỗ trợ HTML)…"
                                                    className="w-full p-3 text-sm outline-none resize-y min-h-[80px]"
                                                />
                                            ) : (
                                                <div className="p-4 text-center">
                                                    {block.value ? (
                                                        <div className="relative inline-block">
                                                            <img src={block.value} alt={`Block ${idx}`} className="max-w-full max-h-[250px] rounded-lg object-contain" />
                                                            <button type="button" className="absolute bottom-2 right-2 bg-black/60 text-white py-1 px-2.5 rounded text-xs cursor-pointer hover:bg-black/80" onClick={() => document.getElementById(`block-img-${idx}`).click()}>Đổi ảnh</button>
                                                        </div>
                                                    ) : (
                                                        <label htmlFor={`block-img-${idx}`} className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 py-2.5 px-4 rounded-md cursor-pointer font-medium border border-dashed border-slate-300 hover:bg-slate-200"><ImageIcon size={16} /> Chọn ảnh</label>
                                                    )}
                                                    <input type="file" id={`block-img-${idx}`} accept="image/*" onChange={(e) => handleBlockImageUpload(idx, e)} hidden />
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <div className="flex gap-3 justify-center pt-2 flex-wrap">
                                        <button type="button" className="flex items-center gap-1.5 py-2.5 px-5 rounded-lg font-semibold text-sm cursor-pointer border border-dashed bg-indigo-50 text-indigo-600 border-indigo-300 hover:bg-indigo-100 transition-colors" onClick={() => addBlock("heading")}><Heading size={16} /> + Mục chính</button>
                                        <button type="button" className="flex items-center gap-1.5 py-2.5 px-5 rounded-lg font-semibold text-sm cursor-pointer border border-dashed bg-blue-50 text-blue-500 border-blue-300 hover:bg-blue-100 transition-colors" onClick={() => addBlock("text")}><Type size={16} /> + Văn bản</button>
                                        <button type="button" className="flex items-center gap-1.5 py-2.5 px-5 rounded-lg font-semibold text-sm cursor-pointer border border-dashed bg-green-50 text-green-600 border-green-300 hover:bg-green-100 transition-colors" onClick={() => addBlock("image")}><ImageIcon size={16} /> + Ảnh</button>
                                    </div>
                                </div>
                            </div>

                            {/* Display Location Selector */}
                            <div className="mb-4">
                                <label className="block font-medium text-slate-800 mb-2 text-sm">Ghim bài viết này lên giao diện mua sắm 📌</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {[
                                      { id: "home", label: "Trang chủ" },
                                      { id: "phones", label: "Điện thoại" },
                                      { id: "electronics", label: "Đồ điện tử" },
                                      { id: "accessories", label: "Phụ kiện" },
                                      { id: "promotions", label: "Khuyến mãi" },
                                      { id: "contact", label: "Liên hệ" },
                                    ].map(loc => (
                                      <label key={loc.id} className="flex items-center gap-2 text-[13px] bg-slate-50 p-2 rounded border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                                        <input 
                                          type="checkbox" 
                                          checked={form.displayLocations.includes(loc.id)}
                                          onChange={(e) => {
                                            const isChecked = e.target.checked;
                                            setForm(prev => {
                                              let updated = [...prev.displayLocations];
                                              if (isChecked) updated.push(loc.id);
                                              else updated = updated.filter(i => i !== loc.id);
                                              return { ...prev, displayLocations: updated };
                                            });
                                          }}
                                          className="cursor-pointer"
                                        />
                                        {loc.label}
                                      </label>
                                    ))}
                                </div>
                                <p className="text-[12px] text-slate-400 mt-1.5 italic">* Bỏ trống nếu bài viết chỉ nằm trong kho Tin Tức chung.</p>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200">
                                <label className="flex items-center gap-2.5 cursor-pointer text-sm">
                                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-[18px] h-[18px] cursor-pointer" />
                                    <span>Công khai</span>
                                </label>
                                <div className="flex gap-3">
                                    <button type="button" className="py-2.5 px-5 bg-white border border-slate-300 rounded-md font-medium text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors" onClick={closeModal} disabled={isSubmitting}>Hủy</button>
                                    <button type="submit" className="py-2.5 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md font-semibold cursor-pointer disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors" disabled={isSubmitting}>{isSubmitting ? "Đang lưu…" : "Lưu bài viết"}</button>
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
