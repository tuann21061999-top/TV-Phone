import React, { useState } from 'react';
import { Trash2, Tag, Link as LinkIcon, Eye, EyeOff, LayoutList, X, CheckSquare } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import TagSelector from './TagSelector';
import CompatibleProductSelector from './CompatibleProductSelector';
import './ManageProduct.css';

export default function BulkActionsPanel({ selectedIds, clearSelection, refreshData, products, allProducts, tagsList, defaultCategoryName }) {
  const [actionType, setActionType] = useState(null); // 'status', 'tags', 'compatible', 'delete'
  const [statusVal, setStatusVal] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCompatible, setSelectedCompatible] = useState([]);

  const token = localStorage.getItem("token");

  if (selectedIds.length === 0) return null;

  const handleActionClick = (type) => {
    setActionType(type);
    // Reset states
    setStatusVal(true);
    setSelectedTags([]);
    setSelectedCompatible([]);
  };

  const closeModal = () => setActionType(null);

  const executeBulkAction = async () => {
    const loadingToast = toast.loading("Đang xử lý hàng loạt...");
    try {
      if (actionType === 'delete') {
        await axios.delete("http://localhost:5000/api/products/bulk-delete", {
          headers: { Authorization: `Bearer ${token}` },
          data: { productIds: selectedIds }
        });
        toast.success(`Đã xóa ${selectedIds.length} sản phẩm`, { id: loadingToast });
      } else {
        const updateData = {};
        if (actionType === 'status') updateData.isActive = statusVal;
        if (actionType === 'tags') updateData.tags = selectedTags;
        if (actionType === 'compatible') updateData.compatibleWith = selectedCompatible;

        await axios.put("http://localhost:5000/api/products/bulk-update", {
          productIds: selectedIds,
          updateData
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(`Đã cập nhật ${selectedIds.length} sản phẩm`, { id: loadingToast });
      }
      
      clearSelection();
      refreshData();
      closeModal();
    } catch (err) {
      toast.error("Có lỗi xảy ra khi thao tác hàng loạt", { id: loadingToast });
      console.error(err);
    }
  };

  return (
    <div className="bulk-actions-panel" style={{ 
      background: '#f8fafc', padding: '12px 20px', borderRadius: '10px', 
      display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', 
      border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#334155' }}>
        <CheckSquare size={20} color="#3b82f6" />
        Đã chọn {selectedIds.length} sản phẩm
      </div>
      
      <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 10px' }}></div>
      
      <button className="bulk-btn" onClick={() => handleActionClick('tags')} style={btnStyle}>
        <Tag size={16} /> Gán Tags
      </button>
      <button className="bulk-btn" onClick={() => handleActionClick('status')} style={btnStyle}>
        <Eye size={16} /> Đổi trạng thái
      </button>
      <button className="bulk-btn" onClick={() => handleActionClick('compatible')} style={btnStyle}>
        <LinkIcon size={16} /> SP Tương thích
      </button>
      <button className="bulk-btn" onClick={() => handleActionClick('delete')} style={{...btnStyle, color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2'}}>
        <Trash2 size={16} /> Xóa
      </button>

      <button onClick={clearSelection} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}>
        Bỏ chọn
      </button>

      {/* MODAL CHO BULK ACTION */}
      {actionType && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-window" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <LayoutList size={20} color="#2563eb" />
                <h3>Thao tác hàng loạt ({selectedIds.length} SP)</h3>
              </div>
              <button className="modal-close-btn" onClick={closeModal}><X size={24} /></button>
            </div>
            
            <div className="modal-scroll-body" style={{ padding: '20px' }}>
              {actionType === 'delete' && (
                <div style={{ textAlign: 'center', color: '#ef4444' }}>
                  <Trash2 size={48} style={{ marginBottom: '15px' }} />
                  <p style={{ fontSize: '16px', fontWeight: 'bold' }}>Bạn có chắc chắn muốn xóa vĩnh viễn {selectedIds.length} sản phẩm này?</p>
                  <p style={{ fontSize: '14px', color: '#64748b' }}>Hành động này không thể hoàn tác.</p>
                </div>
              )}

              {actionType === 'status' && (
                <div className="form-group-full">
                  <label>Chọn trạng thái mới cho {selectedIds.length} sản phẩm:</label>
                  <select value={statusVal} onChange={(e) => setStatusVal(e.target.value === 'true')} style={{ padding: '10px', width: '100%', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '10px' }}>
                    <option value="true">Đang kinh doanh (Hiện)</option>
                    <option value="false">Ngừng kinh doanh (Ẩn)</option>
                  </select>
                </div>
              )}

              {actionType === 'tags' && (() => {
                const selectedCategoryIds = [...new Set(products.filter(p => selectedIds.includes(p._id)).map(p => (p.categoryId?._id || p.categoryId || "").toString()))];
                const filteredBulkTags = tagsList.filter(tag => {
                  if (!tag.applicableCategories || tag.applicableCategories.length === 0) return true;
                  return tag.applicableCategories.some(c => {
                    const cId = (c._id || c || "").toString();
                    const cName = (c.name || "").trim().toLowerCase();
                    const hasNoCategory = selectedCategoryIds.includes("");
                    return selectedCategoryIds.includes(cId) || (hasNoCategory && defaultCategoryName && cName === defaultCategoryName.trim().toLowerCase());
                  });
                });
                return (
                  <div className="form-group-full">
                    <label>Chọn các Tags muốn gán cho {selectedIds.length} sản phẩm:</label>
                    <div style={{ marginTop: '10px' }}>
                      <TagSelector 
                        tagsList={filteredBulkTags} 
                        selectedTags={selectedTags} 
                        onChange={setSelectedTags} 
                      />
                    </div>
                  </div>
                );
              })()}

              {actionType === 'compatible' && (
                <div className="form-group-full">
                  <label>Gán sản phẩm tương thích (Phụ kiện đi kèm):</label>
                  <div style={{ marginTop: '10px' }}>
                    <CompatibleProductSelector 
                      products={allProducts || products} 
                      selectedIds={selectedCompatible} 
                      currentProductId={null} 
                      onChange={setSelectedCompatible} 
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer-sticky" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-close-form" onClick={closeModal}>Hủy</button>
              <button 
                className="btn-save-form" 
                style={{ background: actionType === 'delete' ? '#ef4444' : '#2563eb' }}
                onClick={executeBulkAction}
              >
                Xác nhận {actionType === 'delete' ? 'Xóa' : 'Cập nhật'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  display: 'flex', alignItems: 'center', gap: '5px',
  padding: '8px 12px', borderRadius: '6px',
  background: '#fff', border: '1px solid #cbd5e1',
  cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#334155',
  transition: 'all 0.2s'
};
