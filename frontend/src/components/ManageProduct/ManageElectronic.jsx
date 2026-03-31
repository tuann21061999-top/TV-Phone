import React from "react";
import { Plus, Trash2, Save, X, Edit3, Eye, EyeOff, Search, Settings, ImageIcon, Layers, Zap, ListPlus, Headphones, BatteryCharging, Watch, Snowflake, ChevronLeft, ChevronRight } from "lucide-react";
import { Toaster, toast } from "sonner";
import { useProductManager } from "./useProductManager";
import BulkActionsPanel from "./BulkActionsPanel";
import TagSelector from "./TagSelector";
import CompatibleProductSelector from "./CompatibleProductSelector";

// Cấu hình thông số tự động cho Điện tử
const electronicSpecsConfig = {
  "Tai nghe": { icon: <Headphones size={18} />, keys: ["Kiểu tai nghe", "Kết nối", "Bluetooth", "Chống ồn", "Thời lượng pin", "Cổng sạc", "Kháng nước"] },
  "Sạc dự phòng": { icon: <BatteryCharging size={18} />, keys: ["Dung lượng", "Công suất", "Số cổng", "Loại cổng", "Sạc nhanh", "Tính năng"] },
  "Đồng hồ": { icon: <Watch size={18} />, keys: ["Kích thước mặt", "Chất liệu dây", "Phiên bản", "Tương thích", "Kháng nước", "Sức khỏe"] },
  "Quạt tản nhiệt": { icon: <Snowflake size={18} />, keys: ["Kết nối", "Tương thích", "Kiểu gắn", "Tốc độ quạt", "Đèn LED"] }
};

const emptyFormElectronic = {
  name: "", brand: "", productGroup: "", description: "Sản phẩm điện tử chất lượng cao", productType: "electronic", categoryName: "Tai nghe", condition: "new",
  colorImages: [{ colorName: "Mặc định", imageUrl: "", isDefault: true, imageFile: null }], detailImages: [], tags: [], compatibleWith: [], highlights: [""], isFeatured: false, isActive: true,
  specs: [], variants: [{ sku: "", storage: "Phiên bản mặc định", size: "", price: 0, importPrice: 0, colors: [{ colorName: "Mặc định", quantity: 0 }] }]
};

