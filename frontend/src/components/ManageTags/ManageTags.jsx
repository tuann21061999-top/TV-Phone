import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Edit, Trash2, Plus, Search } from 'lucide-react';

const ManageTags = () => {
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Feature',
    isActive: true,
    applicableCategories: []
  });

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/tags');
      setTags(res.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách tags');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Lỗi tải categories:', error);
    }
  };

  useEffect(() => {
    fetchTags();
    fetchCategories();
  }, []);

  const handleOpenModal = (tag = null) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({
        name: tag.name,
        type: tag.type,
        isActive: tag.isActive,
        applicableCategories: tag.applicableCategories ? tag.applicableCategories.map(c => c._id || c) : []
      });
    } else {
      setEditingTag(null);
      setFormData({
        name: '',
        type: 'Feature',
        isActive: true,
        applicableCategories: []
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTag(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingTag) {
        await axios.put(`http://localhost:5000/api/tags/${editingTag._id}`, formData, config);
        toast.success('Cập nhật tag thành công');
      } else {
        await axios.post('http://localhost:5000/api/tags', formData, config);
        toast.success('Tạo tag mới thành công');
      }
      handleCloseModal();
      fetchTags();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tag này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/tags/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Xóa tag thành công');
      fetchTags();
    } catch (error) {
      console.log(error);
      toast.error('Lỗi khi xóa tag');
    }
  };

  const filteredTags = tags.filter(tag => {
    const matchSearch = tag.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!selectedCategoryFilter) return matchSearch;

    if (selectedCategoryFilter === 'global') {
      return matchSearch && (!tag.applicableCategories || tag.applicableCategories.length === 0);
    }

    return matchSearch && tag.applicableCategories && tag.applicableCategories.some(c => (c._id || c) === selectedCategoryFilter);
  });

  const getTypeClass = (type) => {
    switch (type) {
      case 'Usage': return 'bg-sky-100 text-sky-700';
      case 'Feature': return 'bg-green-100 text-green-700';
      case 'Price Segment': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="p-6 bg-transparent font-sans">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center flex-wrap w-full md:w-auto">
          <select 
            className="py-2.5 px-4 border border-slate-200 rounded-lg w-auto min-w-[200px] outline-none text-slate-700 focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10 transition-all bg-white"
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          >
            <option value="">Tất cả (Không lọc)</option>
            <option value="global">Tags Global (Dùng chung)</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>Lọc theo: {c.name}</option>
            ))}
          </select>
          <input 
            type="text" 
            placeholder="Tìm kiếm tag..." 
            className="py-2.5 px-4 border border-slate-200 rounded-lg w-full md:w-[300px] outline-none text-slate-700 focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white py-2.5 px-5 border-none rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-2" 
            onClick={() => handleOpenModal()}
          >
            <Plus size={18} /> Thêm Tag mới
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="py-4 px-6 bg-slate-50 font-semibold text-slate-600 uppercase text-[13px] tracking-wide border-b border-slate-200">Tên Tag</th>
              <th className="py-4 px-6 bg-slate-50 font-semibold text-slate-600 uppercase text-[13px] tracking-wide border-b border-slate-200">Loại Tag</th>
              <th className="py-4 px-6 bg-slate-50 font-semibold text-slate-600 uppercase text-[13px] tracking-wide border-b border-slate-200">Slug</th>
              <th className="py-4 px-6 bg-slate-50 font-semibold text-slate-600 uppercase text-[13px] tracking-wide border-b border-slate-200">Trạng thái</th>
              <th className="py-4 px-6 bg-slate-50 font-semibold text-slate-600 uppercase text-[13px] tracking-wide border-b border-slate-200">Danh mục áp dụng</th>
              <th className="py-4 px-6 bg-slate-50 font-semibold text-slate-600 uppercase text-[13px] tracking-wide border-b border-slate-200">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-6 text-slate-500">Đang tải...</td></tr>
            ) : filteredTags.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-6 text-slate-500">Không có dữ liệu</td></tr>
            ) : (
              filteredTags.map(tag => (
                <tr key={tag._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 border-b border-slate-100 text-slate-800"><strong>{tag.name}</strong></td>
                  <td className="py-4 px-6 border-b border-slate-100">
                    <span className={`inline-block py-1 px-3 rounded-full text-[13px] font-medium ${getTypeClass(tag.type)}`}>
                      {tag.type}
                    </span>
                  </td>
                  <td className="py-4 px-6 border-b border-slate-100 text-slate-600">{tag.slug}</td>
                  <td className="py-4 px-6 border-b border-slate-100">
                    <span className={`inline-block py-1 px-3 rounded-full text-[13px] font-medium ${tag.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {tag.isActive ? 'Hoạt động' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td className="py-4 px-6 border-b border-slate-100">
                    <div className="text-xs text-slate-500 max-w-[200px] line-clamp-2">
                      {!tag.applicableCategories || tag.applicableCategories.length === 0 
                        ? 'Tất cả (Global)' 
                        : tag.applicableCategories.map(c => c.name).join(', ')}
                    </div>
                  </td>
                  <td className="py-4 px-6 border-b border-slate-100">
                    <div className="flex gap-2">
                      <button className="bg-transparent border-none cursor-pointer p-1.5 rounded-md transition-colors text-blue-500 hover:bg-blue-50" onClick={() => handleOpenModal(tag)} title="Sửa">
                        <Edit size={18} />
                      </button>
                      <button className="bg-transparent border-none cursor-pointer p-1.5 rounded-md transition-colors text-red-500 hover:bg-red-50" onClick={() => handleDelete(tag._id)} title="Xóa">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white p-8 rounded-xl w-full max-w-[500px] shadow-2xl animate-[fadeIn_0.2s_ease-out]">
            <h3 className="mt-0 mb-6 text-xl text-slate-800 font-bold">{editingTag ? 'Chỉnh sửa Tag' : 'Thêm Tag mới'}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="font-medium text-slate-600 text-[14px]">Tên Tag</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  placeholder="Nhập tên tag (VD: Chơi game, Dưới 2 triệu,...)"
                  className="py-3 px-4 border border-slate-300 rounded-lg text-sm outline-none transition-colors focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10 text-slate-800"
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="font-medium text-slate-600 text-[14px]">Loại Tag</label>
                <select 
                  name="type" 
                  value={formData.type} 
                  onChange={handleChange} 
                  required
                  className="py-3 px-4 border border-slate-300 rounded-lg text-sm outline-none transition-colors focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10 text-slate-800 bg-white"
                >
                  <option value="Feature">Feature (Chức năng/Đặc điểm)</option>
                  <option value="Usage">Usage (Nhu cầu sử dụng)</option>
                  <option value="Price Segment">Price Segment (Phân khúc giá)</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-slate-600 text-[14px]">Thuộc Danh mục (Để trống nếu dùng cho mọi sản phẩm)</label>
                <div className="flex gap-2.5 flex-wrap max-h-[150px] overflow-y-auto p-3 border border-slate-300 rounded-lg bg-slate-50 scrollbar-thin">
                  {categories.map(cat => (
                    <label key={cat._id} className="flex items-center gap-1.5 text-[13px] cursor-pointer text-slate-700 hover:text-blue-600 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={formData.applicableCategories.includes(cat._id)}
                        onChange={(e) => {
                          if (e.target.checked) setFormData({ ...formData, applicableCategories: [...formData.applicableCategories, cat._id] });
                          else setFormData({ ...formData, applicableCategories: formData.applicableCategories.filter(id => id !== cat._id) });
                        }}
                        className="w-4 h-4 cursor-pointer accent-blue-600"
                      />
                      {cat.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  name="isActive" 
                  checked={formData.isActive} 
                  onChange={handleChange} 
                  className="w-4 h-4 cursor-pointer accent-blue-600"
                />
                <label htmlFor="isActive" className="cursor-pointer font-medium text-slate-600 text-[14px] select-none">Hiển thị (Active)</label>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" className="py-2.5 px-5 rounded-lg font-medium cursor-pointer border-none transition-colors bg-slate-100 text-slate-600 hover:bg-slate-200" onClick={handleCloseModal}>Hủy</button>
                <button type="submit" className="py-2.5 px-5 rounded-lg font-medium cursor-pointer border-none transition-colors bg-blue-500 text-white hover:bg-blue-600 shadow-sm">{editingTag ? 'Cập nhật' : 'Thêm mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTags;