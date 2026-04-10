import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Eye, EyeOff, Image as ImageIcon, X, Upload, Search } from "lucide-react";
import { toast } from "sonner";


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
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
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
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/banners/admin/all`, {
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
        await axios.put(`${import.meta.env.VITE_API_URL}/api/banners/admin/${editId}`, submitData, config);
        toast.success("Cập nhật Banner thành công!");
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/banners/admin`, submitData, config);
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
      await axios.put(`${import.meta.env.VITE_API_URL}/api/banners/admin/${id}/toggle-status`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Thay đổi trạng thái thành công!");
      fetchBanners();
    } catch (error) { toast.error("Lỗi khi thay đổi trạng thái!"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa vĩnh viễn banner này?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/banners/admin/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Xóa banner thành công!");
      fetchBanners();
    } catch (error) { toast.error("Lỗi khi xóa!"); }
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-full box-border font-sans">
      
      {/* TOOLBAR */}
      <div className="flex justify-between items-center mb-2.5 pb-4 border-b-2 border-slate-200 w-full">
        <h2 className="m-0 text-[24px] font-extrabold text-slate-900">Quản lý Banner (Hero)</h2>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white border-none py-2.5 px-5 rounded-lg text-[14px] font-semibold flex items-center gap-2 cursor-pointer transition-colors duration-200" 
          onClick={openAddModal}
        >
          <Plus size={18} /> Thêm Banner mới
        </button>
      </div>

      {/* DANH SÁCH BANNER */}
      {loading ? (
        <div className="text-center py-[60px] text-slate-500 text-[15px] bg-white rounded-xl border border-dashed border-slate-300">Đang tải danh sách banner...</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-[60px] text-slate-500 text-[15px] bg-white rounded-xl border border-dashed border-slate-300">Chưa có banner nào. Hãy thêm mới!</div>
      ) : (
        <div className="flex flex-col gap-6 w-full">
          {banners.map(banner => (
            <div key={banner._id} className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_5px_rgba(0,0,0,0.03)] flex flex-col overflow-hidden w-full">
              
              <div className="w-full h-[250px] relative bg-slate-50 border-b border-slate-200">
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" onError={(e) => e.target.src="https://via.placeholder.com/800x400?text=Loi+Anh"} />
                {!banner.isActive && (
                  <div className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center text-[24px] font-extrabold tracking-[2px]">Đang Ẩn</div>
                )}
              </div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 gap-5 md:gap-0">
                <div>
                  <h3 className="m-0 mb-2 text-[18px] font-bold text-slate-800">{banner.title}</h3>
                  <p className="m-0 mb-2 text-[14px] text-slate-500">{banner.subtitle}</p>
                  <span className="text-[13px] text-blue-600 font-medium bg-blue-50 py-1 px-2.5 rounded">Link: {banner.link}</span>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  <span className="bg-slate-100 text-slate-600 py-2 px-3 rounded-lg text-[13px] font-semibold mr-0 md:mr-3">Thứ tự: {banner.order}</span>
                  <button onClick={() => toggleStatus(banner._id)} className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 py-2 px-4 rounded-lg text-[13px] font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
                    {banner.isActive ? <><EyeOff size={15}/> Ẩn</> : <><Eye size={15}/> Hiện</>}
                  </button>
                  <button onClick={() => openEditModal(banner)} className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 py-2 px-4 rounded-lg text-[13px] font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
                    <Edit size={15}/> Sửa
                  </button>
                  <button onClick={() => handleDelete(banner._id)} className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 py-2 px-4 rounded-lg text-[13px] font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
                    <Trash2 size={15}/> Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL THÊM/SỬA BANNER */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[4px] flex items-center justify-center z-[9999]">
          <div className="bg-white w-[90%] md:w-[500px] rounded-2xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center py-5 px-6 bg-slate-50 border-b border-slate-200 shrink-0">
              <h3 className="m-0 text-[18px] text-slate-900 font-bold">{isEditing ? "Chỉnh sửa Banner" : "Thêm Banner mới"}</h3>
              <button className="bg-transparent border-none cursor-pointer text-slate-500 hover:text-slate-800" onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
              
              <div className="mb-4">
                <label className="block text-[13px] font-semibold text-slate-800 mb-2">Tiêu đề chính (Title) *</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="VD: iPhone 15 Pro Max mới nhất..." required className="w-full py-2.5 px-3.5 border border-slate-300 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />
              </div>

              <div className="mb-4">
                <label className="block text-[13px] font-semibold text-slate-800 mb-2">Mô tả phụ (Subtitle)</label>
                <input type="text" name="subtitle" value={formData.subtitle} onChange={handleInputChange} placeholder="VD: Giảm sốc 2 triệu đồng..." className="w-full py-2.5 px-3.5 border border-slate-300 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />
              </div>

              {/* KHU VỰC UPLOAD FILE ẢNH */}
              <div className="mb-4">
                <label className="block text-[13px] font-semibold text-slate-800 mb-2">Hình ảnh Banner {isEditing ? "" : "*"}</label>
                <div className="flex items-center gap-2.5">
                  <label htmlFor="banner-upload" className="cursor-pointer flex items-center gap-2 bg-slate-100 py-2.5 px-4 rounded-lg border border-dashed border-slate-300 text-slate-600 font-semibold hover:bg-slate-200 transition-colors">
                    <Upload size={18} /> Chọn ảnh từ máy
                  </label>
                  <input type="file" id="banner-upload" accept="image/*" onChange={handleImageChange} className="hidden" />
                  <span className="text-[13px] text-slate-500 line-clamp-1">
                    {imageFile ? imageFile.name : (isEditing ? "Để trống nếu không muốn đổi" : "Chưa chọn file")}
                  </span>
                </div>
                
                {/* Khu vực Preview Ảnh */}
                {imagePreview && (
                  <div className="mt-4 p-2.5 border border-slate-200 rounded-lg bg-slate-50">
                    <p className="m-0 mb-2 text-[12px] text-slate-500">Ảnh xem trước:</p>
                    <img src={imagePreview} alt="Preview" className="w-full max-h-[200px] object-contain rounded" />
                  </div>
                )}
              </div>

              {/* KHU VỰC TÌM KIẾM SẢN PHẨM & NHẬP LINK */}
              <div className="mb-4">
                <label className="block text-[13px] font-semibold text-slate-800 mb-2">Link trỏ tới khi click *</label>
                <div className="flex flex-col gap-2 relative">
                  
                  {/* Ô tìm kiếm thông minh */}
                  <div className="relative">
                    <Search size={16} color="#94A3B8" className="absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="🔍 Gõ tên sản phẩm để tìm nhanh (VD: iPhone 15...)" 
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} 
                      className="w-full py-2.5 pr-3.5 pl-9 rounded-lg border border-slate-300 text-[13px] outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Bảng kết quả xổ xuống */}
                  {showSuggestions && productSearch && (
                    <div className="absolute top-[44px] left-0 w-full bg-white border border-slate-200 rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.1)] z-50 max-h-[250px] overflow-y-auto">
                      {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).length > 0 ? (
                        products
                          .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                          .slice(0, 5)
                          .map(p => (
                            <div 
                              key={p._id} 
                              className="flex items-center py-2 px-3 cursor-pointer border-b border-slate-100 transition-colors hover:bg-blue-50 group last:border-none"
                              onClick={() => {
                                setFormData({ ...formData, link: `/product/${p.slug}` });
                                setProductSearch(p.name);
                                setShowSuggestions(false);
                              }}
                            >
                              <div className="w-[30px] h-[30px] rounded overflow-hidden mr-2.5 bg-slate-100 shrink-0 flex items-center justify-center">
                                {p.colorImages && p.colorImages.length > 0 ? (
                                  <img src={p.colorImages[0].imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon size={14} className="text-slate-400" />
                                )}
                              </div>
                              <span className="text-[13px] text-slate-700 font-medium group-hover:text-blue-600 transition-colors">{p.name}</span>
                            </div>
                          ))
                      ) : (
                        <div className="p-4 text-center text-[13px] text-slate-400">Không tìm thấy sản phẩm nào</div>
                      )}
                    </div>
                  )}

                  {/* Ô chứa Link chính thức */}
                  <input 
                    type="text" 
                    name="link" 
                    value={formData.link} 
                    onChange={handleInputChange} 
                    placeholder="Kết quả link: /product/slug-san-pham" 
                    required 
                    className="w-full py-2.5 px-3.5 bg-slate-50 rounded-lg border border-slate-300 text-[14px] outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mb-4 flex-1">
                  <label className="block text-[13px] font-semibold text-slate-800 mb-2">Chữ trên nút</label>
                  <input type="text" name="buttonText" value={formData.buttonText} onChange={handleInputChange} placeholder="VD: Mua ngay" className="w-full py-2.5 px-3.5 border border-slate-300 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div className="mb-4 w-[120px]">
                  <label className="block text-[13px] font-semibold text-slate-800 mb-2">Thứ tự</label>
                  <input type="number" name="order" value={formData.order} onChange={handleInputChange} min="0" className="w-full py-2.5 px-3.5 border border-slate-300 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6 mt-2">
                <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-[18px] h-[18px] cursor-pointer accent-blue-600" />
                <label htmlFor="isActive" className="text-[14px] text-slate-800 font-medium cursor-pointer">Cho phép hiển thị Banner này</label>
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t border-slate-200 mt-2.5">
                <button type="button" onClick={() => setShowModal(false)} className="bg-white border border-slate-200 py-2.5 px-5 rounded-lg font-semibold text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors" disabled={isSubmitting}>Hủy</button>
                <button type="submit" className="bg-blue-600 text-white border-none py-2.5 px-5 rounded-lg font-semibold cursor-pointer hover:bg-blue-700 transition-colors disabled:bg-blue-400" disabled={isSubmitting}>
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