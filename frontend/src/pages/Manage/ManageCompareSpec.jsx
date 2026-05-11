import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Edit3, Trash2, Plus, X, ChevronDown, ChevronUp, Save, Layers } from 'lucide-react';

const ManageCompareSpec = () => {
  const [specs, setSpecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    order: 1,
    isActive: true,
    tiers: [{ name: '', rank: 1 }],
  });

  const fetchSpecs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/compare-specs`);
      setSpecs(res.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách nhóm so sánh');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSpecs(); }, []);

  const handleOpenModal = (spec = null) => {
    if (spec) {
      setEditingSpec(spec);
      setFormData({
        name: spec.name,
        order: spec.order,
        isActive: spec.isActive,
        tiers: spec.tiers.length > 0
          ? spec.tiers.sort((a, b) => a.rank - b.rank).map(t => ({ name: t.name, rank: t.rank }))
          : [{ name: '', rank: 1 }],
      });
    } else {
      setEditingSpec(null);
      setFormData({ name: '', order: specs.length + 1, isActive: true, tiers: [{ name: '', rank: 1 }] });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingSpec(null); };

  const handleAddTier = () => {
    const maxRank = formData.tiers.length > 0 ? Math.max(...formData.tiers.map(t => t.rank)) : 0;
    setFormData(prev => ({ ...prev, tiers: [...prev.tiers, { name: '', rank: maxRank + 1 }] }));
  };

  const handleRemoveTier = (idx) => {
    if (formData.tiers.length <= 1) { toast.error('Phải có ít nhất 1 bậc'); return; }
    const updated = [...formData.tiers];
    updated.splice(idx, 1);
    setFormData(prev => ({ ...prev, tiers: updated }));
  };

  const handleTierChange = (idx, field, value) => {
    const updated = [...formData.tiers];
    updated[idx][field] = field === 'rank' ? Number(value) : value;
    setFormData(prev => ({ ...prev, tiers: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate unique ranks
    const ranks = formData.tiers.map(t => t.rank);
    const uniqueRanks = new Set(ranks);
    if (ranks.length !== uniqueRanks.size) {
      toast.error('Thứ tự (rank) các bậc không được trùng nhau!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (editingSpec) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/compare-specs/${editingSpec._id}`, formData, config);
        toast.success('Cập nhật thành công');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/compare-specs`, formData, config);
        toast.success('Tạo nhóm mới thành công');
      }
      handleCloseModal();
      fetchSpecs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa nhóm so sánh này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/compare-specs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Xóa thành công');
      fetchSpecs();
    } catch (error) {
      toast.error('Lỗi khi xóa');
    }
  };

  return (
    <div className="p-4 md:p-6 bg-transparent font-sans">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-1">Nhóm So Sánh Sản Phẩm</h2>
          <p className="text-sm text-slate-500 m-0">Quản lý các nhóm thông số & bậc xếp hạng cho trang so sánh</p>
        </div>
        <button className="flex items-center gap-2 font-semibold cursor-pointer transition-all border-none bg-gradient-to-br from-blue-600 to-blue-700 text-white py-2.5 px-5 rounded-xl text-sm shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:-translate-y-0.5" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Thêm nhóm mới
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        {loading ? (
          <div className="text-center py-12 text-slate-500 animate-pulse">Đang tải...</div>
        ) : specs.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Layers size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="font-medium">Chưa có nhóm so sánh nào</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {specs.map((spec) => (
              <div key={spec._id} className="transition-colors hover:bg-slate-50/50">
                <div className="flex items-center gap-4 p-4 md:p-5">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-extrabold text-lg shrink-0">{spec.order}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-bold text-slate-800 m-0 mb-0.5">{spec.name}</h3>
                    <p className="text-[12px] text-slate-500 m-0">{spec.tiers.length} bậc xếp hạng</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${spec.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                    {spec.isActive ? 'Hiển thị' : 'Ẩn'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button className="p-2 rounded-lg border-none cursor-pointer transition-colors bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600" onClick={() => setExpandedId(expandedId === spec._id ? null : spec._id)}>
                      {expandedId === spec._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <button className="p-2 rounded-lg border-none cursor-pointer transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100" onClick={() => handleOpenModal(spec)}><Edit3 size={16} /></button>
                    <button className="p-2 rounded-lg border-none cursor-pointer transition-colors bg-red-50 text-red-500 hover:bg-red-100" onClick={() => handleDelete(spec._id)}><Trash2 size={16} /></button>
                  </div>
                </div>

                {expandedId === spec._id && (
                  <div className="bg-slate-50 border-t border-slate-100 p-4 md:px-6 md:py-4">
                    <div className="grid grid-cols-[60px_1fr] gap-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                      <span>Bậc</span><span>Tên bậc</span>
                    </div>
                    {spec.tiers.sort((a, b) => a.rank - b.rank).map((tier, idx) => (
                      <div key={tier._id || idx} className="grid grid-cols-[60px_1fr] gap-3 items-center py-2.5 px-1 border-b border-slate-100 last:border-b-0">
                        <span className={`text-sm font-bold text-center py-1 rounded-lg ${tier.rank <= 2 ? 'bg-emerald-50 text-emerald-600' : tier.rank <= 4 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'}`}>{tier.rank}</span>
                        <span className="text-sm font-medium text-slate-700">{tier.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center z-[1000] p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-[600px] rounded-2xl shadow-2xl my-10">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Layers size={22} className="text-blue-600" />
                <h3 className="text-lg font-bold text-slate-800 m-0">{editingSpec ? 'Chỉnh sửa nhóm' : 'Thêm nhóm mới'}</h3>
              </div>
              <button className="bg-transparent border-none text-slate-400 hover:text-red-500 cursor-pointer flex" onClick={handleCloseModal}><X size={22} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_120px] gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-600">Tên nhóm *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} required placeholder="VD: Màn hình, Camera, Pin..." className="w-full p-3 px-4 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-600">Thứ tự *</label>
                    <input type="number" min="1" value={formData.order} onChange={(e) => setFormData(p => ({ ...p, order: Number(e.target.value) }))} required className="w-full p-3 px-4 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-center font-bold" />
                    <span className="text-[11px] text-slate-400 text-center">1 = Hiển thị đầu tiên</span>
                  </div>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-600 select-none">
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 cursor-pointer accent-blue-600" />
                  Hiển thị trên trang so sánh
                </label>

                {/* TIERS */}
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-3 block">Danh sách bậc xếp hạng <span className="text-slate-400 font-normal">(Bậc 1 = tốt nhất)</span></label>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2.5">
                    {formData.tiers.map((tier, idx) => (
                      <div key={idx} className="grid grid-cols-[70px_1fr_40px] gap-3 items-center bg-white p-3 rounded-lg border border-slate-100">
                        <div className="flex flex-col gap-1">
                          <input type="number" min="1" value={tier.rank} onChange={(e) => handleTierChange(idx, 'rank', e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm text-center font-bold text-slate-700 bg-slate-50 focus:outline-none focus:border-blue-500" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <input type="text" value={tier.name} onChange={(e) => handleTierChange(idx, 'name', e.target.value)} required placeholder="VD: Màn hình cực tốt" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500" />
                        </div>
                        <button type="button" onClick={() => handleRemoveTier(idx)} className="bg-red-50 text-red-500 h-[42px] w-[42px] rounded-lg flex items-center justify-center cursor-pointer border-none hover:bg-red-100 shrink-0">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={handleAddTier} className="w-full p-2.5 rounded-lg text-[13px] bg-white text-blue-600 border border-dashed border-blue-200 hover:bg-blue-50 font-semibold flex justify-center items-center gap-2 cursor-pointer">
                      <Plus size={16} /> Thêm bậc mới
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-slate-100">
                <button type="button" onClick={handleCloseModal} className="py-2.5 px-5 rounded-xl font-medium cursor-pointer border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 text-sm">Hủy bỏ</button>
                <button type="submit" className="flex items-center gap-2 py-2.5 px-5 rounded-xl font-semibold cursor-pointer border-none bg-gradient-to-br from-blue-600 to-blue-700 text-white text-sm shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:-translate-y-0.5">
                  <Save size={16} /> {editingSpec ? 'Lưu thay đổi' : 'Tạo nhóm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCompareSpec;
