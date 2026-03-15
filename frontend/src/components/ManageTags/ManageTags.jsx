import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import './ManageTags.css';

const ManageTags = () => {
  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Feature',
    isActive: true
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

  useEffect(() => {
    fetchTags();
  }, []);

  const handleOpenModal = (tag = null) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({
        name: tag.name,
        type: tag.type,
        isActive: tag.isActive
      });
    } else {
      setEditingTag(null);
      setFormData({
        name: '',
        type: 'Feature',
        isActive: true
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

  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeClass = (type) => {
    switch (type) {
      case 'Usage': return 'usage';
      case 'Feature': return 'feature';
      case 'Price Segment': return 'price';
      default: return '';
    }
  };

  return (
    <div className="manage-tags-container">
      <div className="header-actions">
        <div className="search-add-group">
          <input 
            type="text" 
            placeholder="Tìm kiếm tag..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="add-btn" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Thêm Tag mới
          </button>
        </div>
      </div>

      <div className="user-table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Tên Tag</th>
              <th>Loại Tag</th>
              <th>Slug</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{textAlign: 'center'}}>Đang tải...</td></tr>
            ) : filteredTags.length === 0 ? (
              <tr><td colSpan="5" style={{textAlign: 'center'}}>Không có dữ liệu</td></tr>
            ) : (
              filteredTags.map(tag => (
                <tr key={tag._id}>
                  <td><strong>{tag.name}</strong></td>
                  <td>
                    <span className={`type-badge ${getTypeClass(tag.type)}`}>
                      {tag.type}
                    </span>
                  </td>
                  <td>{tag.slug}</td>
                  <td>
                    <span className={`status-badge ${tag.isActive ? 'active' : 'inactive'}`}>
                      {tag.isActive ? 'Hoạt động' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit-btn" onClick={() => handleOpenModal(tag)} title="Sửa">
                        <Edit size={18} />
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(tag._id)} title="Xóa">
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
        <div className="tag-modal-overlay">
          <div className="tag-modal-content">
            <h3>{editingTag ? 'Chỉnh sửa Tag' : 'Thêm Tag mới'}</h3>
            <form onSubmit={handleSubmit} className="tag-form">
              <div className="tag-form-group">
                <label>Tên Tag</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  placeholder="Nhập tên tag (VD: Chơi game, Dưới 2 triệu,...)"
                />
              </div>
              
              <div className="tag-form-group">
                <label>Loại Tag</label>
                <select name="type" value={formData.type} onChange={handleChange} required>
                  <option value="Feature">Feature (Chức năng/Đặc điểm)</option>
                  <option value="Usage">Usage (Nhu cầu sử dụng)</option>
                  <option value="Price Segment">Price Segment (Phân khúc giá)</option>
                </select>
              </div>

              <div className="tag-form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="isActive"
                  name="isActive" 
                  checked={formData.isActive} 
                  onChange={handleChange} 
                />
                <label htmlFor="isActive" style={{ cursor: 'pointer' }}>Hiển thị (Active)</label>
              </div>

              <div className="tag-modal-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>Hủy</button>
                <button type="submit" className="save-btn">{editingTag ? 'Cập nhật' : 'Thêm mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTags;