export default function ManageElectronic() {
  const {
    products, allProducts, form, setForm, showModal, isEditing, searchTerm, setSearchTerm, tagsList,
    selectedIds, handleSelectAll, handleSelectOne, clearSelection, refreshData,
    addField, removeField, handleImageFileChange, handleDetailImageChange, openModalForAdd, openModalForEdit, closeModal, handleDelete, toggleActive, handleSubmit
  } = useProductManager("electronic", emptyFormElectronic, electronicSpecsConfig);

  const [activeTab, setActiveTab] = React.useState("Tất cả");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const cat = p.categoryId?.name || p.categoryName || "Điện tử";
    const matchTab = activeTab === "Tất cả" || cat === activeTab;
    return matchSearch && matchTab;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
      <Toaster position="top-right" richColors />

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Quản lý Đồ Điện Tử</h2>
          <div className="flex items-center bg-white border border-slate-200 p-2.5 px-4 rounded-xl w-full sm:w-[340px] focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
            <Search size={18} className="text-slate-500 shrink-0" />
            <input 
              placeholder="Tìm thiết bị..." 
              value={searchTerm} 
              onChange={handleSearch} 
              className="border-none outline-none ml-2.5 w-full text-sm text-slate-800 bg-transparent" 
            />
          </div>
        </div>
        <button 
          className="flex items-center justify-center gap-2 font-semibold cursor-pointer transition-all border-none bg-gradient-to-br from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl text-sm shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:-translate-y-0.5 hover:shadow-[0_8px_15px_rgba(37,99,235,0.3)]" 
          onClick={openModalForAdd}
        >
          <Plus size={20} /> Thêm thiết bị mới
        </button>
      </div>

      {/* TABS PHÂN LOẠI */}
      <div className="flex gap-2.5 mb-5 overflow-x-auto pb-1.5 scrollbar-hide">
        {["Tất cả", ...Object.keys(electronicSpecsConfig)].map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
            className={`py-2 px-4 rounded-full border-none font-semibold cursor-pointer whitespace-nowrap transition-all text-sm ${
              activeTab === tab ? "bg-blue-600 text-white" : "bg-slate-200/70 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <BulkActionsPanel 
        selectedIds={selectedIds} 
        clearSelection={clearSelection} 
        refreshData={refreshData} 
        products={products} 
        tagsList={tagsList}
        defaultCategoryName={Object.keys(electronicSpecsConfig)[0]}
      />

      {/* DANH SÁCH SẢN PHẨM */}
      <div className="bg-white rounded-2xl overflow-x-auto border border-slate-200 w-full box-border shadow-sm">
        <table className="w-full min-w-[900px] border-collapse table-fixed">
          <thead>
            <tr>
              <th className="w-[50px] p-4 text-left box-border bg-slate-50 text-[13px] text-slate-500 uppercase tracking-wide border-b border-slate-200">
                <input 
                  type="checkbox" 
                  onChange={(e) => handleSelectAll(e, currentProducts)} 
                  checked={selectedIds.length === currentProducts.length && currentProducts.length > 0} 
                  className="w-4 h-4 rounded cursor-pointer"
                />
              </th>
              <th className="w-[25%] p-4 text-left box-border bg-slate-50 text-[13px] text-slate-500 uppercase tracking-wide border-b border-slate-200">Thiết bị</th>
              <th className="w-[15%] p-4 text-left box-border bg-slate-50 text-[13px] text-slate-500 uppercase tracking-wide border-b border-slate-200">Phân loại</th>
              <th className="p-4 text-left box-border bg-slate-50 text-[13px] text-slate-500 uppercase tracking-wide border-b border-slate-200">Giá nhập</th>
              <th className="p-4 text-left box-border bg-slate-50 text-[13px] text-slate-500 uppercase tracking-wide border-b border-slate-200">Giá bán</th>
              <th className="p-4 text-left box-border bg-slate-50 text-[13px] text-slate-500 uppercase tracking-wide border-b border-slate-200">Tồn kho</th>
              <th className="p-4 text-left box-border bg-slate-50 text-[13px] text-slate-500 uppercase tracking-wide border-b border-slate-200">Trạng thái</th>
              <th className="w-[120px] p-4 pr-6 text-right box-border bg-slate-50 text-[13px] text-slate-500 uppercase tracking-wide border-b border-slate-200">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((p) => (
              <tr key={p._id} className={`hover:bg-slate-50 transition-colors ${!p.isActive ? "opacity-60 grayscale-[0.5]" : ""}`}>
                <td className="p-4 border-b border-slate-100">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(p._id)} 
                    onChange={() => handleSelectOne(p._id)} 
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                </td>
                <td className="p-4 border-b border-slate-100 whitespace-nowrap overflow-hidden text-ellipsis"><strong className="text-sm text-slate-800">{p.name}</strong></td>
                <td className="p-4 border-b border-slate-100"><span className="bg-slate-100 text-slate-600 py-1.5 px-3 rounded-md text-xs font-semibold">{p.categoryId?.name || p.categoryName || "Điện tử"}</span></td>
                <td className="p-4 border-b border-slate-100 text-sm font-medium text-slate-400">{Math.min(...(p.variants?.map(v => v.importPrice) || [0])).toLocaleString()}đ</td>
                <td className="p-4 border-b border-slate-100 text-sm font-bold text-emerald-500">{Math.min(...(p.variants?.map(v => v.price) || [0])).toLocaleString()}đ</td>
                <td className="p-4 border-b border-slate-100 text-sm font-medium text-slate-700">{p.variants?.reduce((sum, v) => sum + v.quantity, 0)}</td>
                <td className="p-4 border-b border-slate-100">
                  <button onClick={() => toggleActive(p)} className={`inline-flex items-center justify-center p-2 rounded-lg border-none cursor-pointer transition-all ${p.isActive ? "bg-green-100 text-green-600 hover:opacity-80" : "bg-slate-100 text-slate-400 hover:opacity-80"}`}>
                    {p.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </td>
                <td className="p-4 pr-6 border-b border-slate-100 text-right">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => openModalForEdit(p)} className="inline-flex items-center justify-center p-2 rounded-lg border-none cursor-pointer transition-all bg-blue-50 text-blue-600 hover:bg-blue-100"><Edit3 size={16} /></button>
                    <button onClick={() => handleDelete(p._id)} className="inline-flex items-center justify-center p-2 rounded-lg border-none cursor-pointer transition-all bg-red-50 text-red-500 hover:bg-red-100"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PHÂN TRANG */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 my-8">
          <button 
            type="button"
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-600 cursor-pointer transition-all shadow-sm hover:bg-slate-50 hover:text-blue-600 hover:border-slate-300 hover:-translate-y-0.5 disabled:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="font-semibold text-slate-700 text-sm min-w-[100px] text-center">
            Trang {currentPage} / {totalPages}
          </span>
          <button 
            type="button"
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-600 cursor-pointer transition-all shadow-sm hover:bg-slate-50 hover:text-blue-600 hover:border-slate-300 hover:-translate-y-0.5 disabled:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* MODAL THÊM / SỬA */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex justify-center py-10 px-5 z-[9999] overflow-y-auto">
          <div className="bg-white w-full max-w-[1000px] rounded-[24px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col m-auto animate-[modalPop_0.3s_ease-out]">
            <div className="bg-white flex justify-between items-center p-6 px-8 gap-4 border-b border-slate-100 rounded-t-[24px]">
              <div className="flex items-center gap-2.5">
                {isEditing ? <Edit3 size={24} className="text-blue-600" /> : <Plus size={24} className="text-blue-600" />}
                <h3 className="text-xl font-bold text-slate-800 m-0">{isEditing ? `Chỉnh sửa: ${form.name}` : "Nhập kho điện tử mới"}</h3>
              </div>
              <button className="bg-transparent border-none text-slate-400 hover:text-red-500 cursor-pointer transition-colors flex" onClick={closeModal}><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1">
              <div className="p-6 md:p-8 bg-slate-50/50">

                {/* 1. THÔNG TIN CHUNG */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
                  <div className="font-bold text-base mb-5 text-blue-600 flex items-center gap-2.5"><Settings size={18} /> Thông tin chung</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                    <div className="flex flex-col gap-2 md:col-span-3">
                      <label className="text-sm font-semibold text-slate-600">Tên sản phẩm *</label>
                      <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Ví dụ: Tai nghe Sony WH-1000XM5" className="w-full p-3 px-4 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white transition-all focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-600">Danh mục</label>
                      <select value={form.categoryName} onChange={e => setForm({ ...form, categoryName: e.target.value })} className="w-full p-3 px-4 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white transition-all focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:16px_16px]">
                        {Object.keys(electronicSpecsConfig).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-600">Hãng</label>
                      <input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="Sony, Apple, JBL..." className="w-full p-3 px-4 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white transition-all focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-600">Nhóm SP Liên kết (Tùy chọn)</label>
                      <input value={form.productGroup} onChange={e => setForm({ ...form, productGroup: e.target.value })} placeholder="VD: GRP-GT6" className="w-full p-3 px-4 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white transition-all focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                    </div>
                    
                    <div className="flex flex-col gap-2 md:col-span-3">
                      <label className="text-sm font-semibold text-slate-600">Tags (Thẻ đánh dấu):</label>
                      <TagSelector 
                        tagsList={tagsList.filter(tag => {
                          if (!tag.applicableCategories || tag.applicableCategories.length === 0) return true;
                          const safeCategoryName = (form.categoryName || Object.keys(electronicSpecsConfig)[0] || "").trim().toLowerCase();
                          const safeCategoryId = (form.categoryId?._id || form.categoryId || "").toString();
                          return tag.applicableCategories.some(c => {
                            const cName = (c.name || "").trim().toLowerCase();
                            const cId = (c._id || c || "").toString();
                            return (cName && cName === safeCategoryName) || (cId && cId === safeCategoryId);
                          });
                        })}
                        selectedTags={form.tags}
                        onChange={(newTags) => setForm({ ...form, tags: newTags })} 
                      />
                    </div>

                    {/* SẢN PHẨM TƯƠNG THÍCH */}
                    <div className="flex flex-col gap-2 md:col-span-3">
                      <label className="text-sm font-semibold text-slate-600">Gán sản phẩm tương thích (Phụ kiện đi kèm):</label>
                      <CompatibleProductSelector 
                        products={allProducts} 
                        selectedIds={form.compatibleWith} 
                        currentProductId={form._id} 
                        onChange={(newCompatible) => setForm({ ...form, compatibleWith: newCompatible })} 
                      />
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-3">
                      <label className="text-sm font-semibold text-slate-600">Mô tả chi tiết</label>
                      <textarea rows="6" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Mô tả chung về sản phẩm..." className="w-full p-3 px-4 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white transition-all focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-y" />
                    </div>
                  </div>
                </div>

                {/* 2. ĐẶC ĐIỂM NỔI BẬT */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
                  <div className="font-bold text-base mb-5 text-amber-500 flex items-center gap-2.5"><Zap size={18} /> Đặc điểm nổi bật</div>
                  <div className="flex flex-col gap-3">
                    {form.highlights.map((h, i) => (
                      <div key={`highlight-${i}`} className="flex gap-3 items-center">
                        <input value={h} onChange={e => { const n = [...form.highlights]; n[i] = e.target.value; setForm({ ...form, highlights: n }); }} placeholder="Vd: Pin trâu 50 giờ sử dụng" className="flex-1 p-3 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-500" />
                        <button type="button" onClick={() => removeField("highlights", i)} className="bg-red-50 text-red-500 h-11 w-11 rounded-xl flex items-center justify-center cursor-pointer border-none hover:bg-red-200 shrink-0"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => addField("highlights", "")} className="p-2.5 rounded-xl text-[13px] bg-slate-50 text-amber-600 border border-dashed border-amber-300 w-full mt-4 hover:bg-amber-50 hover:border-amber-500 font-semibold flex justify-center items-center gap-2 transition-colors cursor-pointer">
                    <Plus size={16} /> Thêm đặc điểm
                  </button>
                </div>

                {/* 3. HÌNH ẢNH MÀU SẮC */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
                  <div className="font-bold text-base mb-5 text-blue-600 flex items-center gap-2.5"><ImageIcon size={18} /> Hình ảnh theo màu sắc</div>
                  <div className="flex flex-col gap-3">
                    {form.colorImages.map((ci, i) => (
                      <div key={`color-${i}`} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_60px_auto_auto] gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <input placeholder="Tên màu" value={ci.colorName} onChange={e => { const u = [...form.colorImages]; u[i].colorName = e.target.value; setForm({ ...form, colorImages: u }); }} required className="w-full p-3 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" />

                        <div className="w-full">
                          <input type="file" accept="image/*" id={`file-elec-${i}`} hidden onChange={(e) => handleImageFileChange(i, e.target.files[0])} />
                          <button type="button" onClick={() => document.getElementById(`file-elec-${i}`).click()} className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-[13px] font-medium cursor-pointer transition-colors hover:bg-slate-100 flex items-center justify-center gap-2">
                            {ci.imageFile ? "✓ Đã chọn file" : "📁 Chọn ảnh từ máy"}
                          </button>
                        </div>

                        <div className="flex justify-center">
                          {ci.imageUrl ? (
                            <img src={ci.imageUrl} alt="preview" className="w-[50px] h-[50px] object-cover rounded-lg border border-slate-200" />
                          ) : (
                            <div className="w-[50px] h-[50px] bg-slate-200 rounded-lg flex items-center justify-center">
                              <ImageIcon size={20} className="text-slate-400" />
                            </div>
                          )}
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-600 whitespace-nowrap">
                          <input type="checkbox" className="w-[18px] h-[18px] cursor-pointer" checked={ci.isDefault} onChange={() => { const u = form.colorImages.map((item, idx) => ({ ...item, isDefault: idx === i })); setForm({ ...form, colorImages: u }); }} /> <span className="hidden md:inline">Mặc định</span>
                        </label>
                        <button type="button" onClick={() => removeField("colorImages", i)} className="bg-red-50 text-red-500 h-11 w-11 rounded-xl flex items-center justify-center cursor-pointer border-none hover:bg-red-200"><Trash2 size={18} /></button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => addField("colorImages", { colorName: "", imageUrl: "", isDefault: false, imageFile: null })} className="p-2.5 rounded-xl text-[13px] bg-slate-50 text-blue-600 border border-dashed border-blue-200 w-full mt-4 hover:bg-blue-50 hover:border-blue-500 font-semibold flex justify-center items-center gap-2 transition-colors cursor-pointer">
                    <Plus size={16} /> Thêm màu mới
                  </button>
                </div>

                {/* 3.5 HÌNH ẢNH CHI TIẾT */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
                  <div className="font-bold text-base mb-5 text-blue-600 flex items-center gap-2.5"><ImageIcon size={18} /> Ảnh chi tiết sản phẩm (Tùy chọn)</div>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4">
                    {(form.detailImages || []).map((di, i) => (
                      <div key={`detail-img-${i}`} className="relative border border-slate-200 rounded-xl p-1.5 text-center">
                        <div className="w-full h-[80px] mb-2">
                          {di.imageUrl ? (
                            <img src={di.imageUrl} alt={`chi-tiet-${i}`} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center">
                              <ImageIcon size={24} className="text-slate-300" />
                            </div>
                          )}
                        </div>
                        <input type="file" accept="image/*" id={`file-detail-${i}`} hidden onChange={(e) => handleDetailImageChange(i, e.target.files[0])} />
                        <button type="button" className="w-full text-[11px] p-1.5 rounded border border-slate-200 bg-white text-slate-600 font-medium cursor-pointer hover:bg-slate-50" onClick={() => document.getElementById(`file-detail-${i}`).click()}>
                          Đổi ảnh
                        </button>
                        <button type="button" className="absolute -top-2 -right-2 bg-white text-red-500 h-6 w-6 rounded-full flex items-center justify-center cursor-pointer border border-slate-200 shadow-sm hover:bg-red-50" onClick={() => removeField("detailImages", i)}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <div
                      className="border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center h-[120px] cursor-pointer text-slate-500 hover:bg-slate-50 hover:border-blue-400 transition-colors"
                      onClick={() => addField("detailImages", { imageUrl: "", imageFile: null })}
                    >
                      <Plus size={24} className="mb-2" />
                      <span className="text-xs font-medium">Thêm ảnh</span>
                    </div>
                  </div>
                </div>

                {/* 4. THÔNG SỐ KỸ THUẬT */}
                <div className="bg-white border border-slate-200 border-l-4 border-l-blue-500 rounded-2xl p-6 mb-6 shadow-sm">
                  <div className="font-bold text-base mb-5 text-blue-600 flex items-center gap-2.5"><ListPlus size={18} /> Thông số kỹ thuật</div>
                  <div className="flex flex-col gap-3">
                    {form.specs.map((spec, idx) => (
                      <div key={`spec-${idx}`} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-3">
                        <input value={spec.key} onChange={e => { const newSpecs = [...form.specs]; newSpecs[idx].key = e.target.value; setForm({ ...form, specs: newSpecs }); }} placeholder="Tên thông số (Vd: Kháng nước)" className="p-3 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 bg-slate-50 focus:bg-white" />
                        <input value={spec.value} onChange={e => { const newSpecs = [...form.specs]; newSpecs[idx].value = e.target.value; setForm({ ...form, specs: newSpecs }); }} placeholder="Giá trị (Vd: IP68)" className="p-3 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" />
                        <button type="button" onClick={() => removeField("specs", idx)} className="bg-red-50 text-red-500 h-[46px] w-[46px] md:h-auto md:w-12 rounded-xl flex items-center justify-center cursor-pointer border-none hover:bg-red-200"><X size={16} /></button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => addField("specs", { key: "", value: "" })} className="p-2.5 rounded-xl text-[13px] bg-slate-50 text-blue-600 border border-dashed border-blue-200 w-full mt-4 hover:bg-blue-50 hover:border-blue-500 font-semibold flex justify-center items-center gap-2 transition-colors cursor-pointer">
                    <Plus size={16} /> Thêm thông số
                  </button>
                </div>

                {/* 5. CẤU HÌNH & GIÁ BÁN */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
                  <div className="font-bold text-base mb-5 text-blue-600 flex items-center gap-2.5"><Layers size={18} /> Phân loại & Giá bán</div>
                  <div className="flex flex-col gap-4">
                    {form.variants.map((v, i) => (
                      <div key={`variant-${i}`} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl transition-all">
                        <div className="flex justify-between items-center mb-4">
                          <div className="font-bold text-slate-800 text-[15px]">Tùy chọn #{i + 1}</div>
                          <button type="button" onClick={() => removeField("variants", i)} className="bg-white text-red-500 h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-red-50"><Trash2 size={16} /></button>
                        </div>
                        <div className="flex flex-col gap-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-bold text-slate-500 uppercase">Phân loại (Vd: 1m, 30W...)</label>
                              <input value={v.storage} onChange={(e) => { const u = [...form.variants]; u[i].storage = e.target.value; setForm({ ...form, variants: u }) }} required placeholder="Nhập tên phân loại" className="w-full p-2.5 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-bold text-slate-500 uppercase">Giá bán (đ)</label>
                              <input type="number" value={v.price} onChange={(e) => { const u = [...form.variants]; u[i].price = Number(e.target.value); setForm({ ...form, variants: u }) }} required className="w-full p-2.5 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 font-semibold text-blue-600" />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-bold text-slate-500 uppercase">Giá nhập (đ)</label>
                              <input type="number" value={v.importPrice} onChange={(e) => { const u = [...form.variants]; u[i].importPrice = Number(e.target.value); setForm({ ...form, variants: u }) }} className="w-full p-2.5 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-slate-200 mt-2">
                            <label className="block mb-3 font-semibold text-slate-700 text-sm">Màu sắc & Số lượng</label>
                            <div className="flex flex-col gap-3">
                              {v.colors?.map((c, cIdx) => (
                                <div key={`color-${i}-${cIdx}`} className="flex items-center gap-3">
                                  <select value={c.colorName} onChange={(e) => { const u = [...form.variants]; u[i].colors[cIdx].colorName = e.target.value; setForm({ ...form, variants: u }) }} required className="flex-[1.5] p-2.5 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-slate-50 focus:bg-white">
                                    <option value="">-- Chọn màu --</option>
                                    {form.colorImages.filter(img => {
                                      const isSelectedElsewhere = v.colors.some((vc, idx) => idx !== cIdx && vc.colorName === img.colorName);
                                      return !isSelectedElsewhere && img.colorName && img.colorName.trim() !== "";
                                    }).map((img, idx) => (
                                      <option key={`opt-${idx}-${img.colorName}`} value={img.colorName}>{img.colorName}</option>
                                    ))}
                                  </select>
                                  <input type="number" placeholder="Số lượng" value={c.quantity} onChange={(e) => { const u = [...form.variants]; u[i].colors[cIdx].quantity = Number(e.target.value); setForm({ ...form, variants: u }) }} min="0" required className="flex-1 p-2.5 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
                                  <button type="button" onClick={() => {
                                    const u = [...form.variants];
                                    if (u[i].colors.length > 1) { u[i].colors.splice(cIdx, 1); setForm({ ...form, variants: u }); } 
                                    else { toast.error("Phải có ít nhất 1 màu cho mỗi tùy chọn!"); }
                                  }} className="bg-red-50 text-red-500 h-[42px] w-[42px] rounded-lg flex items-center justify-center cursor-pointer hover:bg-red-100 border-none">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <button type="button" onClick={() => {
                              const u = [...form.variants]; if (!u[i].colors) u[i].colors = [];
                              u[i].colors.push({ colorName: "", quantity: 0 }); setForm({ ...form, variants: u });
                            }} className="w-full mt-3 p-2.5 rounded-lg border border-dashed border-slate-300 bg-transparent text-blue-600 text-[13px] font-semibold flex justify-center items-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors">
                              <Plus size={16} /> Thêm màu sắc
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => addField("variants", { sku: "", storage: "Tùy chọn mới", size: "", price: 0, importPrice: 0, colors: [{ colorName: "", quantity: 0 }] })} className="w-full p-3.5 mt-4 rounded-xl bg-slate-100 text-blue-600 font-bold border border-dashed border-slate-300 cursor-pointer hover:bg-blue-50 transition-colors flex justify-center items-center gap-2">
                    <Plus size={18} /> Thêm tùy chọn mới
                  </button>
                </div>
              </div>

              {/* 6. FOOTER */}
              <div className="bg-white flex flex-wrap justify-between items-center p-5 px-8 gap-4 border-t border-slate-100 rounded-b-[24px] sticky bottom-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-600 select-none">
                    <input type="checkbox" className="w-[18px] h-[18px] cursor-pointer accent-orange-500" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                    <span className="text-orange-600">Sản phẩm HOT 🔥</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-600 select-none">
                    <input type="checkbox" className="w-[18px] h-[18px] cursor-pointer accent-blue-600" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                    <span>Đang kinh doanh</span>
                  </label>
                </div>
                <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                  <button type="button" onClick={closeModal} className="flex-1 sm:flex-none p-3 px-6 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-sm font-semibold cursor-pointer transition-colors hover:bg-slate-200 hover:text-slate-800 text-center">
                    Hủy bỏ
                  </button>
                  <button type="submit" className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-br from-blue-600 to-blue-700 text-white p-3 px-6 rounded-xl text-sm font-semibold shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:-translate-y-0.5 hover:shadow-[0_8px_15px_rgba(37,99,235,0.3)] cursor-pointer border-none transition-all">
                    <Save size={18} /> {isEditing ? "Lưu thay đổi" : "Lưu vào kho"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}