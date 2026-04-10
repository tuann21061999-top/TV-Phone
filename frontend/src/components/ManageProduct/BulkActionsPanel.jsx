import React, { useState } from 'react';
import { Trash2, Tag, Link as LinkIcon, Eye, EyeOff, LayoutList, X, CheckSquare } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import TagSelector from './TagSelector';
import CompatibleProductSelector from './CompatibleProductSelector';

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
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/products/bulk-delete`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { productIds: selectedIds }
        });
        toast.success(`Đã xóa ${selectedIds.length} sản phẩm`, { id: loadingToast });
      } else {
        const updateData = {};
        if (actionType === 'status') updateData.isActive = statusVal;
        if (actionType === 'tags') updateData.tags = selectedTags;
        if (actionType === 'compatible') updateData.compatibleWith = selectedCompatible;

        await axios.put(`${import.meta.env.VITE_API_URL}/api/products/bulk-update`, {
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
    <div className="bg-slate-50 py-3 px-5 rounded-xl flex flex-wrap items-center gap-4 mb-5 border border-slate-200 shadow-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="flex items-center gap-2 font-bold text-slate-700">
        <CheckSquare size={20} className="text-blue-500" />
        Đã chọn {selectedIds.length} sản phẩm
      </div>
      
      <div className="hidden sm:block w-px h-6 bg-slate-300 mx-2"></div>
      
      <div className="flex flex-wrap gap-2.5">
        <button className="flex items-center gap-1.5 py-2 px-3 rounded-lg bg-white border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors cursor-pointer" onClick={() => handleActionClick('tags')}>
          <Tag size={16} className="text-slate-500" /> Gán Tags
        </button>
        <button className="flex items-center gap-1.5 py-2 px-3 rounded-lg bg-white border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors cursor-pointer" onClick={() => handleActionClick('status')}>
          <Eye size={16} className="text-slate-500" /> Đổi trạng thái
        </button>
        <button className="flex items-center gap-1.5 py-2 px-3 rounded-lg bg-white border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors cursor-pointer" onClick={() => handleActionClick('compatible')}>
          <LinkIcon size={16} className="text-slate-500" /> SP Tương thích
        </button>
        <button className="flex items-center gap-1.5 py-2 px-3 rounded-lg bg-red-50 border border-red-200 text-sm font-medium text-red-600 hover:bg-red-100 hover:border-red-300 transition-colors cursor-pointer" onClick={() => handleActionClick('delete')}>
          <Trash2 size={16} /> Xóa
        </button>
      </div>

      <button onClick={clearSelection} className="ml-auto bg-transparent border-none text-slate-500 hover:text-slate-700 cursor-pointer text-sm underline underline-offset-2 transition-colors">
        Bỏ chọn
      </button>

      {/* MODAL CHO BULK ACTION */}
      {actionType && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex justify-center py-10 px-5 z-[9999] overflow-y-auto">
          <div className="bg-white w-full max-w-[500px] rounded-2xl shadow-2xl flex flex-col m-auto animate-[modalPop_0.3s_ease-out]">
            <div className="flex justify-between items-center p-5 px-6 border-b border-slate-100 rounded-t-2xl bg-white">
              <div className="flex items-center gap-2">
                <LayoutList size={22} className="text-blue-600" />
                <h3 className="m-0 text-lg font-bold text-slate-800">Thao tác hàng loạt ({selectedIds.length} SP)</h3>
              </div>
              <button className="bg-transparent border-none text-slate-400 hover:text-red-500 cursor-pointer transition-colors flex" onClick={closeModal}><X size={24} /></button>
            </div>
            
            <div className="p-6 bg-slate-50">
              {actionType === 'delete' && (
                <div className="text-center text-red-500 p-4">
                  <Trash2 size={56} className="mb-4 mx-auto opacity-80" />
                  <p className="text-base font-bold m-0 mb-2">Bạn có chắc chắn muốn xóa vĩnh viễn {selectedIds.length} sản phẩm này?</p>
                  <p className="text-sm text-slate-500 m-0">Hành động này không thể hoàn tác.</p>
                </div>
              )}

              {actionType === 'status' && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Chọn trạng thái mới cho {selectedIds.length} sản phẩm:</label>
                  <select 
                    value={statusVal} 
                    onChange={(e) => setStatusVal(e.target.value === 'true')} 
                    className="p-3 w-full rounded-xl border border-slate-200 mt-1 bg-white text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:16px_16px]"
                  >
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
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700">Chọn các Tags muốn gán cho {selectedIds.length} sản phẩm:</label>
                    <div className="mt-1">
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
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Gán sản phẩm tương thích (Phụ kiện đi kèm):</label>
                  <div className="mt-1">
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

            <div className="flex justify-end gap-3 p-5 bg-white border-t border-slate-100 rounded-b-2xl">
              <button className="py-2.5 px-5 bg-slate-100 text-slate-600 font-semibold rounded-lg hover:bg-slate-200 transition-colors cursor-pointer border-none" onClick={closeModal}>Hủy</button>
              <button 
                className={`py-2.5 px-5 text-white font-semibold rounded-lg transition-colors cursor-pointer border-none shadow-sm ${actionType === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`} 
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