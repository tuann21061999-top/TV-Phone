import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Eye, EyeOff, Image as ImageIcon, X, Upload, Search } from "lucide-react";
import { toast } from "sonner";
import "./ManageBanner.css";

const ManageBanner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State cho Modal Form
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Thêm state để chứa File ảnh và Link ảnh Preview
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    link: "",
    buttonText: "Xem ngay",
    order: 0,
    isActive: true
  });
  const fetchProducts = async () => {
    try {
      // Gọi API lấy danh sách sản phẩm (Tùy theo endpoint của bạn, ví dụ ở đây là /api/products)
      const res = await axios.get("http://localhost:5000/api/products");
      // Giả sử API trả về mảng sản phẩm nằm trong res.data hoặc res.data.products
      setProducts(res.data.products || res.data); 
    } catch (error) {
      console.error("Lỗi tải danh sách sản phẩm:", error);
    }
  };
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/banners/admin/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBanners(res.data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách Banner");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchBanners();
    fetchProducts(); 
}, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  // Hàm xử lý khi chọn file ảnh từ máy
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Tạo link ảo để preview ảnh
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ title: "", subtitle: "", link: "", buttonText: "Xem ngay", order: 0, isActive: true });
    setImageFile(null);
    setImagePreview("");
    setShowModal(true);
  };

  const openEditModal = (banner) => {
    setIsEditing(true);
    setEditId(banner._id);
    setFormData({
      title: banner.title, subtitle: banner.subtitle || "", 
      link: banner.link || "", buttonText: banner.buttonText || "Xem ngay", 
      order: banner.order || 0, isActive: banner.isActive
    });
    setImageFile(null);
    setImagePreview(banner.image); // Hiển thị ảnh cũ đang có trên DB
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.link) {
      toast.error("Vui lòng nhập đủ Tiêu đề và Link!");
      return;
    }

    // Nếu là thêm mới thì bắt buộc phải có ảnh
    if (!isEditing && !imageFile) {
      toast.error("Vui lòng chọn ảnh Banner!");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("subtitle", formData.subtitle);
      submitData.append("link", formData.link);
      submitData.append("buttonText", formData.buttonText);
      submitData.append("order", formData.order);
      submitData.append("isActive", formData.isActive);
      
      if (imageFile) {
        submitData.append("image", imageFile); // Phải khớp với upload.single('image') ở Backend
      }

      // 🚨 ĐIỂM QUAN TRỌNG NHẤT: TUYỆT ĐỐI KHÔNG ĐỂ CONTENT-TYPE Ở ĐÂY
      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`
          // ĐÃ XÓA "Content-Type": "multipart/form-data" để Axios tự tạo mã Boundary
        } 
      };

      if (isEditing) {
        await axios.put(`http://localhost:5000/api/banners/admin/${editId}`, submitData, config);
        toast.success("Cập nhật Banner thành công!");
      } else {
        await axios.post("http://localhost:5000/api/banners/admin", submitData, config);
        toast.success("Thêm Banner thành công!");
      }
      setShowModal(false);
      fetchBanners();
    } catch (error) {
      // In lỗi ra console để dễ kiểm tra
      console.error("LỖI TỪ BACKEND TRẢ VỀ:", error.response?.data || error);
      
      // Hiển thị chính xác câu thông báo lỗi từ Backend lên Toast
      const errorMsg = error.response?.data?.message || "Có lỗi xảy ra khi lưu Banner!";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (giữ nguyên toggleStatus và handleDelete)
  const toggleStatus = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/banners/admin/${id}/toggle-status`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Thay đổi trạng thái thành công!");
      fetchBanners();
    } catch (error) { toast.error("Lỗi khi thay đổi trạng thái!"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa vĩnh viễn banner này?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/banners/admin/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Xóa banner thành công!");
      fetchBanners();
    } catch (error) { toast.error("Lỗi khi xóa!"); }
  };

  return (
    <div className="manage-banner-container">
      {/* ... (Giữ nguyên phần Toolbar và render List Banners) ... */}
      <div className="mb-toolbar">
        <h2>Quản lý Banner (Hero)</h2>
        <button className="btn-add-banner" onClick={openAddModal}>
          <Plus size={18} /> Thêm Banner mới
        </button>
      </div>

      {loading ? (
        <div className="mb-message">Đang tải danh sách banner...</div>
      ) : banners.length === 0 ? (
        <div className="mb-message">Chưa có banner nào. Hãy thêm mới!</div>
      ) : (
        <div className="mb-list">
          {banners.map(banner => (
            <div key={banner._id} className="mb-card">
              <div className="mb-card-image">
                <img src={banner.image} alt={banner.title} onError={(e) => e.target.src="https://via.placeholder.com/800x400?text=Loi+Anh"} />
                {!banner.isActive && <div className="mb-overlay-disabled">Đang Ẩn</div>}
              </div>
              
              <div className="mb-card-content">
                <div className="mb-info">
                  <h3>{banner.title}</h3>
                  <p>{banner.subtitle}</p>
                  <span className="mb-link">Link: {banner.link}</span>
                </div>
                
                <div className="mb-actions">
                  <span className="mb-order-badge">Thứ tự: {banner.order}</span>
                  <button onClick={() => toggleStatus(banner._id)} className="btn-icon">
                    {banner.isActive ? <><EyeOff size={15}/> Ẩn</> : <><Eye size={15}/> Hiện</>}
                  </button>
                  <button onClick={() => openEditModal(banner)} className="btn-icon btn-blue">
                    <Edit size={15}/> Sửa
                  </button>
                  <button onClick={() => handleDelete(banner._id)} className="btn-icon btn-red">
                    <Trash2 size={15}/> Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Thêm/Sửa Banner */}
      {showModal && (
        <div className="mb-modal-overlay">
          <div className="mb-modal-content">
            <div className="mb-modal-header">
              <h3>{isEditing ? "Chỉnh sửa Banner" : "Thêm Banner mới"}</h3>
              <button className="mb-close-btn" onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="mb-form">
              <div className="mb-form-group">
                <label>Tiêu đề chính (Title) *</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="VD: iPhone 15 Pro Max mới nhất..." required />
              </div>

              <div className="mb-form-group">
                <label>Mô tả phụ (Subtitle)</label>
                <input type="text" name="subtitle" value={formData.subtitle} onChange={handleInputChange} placeholder="VD: Giảm sốc 2 triệu đồng..." />
              </div>

              {/* KHU VỰC UPLOAD FILE ẢNH */}
              <div className="mb-form-group">
                <label>Hình ảnh Banner {isEditing ? "" : "*"}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label htmlFor="banner-upload" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: '#F1F5F9', padding: '10px 16px', borderRadius: '8px', border: '1px dashed #CBD5E1', color: '#475569', fontWeight: '600' }}>
                    <Upload size={18} /> Chọn ảnh từ máy tính
                  </label>
                  <input type="file" id="banner-upload" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  <span style={{ fontSize: '13px', color: '#64748B' }}>
                    {imageFile ? imageFile.name : (isEditing ? "Để trống nếu không muốn đổi ảnh" : "Chưa chọn file")}
                  </span>
                </div>
                
                {/* Khu vực Preview Ảnh */}
                {imagePreview && (
                  <div style={{ marginTop: '16px', padding: '10px', border: '1px solid #E2E8F0', borderRadius: '8px', background: '#F8FAFC' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748B' }}>Ảnh xem trước:</p>
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '4px' }} />
                  </div>
                )}
              </div>

              {/* KHU VỰC TÌM KIẾM SẢN PHẨM & NHẬP LINK */}
              <div className="mb-form-group">
                <label>Link trỏ tới khi click *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
                  
                  {/* 1. Ô tìm kiếm thông minh */}
                  <div style={{ position: 'relative' }}>
                    <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="text" 
                      placeholder="🔍 Gõ tên sản phẩm để tìm nhanh (VD: iPhone 15...)" 
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      // Delay 200ms để kịp click chọn item trước khi bảng bị ẩn
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} 
                      style={{ padding: '10px 14px 10px 36px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Bảng kết quả xổ xuống */}
                  {showSuggestions && productSearch && (
                    <div className="mb-suggestions-box">
                      {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).length > 0 ? (
                        products
                          .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                          .slice(0, 5) // Hiển thị 5 sản phẩm khớp nhất
                          .map(p => (
                            <div 
                              key={p._id} 
                              className="mb-suggestion-item"
                              onClick={() => {
                                setFormData({ ...formData, link: `/product/${p.slug}` }); // Điền tự động link
                                setProductSearch(p.name); // Cập nhật tên lên ô tìm kiếm
                                setShowSuggestions(false); // Ẩn bảng
                              }}
                            >
                              <div style={{ width: '30px', height: '30px', borderRadius: '4px', overflow: 'hidden', marginRight: '10px', background: '#F1F5F9', flexShrink: 0 }}>
                                {p.colorImages && p.colorImages.length > 0 ? (
                                  <img src={p.colorImages[0].imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <ImageIcon size={14} style={{ margin: '8px', color: '#94A3B8' }}/>
                                )}
                              </div>
                              <span style={{ fontSize: '13px', color: '#334155', fontWeight: '500' }}>{p.name}</span>
                            </div>
                          ))
                      ) : (
                        <div className="mb-suggestion-empty">Không tìm thấy sản phẩm nào</div>
                      )}
                    </div>
                  )}

                  {/* 2. Ô chứa Link chính thức (Vẫn cho phép nhập tay nếu muốn) */}
                  <input 
                    type="text" 
                    name="link" 
                    value={formData.link} 
                    onChange={handleInputChange} 
                    placeholder="Kết quả link: /product/slug-san-pham" 
                    required 
                    style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', width: '100%', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
              </div>

              <div className="mb-form-row">
                <div className="mb-form-group" style={{flex: 1}}>
                  <label>Chữ trên nút</label>
                  <input type="text" name="buttonText" value={formData.buttonText} onChange={handleInputChange} placeholder="VD: Mua ngay" />
                </div>
                <div className="mb-form-group" style={{width: '120px'}}>
                  <label>Thứ tự hiển thị</label>
                  <input type="number" name="order" value={formData.order} onChange={handleInputChange} min="0" />
                </div>
              </div>

              <div className="mb-form-checkbox">
                <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
                <label htmlFor="isActive">Cho phép hiển thị Banner này</label>
              </div>

              <div className="mb-form-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel" disabled={isSubmitting}>Hủy</button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? "Đang xử lý..." : (isEditing ? "Lưu thay đổi" : "Tạo Banner")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBanner;