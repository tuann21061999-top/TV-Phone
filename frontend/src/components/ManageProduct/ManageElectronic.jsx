import React from "react";
import { Plus, Trash2, Save, X, Edit3, Eye, EyeOff, Search, Settings, ImageIcon, Layers, Zap, ListPlus, Headphones, BatteryCharging, Watch, Snowflake, ChevronLeft, ChevronRight } from "lucide-react";
import { Toaster, toast } from "sonner";
import { useProductManager } from "./useProductManager";
import BulkActionsPanel from "./BulkActionsPanel";
import TagSelector from "./TagSelector";
import CompatibleProductSelector from "./CompatibleProductSelector";
import "./ManageProduct.css";

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
    <div className="manage-product">
      <Toaster position="top-right" richColors />

      {/* HEADER */}
      <div className="admin-header">
        <div className="header-left">
          <h2>Quản lý Đồ Điện Tử</h2>
          <div className="search-box">
            <Search size={18} color="#64748b" />
            <input placeholder="Tìm thiết bị..." value={searchTerm} onChange={handleSearch} />
          </div>
        </div>
        <button className="btn-add-main" onClick={openModalForAdd}>
          <Plus size={20} /> Thêm thiết bị mới
        </button>
      </div>

      {/* TABS PHÂN LOẠI */}
      <div className="category-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
        {["Tất cả", ...Object.keys(electronicSpecsConfig)].map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              background: activeTab === tab ? '#2563eb' : '#f1f5f9',
              color: activeTab === tab ? '#fff' : '#64748b',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
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
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input 
                  type="checkbox" 
                  onChange={(e) => handleSelectAll(e, currentProducts)} 
                  checked={selectedIds.length === currentProducts.length && currentProducts.length > 0} 
                />
              </th>
              <th>Thiết bị</th><th>Phân loại</th><th>Giá nhập</th><th>Giá bán</th><th>Tồn kho</th><th>Trạng thái</th><th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((p) => (
              <tr key={p._id} className={!p.isActive ? "row-disabled" : ""}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(p._id)} 
                    onChange={() => handleSelectOne(p._id)} 
                  />
                </td>
                <td><strong>{p.name}</strong></td>
                <td><span className="type-badge">{p.categoryId?.name || p.categoryName || "Điện tử"}</span></td>
                <td style={{ color: '#94a3b8' }}>{Math.min(...(p.variants?.map(v => v.importPrice) || [0])).toLocaleString()}đ</td>
                <td style={{ fontWeight: 'bold', color: '#10b981' }}>{Math.min(...(p.variants?.map(v => v.price) || [0])).toLocaleString()}đ</td>
                <td>{p.variants?.reduce((sum, v) => sum + v.quantity, 0)}</td>
                <td>
                  <button onClick={() => toggleActive(p)} className={`status-btn ${p.isActive ? "on" : "off"}`}>
                    {p.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </td>
                <td className="actions">
                  <button onClick={() => openModalForEdit(p)} className="edit-btn"><Edit3 size={16} /></button>
                  <button onClick={() => handleDelete(p._id)} className="delete-btn"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PHÂN TRANG */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            type="button"
            className="page-btn"
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            <ChevronLeft size={20} />
          </button>
          <span className="page-info">
            Trang {currentPage} / {totalPages}
          </span>
          <button 
            type="button"
            className="page-btn"
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* MODAL THÊM / SỬA */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-window" style={{ maxWidth: '1000px' }}>
            <div className="modal-header">
              <div className="modal-title">
                {isEditing ? <Edit3 size={20} color="#2563eb" /> : <Plus size={20} color="#2563eb" />}
                <h3>{isEditing ? `Chỉnh sửa: ${form.name}` : "Nhập kho điện tử mới"}</h3>
              </div>
              <button className="modal-close-btn" onClick={closeModal}><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-scroll-body">

                {/* 1. THÔNG TIN CHUNG */}
                <div className="form-card">
                  <div className="card-header-form"><Settings size={18} /> Thông tin chung</div>
                  <div className="form-grid-3">
                    <div className="form-group-full">
                      <label>Tên sản phẩm *</label>
                      <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Ví dụ: Tai nghe Sony WH-1000XM5" />
                    </div>
                    <div className="form-group">
                      <label>Danh mục</label>
                      <select value={form.categoryName} onChange={e => setForm({ ...form, categoryName: e.target.value })}>
                        {Object.keys(electronicSpecsConfig).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Hãng</label>
                      <input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="Sony, Apple, JBL..." />
                    </div>
                    <div className="form-group">
                      <label>Nhóm SP Liên kết (Tùy chọn)</label>
                      <input value={form.productGroup} onChange={e => setForm({ ...form, productGroup: e.target.value })} placeholder="VD: GRP-GT6" />
                    </div>
                    
                    <div className="form-group-full">
                      <label>Tags (Thẻ đánh dấu):</label>
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
                    <div className="form-group-full">
                      <label>Gán sản phẩm tương thích (Phụ kiện đi kèm):</label>
                      <CompatibleProductSelector 
                        products={allProducts} 
                        selectedIds={form.compatibleWith} 
                        currentProductId={form._id} 
                        onChange={(newCompatible) => setForm({ ...form, compatibleWith: newCompatible })} 
                      />
                    </div>

                    <div className="form-group-full">
                      <label>Mô tả chi tiết</label>
                      <textarea rows="6" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Mô tả chung về sản phẩm..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }} />
                    </div>
                  </div>
                </div>

                {/* 2. ĐẶC ĐIỂM NỔI BẬT */}
                <div className="form-card">
                  <div className="card-header-form"><Zap size={18} color="#f59e0b" /> Đặc điểm nổi bật</div>
                  {form.highlights.map((h, i) => (
                    <div key={`highlight-${i}`} className="dynamic-row" style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                      <input style={{ flex: 1 }} value={h} onChange={e => { const n = [...form.highlights]; n[i] = e.target.value; setForm({ ...form, highlights: n }); }} placeholder="Vd: Pin trâu 50 giờ sử dụng" />
                      <button type="button" className="remove-icon-btn" onClick={() => removeField("highlights", i)}><Trash2 size={16} /></button>
                    </div>
                  ))}
                  <button type="button" className="btn-add-sub" onClick={() => addField("highlights", "")}>+ Thêm đặc điểm</button>
                </div>

                {/* 3. HÌNH ẢNH MÀU SẮC */}
                <div className="form-card">
                  <div className="card-header-form"><ImageIcon size={18} /> Hình ảnh theo màu sắc</div>
                  <div className="color-images-grid">
                    {form.colorImages.map((ci, i) => (
                      <div key={`color-${i}`} className="dynamic-row-color" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 60px auto auto', gap: '15px', alignItems: 'center' }}>
                        <input placeholder="Tên màu" value={ci.colorName} onChange={e => { const u = [...form.colorImages]; u[i].colorName = e.target.value; setForm({ ...form, colorImages: u }); }} required />

                        <div className="file-input-wrapper">
                          <input
                            type="file"
                            accept="image/*"
                            id={`file-elec-${i}`}
                            hidden
                            onChange={(e) => handleImageFileChange(i, e.target.files[0])}
                          />
                          <button
                            type="button"
                            className="btn-upload-img"
                            onClick={() => document.getElementById(`file-elec-${i}`).click()}
                            style={{ width: '100%' }}
                          >
                            {ci.imageFile ? "✓ Đã chọn file" : "📁 Chọn ảnh từ máy"}
                          </button>
                        </div>

                        <div className="img-preview-box">
                          {ci.imageUrl ? (
                            <img src={ci.imageUrl} alt="preview" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                          ) : (
                            <div style={{ width: '50px', height: '50px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ImageIcon size={20} color="#cbd5e1" />
                            </div>
                          )}
                        </div>

                        <label className="checkbox-default" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b' }}>
                          <input type="checkbox" checked={ci.isDefault} onChange={() => { const u = form.colorImages.map((item, idx) => ({ ...item, isDefault: idx === i })); setForm({ ...form, colorImages: u }); }} /> Mặc định
                        </label>
                        <button type="button" className="remove-icon-btn" onClick={() => removeField("colorImages", i)}><Trash2 size={18} /></button>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="btn-add-sub" onClick={() => addField("colorImages", { colorName: "", imageUrl: "", isDefault: false, imageFile: null })}>+ Thêm màu mới</button>
                </div>

                {/* 3.5 HÌNH ẢNH CHI TIẾT */}
                <div className="form-card">
                  <div className="card-header-form"><ImageIcon size={18} /> Ảnh chi tiết sản phẩm (Tùy chọn)</div>
                  <div className="detail-images-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '15px' }}>
                    {(form.detailImages || []).map((di, i) => (
                      <div key={`detail-img-${i}`} className="detail-img-item" style={{ position: 'relative', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '5px', textAlign: 'center' }}>
                        <div className="img-preview-box" style={{ width: '100%', height: '80px', marginBottom: '8px' }}>
                          {di.imageUrl ? (
                            <img src={di.imageUrl} alt={`chi-tiet-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', background: '#f1f5f9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ImageIcon size={24} color="#cbd5e1" />
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          id={`file-detail-${i}`}
                          hidden
                          onChange={(e) => handleDetailImageChange(i, e.target.files[0])}
                        />
                        <button
                          type="button"
                          className="btn-upload-img"
                          onClick={() => document.getElementById(`file-detail-${i}`).click()}
                          style={{ width: '100%', fontSize: '11px', padding: '4px' }}
                        >
                          Đổi ảnh
                        </button>
                        <button
                          type="button"
                          className="btn-icon-remove remove-icon-btn"
                          onClick={() => removeField("detailImages", i)}
                          style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#fff', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,00,0.1)' }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <div
                      className="add-detail-img-btn"
                      onClick={() => addField("detailImages", { imageUrl: "", imageFile: null })}
                      style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '120px', cursor: 'pointer', color: '#64748b' }}
                    >
                      <Plus size={24} style={{ marginBottom: '8px' }} />
                      <span style={{ fontSize: '12px' }}>Thêm ảnh</span>
                    </div>
                  </div>
                </div>

                {/* 4. THÔNG SỐ KỸ THUẬT */}
                <div className="form-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                  <div className="card-header-form"><ListPlus size={18} /> Thông số kỹ thuật</div>
                  <div className="specs-grid-admin" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {form.specs.map((spec, idx) => (
                      <div key={`spec-${idx}`} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '10px' }}>
                        <input value={spec.key} onChange={e => { const newSpecs = [...form.specs]; newSpecs[idx].key = e.target.value; setForm({ ...form, specs: newSpecs }); }} placeholder="Tên thông số (Vd: Kháng nước)" />
                        <input value={spec.value} onChange={e => { const newSpecs = [...form.specs]; newSpecs[idx].value = e.target.value; setForm({ ...form, specs: newSpecs }); }} placeholder="Giá trị (Vd: IP68)" />
                        <button type="button" className="remove-icon-btn" onClick={() => removeField("specs", idx)}><X size={16} /></button>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="btn-add-sub" onClick={() => addField("specs", { key: "", value: "" })}>+ Thêm thông số</button>
                </div>

                {/* 5. CẤU HÌNH & GIÁ BÁN */}
                <div className="form-card">
                  <div className="card-header-form"><Layers size={18} /> Phân loại & Giá bán</div>
                  <div className="variants-wrapper">
                    {form.variants.map((v, i) => (
                      <div key={`variant-${i}`} className="variant-block" style={{ padding: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '10px' }}>
                        <div className="v-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                          <div className="v-title" style={{ fontWeight: 'bold' }}>Tùy chọn #{i + 1}</div>
                          <button type="button" className="remove-icon-btn" onClick={() => removeField("variants", i)}><Trash2 size={18} color="#ef4444" /></button>
                        </div>
                        <div className="v-body-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                            <div className="v-field" style={{ flex: '1 1 45%' }}>
                              <label>Phân loại (Vd: 1m, 30W...)</label>
                              <input value={v.storage} onChange={(e) => { const u = [...form.variants]; u[i].storage = e.target.value; setForm({ ...form, variants: u }) }} required placeholder="Nhập tên phân loại" />
                            </div>
                            <div className="v-field" style={{ flex: '1 1 45%' }}><label>Giá bán (đ)</label><input type="number" value={v.price} onChange={(e) => { const u = [...form.variants]; u[i].price = Number(e.target.value); setForm({ ...form, variants: u }) }} required /></div>
                            <div className="v-field" style={{ flex: '1 1 45%' }}><label>Giá nhập (đ)</label><input type="number" value={v.importPrice} onChange={(e) => { const u = [...form.variants]; u[i].importPrice = Number(e.target.value); setForm({ ...form, variants: u }) }} /></div>
                          </div>

                          <div className="colors-section" style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <label style={{ margin: 0, fontWeight: '600', color: '#334155' }}>Màu sắc & Số lượng</label>
                            </div>

                            {v.colors?.map((c, cIdx) => (
                              <div key={`color-${i}-${cIdx}`} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                                <select value={c.colorName} onChange={(e) => { const u = [...form.variants]; u[i].colors[cIdx].colorName = e.target.value; setForm({ ...form, variants: u }) }} style={{ flex: 1.5 }} required>
                                  <option value="">-- Chọn màu --</option>
                                  {form.colorImages
                                    .filter(img => {
                                      const isSelectedElsewhere = v.colors.some((vc, idx) => idx !== cIdx && vc.colorName === img.colorName);
                                      return !isSelectedElsewhere && img.colorName && img.colorName.trim() !== "";
                                    })
                                    .map((img, idx) => (
                                      <option key={`opt-${idx}-${img.colorName}`} value={img.colorName}>
                                        {img.colorName}
                                      </option>
                                    ))}
                                </select>
                                <input type="number" placeholder="Số lượng" value={c.quantity} onChange={(e) => { const u = [...form.variants]; u[i].colors[cIdx].quantity = Number(e.target.value); setForm({ ...form, variants: u }) }} style={{ flex: 1 }} min="0" required />
                                <button type="button" className="remove-icon-btn" style={{ color: '#ef4444' }} onClick={() => {
                                  const u = [...form.variants];
                                  if (u[i].colors.length > 1) {
                                    u[i].colors.splice(cIdx, 1);
                                    setForm({ ...form, variants: u });
                                  } else {
                                    toast.error("Phải có ít nhất 1 màu cho mỗi tùy chọn!");
                                  }
                                }}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}

                            <button type="button" onClick={() => {
                              const u = [...form.variants];
                              if (!u[i].colors) u[i].colors = [];
                              u[i].colors.push({ colorName: "", quantity: 0 });
                              setForm({ ...form, variants: u });
                            }} style={{ background: 'transparent', border: '1px dashed #cbd5e1', color: '#2563eb', padding: '8px', width: '100%', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                              <Plus size={16} /> Thêm màu sắc
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="btn-add-variant-big" onClick={() => addField("variants", { sku: "", storage: "Tùy chọn mới", size: "", price: 0, importPrice: 0, colors: [{ colorName: "", quantity: 0 }] })}>
                    + Thêm tùy chọn mới
                  </button>
                </div>
              </div>

              {/* 6. FOOTER */}
              <div className="modal-footer-sticky">
                <div className="footer-left" style={{ display: 'flex', gap: '20px' }}>
                  <label className="switch-label highlight-switch">
                    <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                    <span>Sản phẩm HOT 🔥</span>
                  </label>
                  <label className="switch-label">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                    <span>Đang kinh doanh</span>
                  </label>
                </div>
                <div className="footer-right">
                  <button type="button" className="btn-close-form" onClick={closeModal}>Hủy bỏ</button>
                  <button type="submit" className="btn-save-form"><Save size={18} /> {isEditing ? "Lưu thay đổi" : "Lưu vào kho"}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}