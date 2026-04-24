import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Edit, Trash2, Plus, Search } from 'lucide-react';

const ManageCategory = () => {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories`);
      setCategories(res.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách danh mục');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingCategory) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/categories/${editingCategory._id}`, formData, config);
        toast.success('Cập nhật danh mục thành công');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/categories`, formData, config);
        toast.success('Tạo danh mục mới thành công');
      }
      handleCloseModal();
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Xóa danh mục thành công');
      fetchCategories();
    } catch (error) {
      console.log(error);
      toast.error('Lỗi khi xóa danh mục');
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 bg-transparent font-sans">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center flex-wrap w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Tìm kiếm danh mục..." 
            className="py-2.5 px-4 border border-slate-200 rounded-lg w-full md:w-[300px] outline-none text-slate-700 focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white py-2.5 px-5 border-none rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-2" 
            onClick={() => handleOpenModal()}
          >
            <Plus size={18} /> Thêm Danh mục mới
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="py-4 px-6 bg-slate-50 font-semibold text-slate-600 uppercase text-[13px] tracking-wide border-b border-slate-200">Tên danh mục</th>
              <th className="py-4 px-6 bg-slate-50 font-semibold text-slate-600 uppercase text-[13px] tracking-wide border-b border-slate-200">Slug</th>
              <th className="py-4 px-6 bg-slate-50 font-semibold text-slate-600 uppercase text-[13px] tracking-wide border-b border-slate-200">Mô tả</th>
              <th className="py-4 px-6 bg-slate-50 font-semibold text-slate-600 uppercase text-[13px] tracking-wide border-b border-slate-200">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="text-center py-6 text-slate-500">Đang tải...</td></tr>
            ) : filteredCategories.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-6 text-slate-500">Không có dữ liệu</td></tr>
            ) : (
              filteredCategories.map(cat => (
                <tr key={cat._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 border-b border-slate-100 text-slate-800"><strong>{cat.name}</strong></td>
                  <td className="py-4 px-6 border-b border-slate-100 text-slate-600">{cat.slug}</td>
                  <td className="py-4 px-6 border-b border-slate-100 text-slate-600 max-w-xs truncate" title={cat.description}>{cat.description || '-'}</td>
                  <td className="py-4 px-6 border-b border-slate-100">
                    <div className="flex gap-2">
                      <button className="bg-transparent border-none cursor-pointer p-1.5 rounded-md transition-colors text-blue-500 hover:bg-blue-50" onClick={() => handleOpenModal(cat)} title="Sửa">
                        <Edit size={18} />
                      </button>
                      <button className="bg-transparent border-none cursor-pointer p-1.5 rounded-md transition-colors text-red-500 hover:bg-red-50" onClick={() => handleDelete(cat._id)} title="Xóa">
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
            <h3 className="mt-0 mb-6 text-xl text-slate-800 font-bold">{editingCategory ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục mới'}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="font-medium text-slate-600 text-[14px]">Tên danh mục</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  placeholder="Nhập tên danh mục (VD: Tai nghe, Cáp sạc,...)"
                  className="py-3 px-4 border border-slate-300 rounded-lg text-sm outline-none transition-colors focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10 text-slate-800"
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="font-medium text-slate-600 text-[14px]">Mô tả</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  rows="4"
                  placeholder="Nhập mô tả danh mục (tùy chọn)..."
                  className="py-3 px-4 border border-slate-300 rounded-lg text-sm outline-none transition-colors focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10 text-slate-800 resize-y"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" className="py-2.5 px-5 rounded-lg font-medium cursor-pointer border-none transition-colors bg-slate-100 text-slate-600 hover:bg-slate-200" onClick={handleCloseModal}>Hủy</button>
                <button type="submit" className="py-2.5 px-5 rounded-lg font-medium cursor-pointer border-none transition-colors bg-blue-500 text-white hover:bg-blue-600 shadow-sm">{editingCategory ? 'Cập nhật' : 'Thêm mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategory;
