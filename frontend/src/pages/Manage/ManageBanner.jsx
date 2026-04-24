import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Eye, EyeOff, Image as ImageIcon, X, Upload, Search, ShoppingCart, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { getBannerStyles } from "../../utils/themeUtils";


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

  // Thêm state cho News
  const [news, setNews] = useState([]);
  const [newsSearch, setNewsSearch] = useState("");
  const [showNewsSuggestions, setShowNewsSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    link: "",
    buttonText: "Xem ngay",
    order: 0,
    isActive: true,
    theme: "blue",
    position: "main",
    newsLink: "",
    startDate: "",
    endDate: ""
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
  
  const fetchNews = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/news/admin/all`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setNews(res.data);
    } catch (error) {
      console.error("Lỗi tải danh sách tin tức:", error);
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
    fetchNews();
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
    setFormData({ title: "", subtitle: "", link: "", newsLink: "", position: "main", buttonText: "Xem ngay", order: 0, isActive: true, theme: "blue", startDate: "", endDate: "" });
    setImageFile(null);
    setImagePreview("");
    setShowModal(true);
  };

  const openEditModal = (banner) => {
    setIsEditing(true);
    setEditId(banner._id);
    // Tự động covert thời gian dạng DB sang chuẩn input datetime-local
    const formatDateForInput = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

    setFormData({
      title: banner.title, subtitle: banner.subtitle || "", 
      link: banner.link || "", 
      newsLink: banner.newsLink || "",
      position: banner.position || "main",
      buttonText: banner.buttonText || "Xem ngay", 
      order: banner.order || 0, isActive: banner.isActive, theme: banner.theme || "blue",
      startDate: formatDateForInput(banner.startDate),
      endDate: formatDateForInput(banner.endDate)
    });
    setImageFile(null);
    setImagePreview(banner.image); // Hiển thị ảnh cũ đang có trên DB
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.position === 'sub_left' && !formData.title) {
      toast.error("Vui lòng nhập Tiêu đề cho banner phụ!");
      return;
    }
    if (!formData.link) {
      toast.error("Vui lòng nhập Link!");
      return;
    }

    // Nếu là banner chính, tự set title mặc định để không bị lỗi DB
    const finalTitle = formData.position === 'main' ? (formData.title || "Banner Chính") : formData.title;

    // Nếu là thêm mới thì bắt buộc phải có ảnh
    if (!isEditing && !imageFile) {
      toast.error("Vui lòng chọn ảnh Banner!");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      
      const submitData = new FormData();
      submitData.append("title", finalTitle);
      submitData.append("subtitle", formData.subtitle);
      submitData.append("link", formData.link);
      submitData.append("newsLink", formData.newsLink || "");
      submitData.append("position", formData.position || "main");
      submitData.append("buttonText", formData.buttonText);
      submitData.append("order", formData.order);
      submitData.append("isActive", formData.isActive);
      submitData.append("theme", formData.theme);
      if (formData.startDate) submitData.append("startDate", formData.startDate);
      if (formData.endDate) submitData.append("endDate", formData.endDate);
      
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
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] text-blue-600 font-medium bg-blue-50 py-1 px-2.5 rounded">Link: {banner.link}</span>
                    {banner.newsLink && <span className="text-[13px] text-emerald-600 font-medium bg-emerald-50 py-1 px-2.5 rounded">Tin tức: {banner.newsLink}</span>}
                    <span className="text-[13px] text-purple-600 font-medium bg-purple-50 py-1 px-2.5 rounded">Vị trí: {banner.position === "sub_left" ? "Góc trái dưới" : "Banner chính"}</span>
                    <span className="text-[13px] text-orange-600 font-medium bg-orange-50 py-1 px-2.5 rounded">Theme: {banner.theme || "blue"}</span>
                  </div>
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
          <div className="bg-white w-[95%] md:w-[1100px] rounded-2xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center py-5 px-6 bg-slate-50 border-b border-slate-200 shrink-0">
              <h3 className="m-0 text-[18px] text-slate-900 font-bold">{isEditing ? "Chỉnh sửa Banner" : "Thêm Banner mới"}</h3>
              <button className="bg-transparent border-none cursor-pointer text-slate-500 hover:text-slate-800" onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>
            
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-[500px]">
              {/* CỘT TRÁI: FORM */}
              <div className="w-full md:w-[480px] border-r border-slate-200 flex flex-col">
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
              
              {formData.position === "sub_left" && (
                <>
                  <div className="mb-4">
                    <label className="block text-[13px] font-semibold text-slate-800 mb-2">Tiêu đề chính (Title) *</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="VD: iPhone 15 Pro Max mới nhất..." required className="w-full py-2.5 px-3.5 border border-slate-300 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />
                  </div>

                  <div className="mb-4">
                    <label className="block text-[13px] font-semibold text-slate-800 mb-2">Mô tả phụ (Subtitle)</label>
                    <input type="text" name="subtitle" value={formData.subtitle} onChange={handleInputChange} placeholder="VD: Giảm sốc 2 triệu đồng..." className="w-full py-2.5 px-3.5 border border-slate-300 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />
                  </div>
                </>
              )}

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

              {/* KHU VỰC TÌM KIẾM SẢN PHẨM & BÀI VIẾT & NHẬP LINK */}
              <div className="mb-4">
                <label className="block text-[13px] font-semibold text-slate-800 mb-2">Link trỏ tới khi click *</label>
                <div className="flex flex-col gap-2 relative">
                  
                  <div className="flex flex-col xl:flex-row gap-2">
                    {/* Ô tìm kiếm Sản Phẩm */}
                    <div className="relative flex-1">
                      <Search size={16} color="#94A3B8" className="absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="🔍 Tìm Sản phẩm (VD: iPhone 15...)" 
                        value={productSearch}
                        onChange={(e) => {
                          setProductSearch(e.target.value);
                          setShowSuggestions(true);
                          setShowNewsSuggestions(false);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} 
                        className="w-full py-2.5 pr-3.5 pl-9 rounded-lg border border-slate-300 text-[13px] outline-none focus:border-blue-500 transition-colors"
                      />
                      
                      {/* Bảng kết quả Sản phầm */}
                      {showSuggestions && productSearch && (
                        <div className="absolute top-[44px] left-0 w-full bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-[250px] overflow-y-auto">
                          {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).length > 0 ? (
                            products
                              .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                              .slice(0, 5)
                              .map(p => (
                                <div 
                                  key={p._id} 
                                  className="flex items-center py-2 px-3 cursor-pointer border-b border-slate-100 hover:bg-blue-50 group"
                                  onClick={() => {
                                    setFormData({ ...formData, link: `/product/${p.slug}` });
                                    setProductSearch(p.name);
                                    setShowSuggestions(false);
                                  }}
                                >
                                  <div className="w-8 h-8 rounded shrink-0 mr-2 bg-slate-100 flex items-center justify-center overflow-hidden">
                                     {p.colorImages?.[0]?.imageUrl ? <img src={p.colorImages[0].imageUrl} className="w-full h-full object-cover"/> : <ImageIcon size={14}/>}
                                  </div>
                                  <span className="text-[13px] font-medium text-slate-700">{p.name}</span>
                                </div>
                              ))
                          ) : (
                            <div className="p-3 text-[13px] text-center text-slate-400">Không tìm thấy sản phẩm</div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Ô tìm kiếm Bài Viết / Tin Tức */}
                    {formData.position === "sub_left" && (
                    <div className="relative flex-1">
                      <Search size={16} color="#94A3B8" className="absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="📝 Tìm Bài viết/Tin tức (VD: Đánh giá...)" 
                        value={newsSearch}
                        onChange={(e) => {
                          setNewsSearch(e.target.value);
                          setShowNewsSuggestions(true);
                          setShowSuggestions(false);
                        }}
                        onFocus={() => setShowNewsSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowNewsSuggestions(false), 200)} 
                        className="w-full py-2.5 pr-3.5 pl-9 rounded-lg border border-slate-300 text-[13px] outline-none focus:border-emerald-500 transition-colors"
                      />

                      {/* Bảng kết quả Tin Tức */}
                      {showNewsSuggestions && newsSearch && (
                        <div className="absolute top-[44px] left-0 w-full bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-[250px] overflow-y-auto">
                          {news.filter(n => n.title.toLowerCase().includes(newsSearch.toLowerCase())).length > 0 ? (
                            news
                              .filter(n => n.title.toLowerCase().includes(newsSearch.toLowerCase()))
                              .slice(0, 5)
                              .map(n => (
                                <div 
                                  key={n._id} 
                                  className="flex items-center py-2 px-3 cursor-pointer border-b border-slate-100 hover:bg-emerald-50 group"
                                  onClick={() => {
                                    setFormData({ ...formData, newsLink: `/news/${n.slug}` });
                                    setNewsSearch(n.title);
                                    setShowNewsSuggestions(false);
                                  }}
                                >
                                  <div className="w-[45px] h-8 rounded shrink-0 mr-2 bg-slate-100 flex overflow-hidden">
                                     {n.thumbnail ? <img src={n.thumbnail} className="w-full h-full object-cover"/> : <ImageIcon size={14}/>}
                                  </div>
                                  <span className="text-[13px] font-medium text-slate-700 line-clamp-1">{n.title}</span>
                                </div>
                              ))
                          ) : (
                            <div className="p-3 text-[13px] text-center text-slate-400">Không tìm thấy bài viết</div>
                          )}
                        </div>
                      )}
                    </div>
                    )}
                  </div>


                  {/* Ô chứa Link chính thức */}
                  <div className="flex flex-col gap-2">
                      <input 
                        type="text" 
                        name="link" 
                        value={formData.link} 
                        onChange={handleInputChange} 
                        placeholder="Link nút Mua ngay: VD /product/iphone hoặc /electronics" 
                        required 
                        className="w-full py-2.5 px-3.5 bg-slate-50 rounded-lg border border-slate-300 text-[14px] outline-none focus:border-blue-500 transition-colors"
                      />
                      {/* Hiển thị newsLink nếu đã chọn bài viết (chỉ đọc, xóa bằng nút X) */}
                      {formData.newsLink && (
                        <div className="flex items-center gap-2 bg-emerald-50 rounded-lg border border-emerald-300 py-2 px-3.5">
                          <span className="text-[13px] text-emerald-700 font-medium flex-1 truncate">📝 Bài viết gán: {formData.newsLink}</span>
                          <button 
                            type="button"
                            onClick={() => { setFormData({...formData, newsLink: ""}); setNewsSearch(""); }}
                            className="text-red-400 hover:text-red-600 cursor-pointer bg-transparent border-none text-[16px] font-bold shrink-0"
                          >✕</button>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mb-4 flex-1">
                  <label className="block text-[13px] font-semibold text-slate-800 mb-2">Vị trí hiển thị</label>
                  <select name="position" value={formData.position} onChange={handleInputChange} className="w-full py-2.5 px-3.5 border border-slate-300 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors">
                    <option value="main">Banner Chính (Trượt ngang)</option>
                    <option value="sub_left">Góc trái dưới (Khắc phục kích thước nhỏ)</option>
                  </select>
                </div>
                {formData.position === "sub_left" && (
                  <>
                    <div className="mb-4 flex-1">
                      <label className="block text-[13px] font-semibold text-slate-800 mb-2">Chữ trên nút</label>
                      <input type="text" name="buttonText" value={formData.buttonText} onChange={handleInputChange} placeholder="VD: Mua ngay" className="w-full py-2.5 px-3.5 border border-slate-300 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />
                    </div>
                    <div className="mb-4 flex-1">
                      <label className="block text-[13px] font-semibold text-slate-800 mb-2">Màu Gradient nền</label>
                      <select name="theme" value={formData.theme} onChange={handleInputChange} className="w-full py-2.5 px-3.5 border border-slate-300 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors bg-white">
                        <option value="blue">Xanh dương (Mặc định)</option>
                        <option value="purple">Tím mộng mơ</option>
                        <option value="rose">Hồng cam đỏ</option>
                        <option value="emerald">Xanh lục ngọc</option>
                        <option value="dark">Tối tinh tế</option>
                      </select>
                    </div>
                  </>
                )}
                <div className="mb-4 w-[100px]">
                  <label className="block text-[13px] font-semibold text-slate-800 mb-2">Thứ tự</label>
                  <input type="number" name="order" value={formData.order} onChange={handleInputChange} min="0" className="w-full py-2.5 px-3.5 border border-slate-300 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />
                </div>
              </div>

              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-[13px] font-semibold text-slate-800 mb-2">Ngày bắt đầu hiển thị (Tùy chọn)</label>
                  <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full py-2.5 px-3.5 border border-slate-300 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div className="flex-1">
                  <label className="block text-[13px] font-semibold text-slate-800 mb-2">Ngày tự động ẩn (Tùy chọn)</label>
                  <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full py-2.5 px-3.5 border border-slate-300 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />
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

              {/* {CỘT PHẢI: LIVE PREVIEW} */}
              <div className="hidden md:flex flex-1 bg-slate-100/50 p-6 flex-col items-center overflow-y-auto relative">
                <h4 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2 w-full text-center">Bản xem trước (Live Preview)</h4>
                
                <div className="w-full xl:w-[120%] transform scale-[0.4] xl:scale-[0.55] origin-top my-4">
                  {formData.position === "main" ? (
                    <div className="relative w-full rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] min-h-[500px] flex items-center justify-center bg-slate-900 border">
                      <img 
                        src={imagePreview || "https://via.placeholder.com/1200x500?text=ẢNH+BANNER+FULL"} 
                        alt="Preview" 
                        className="w-full h-full object-cover absolute inset-0" 
                      />
                    </div>
                  ) : (
                    <div className={`relative w-full rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] border flex flex-col-reverse md:flex-row items-center min-h-[500px] group transition-all duration-1000 ease-in-out ${getBannerStyles(formData.theme).bg}`}>
                      
                      <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full mix-blend-multiply filter blur-[100px] opacity-80 translate-x-1/4 -translate-y-1/4 pointer-events-none transition-colors duration-1000 ${getBannerStyles(formData.theme).blob1}`}></div>
                      <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-[100px] opacity-80 -translate-x-1/4 translate-y-1/4 pointer-events-none transition-colors duration-1000 ${getBannerStyles(formData.theme).blob2}`}></div>

                      <div className="flex-1 w-full md:w-1/2 flex flex-col gap-6 z-10 px-8 pb-12 pt-4 md:p-14 lg:p-16 text-center md:text-left items-center md:items-start">
                        <div className={`inline-flex items-center gap-1.5 text-[15px] font-bold tracking-wider px-5 py-2 rounded-full uppercase shadow-sm ${getBannerStyles(formData.theme).badge}`}>
                          <Sparkles size={18} className="mb-[1.5px]" />
                          Sản phẩm phụ
                        </div>
                        <h1 className={`text-[46px] lg:text-[62px] font-extrabold leading-[1.12] m-0 tracking-tight transition-colors duration-1000 drop-shadow-sm ${getBannerStyles(formData.theme).title}`}>
                          {formData.title || "Tiêu đề Banner Mẫu"}
                        </h1>
                        <p className={`text-[20px] leading-relaxed m-0 md:max-w-[85%] font-medium transition-colors duration-1000 ${getBannerStyles(formData.theme).subtitle}`}>
                          {formData.subtitle || "Mô tả phụ sẽ nằm ở phần này"}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto mt-8">
                          <div className={`flex-1 sm:flex-none h-[64px] flex items-center justify-center gap-2 text-white px-12 rounded-2xl text-[18px] font-bold transition-all ${getBannerStyles(formData.theme).btn}`}>
                            <ShoppingCart size={22} />
                            {formData.buttonText || "Khám phá ngay"}
                          </div>
                          {formData.newsLink && (
                            <div className={`flex-1 sm:flex-none h-[64px] flex items-center justify-center gap-2 bg-white/20 backdrop-blur-md px-12 rounded-2xl text-[18px] font-bold border border-white/40 shadow-[0_8px_20px_rgba(0,0,0,0.04)] ${formData.theme === "dark" ? "text-white border-slate-600" : "text-slate-700"}`}>
                              Xem chi tiết <ArrowRight size={22} />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="w-full md:w-1/2 relative flex justify-center items-center py-16 z-10">
                        <img 
                          src={imagePreview || "https://via.placeholder.com/600x500?text=ẢNH+MẪU"} 
                          alt="Preview" 
                          className="w-[420px] lg:w-[500px] max-h-[500px] object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.25)] scale-110" 
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBanner;
