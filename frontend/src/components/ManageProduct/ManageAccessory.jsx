/* eslint-disable no-unused-vars */
import React from "react";
import { Plus, Trash2, Save, X, Edit3, Eye, EyeOff, Search, Settings, ImageIcon, Layers, Zap, Smartphone, ShieldCheck, Cpu, Link as LinkIcon, ListPlus } from "lucide-react";
import { Toaster, toast } from "sonner";
import { useProductManager } from "./useProductManager"; 
import "./ManageProduct.css";

// Cấu hình thông số tự động cho Phụ kiện
const accessorySpecsConfig = {
  "Ốp lưng": { icon: <Smartphone size={18} />, keys: ["Dòng máy", "Chất liệu", "Kiểu thiết kế", "Sạc không dây", "Loại bảo vệ"] },
  "Cường lực": { icon: <ShieldCheck size={18} />, keys: ["Dòng máy", "Loại kính", "Độ cứng", "Độ dày", "Lớp phủ", "Viền kính"] },
  "Dán lưng": { icon: <Cpu size={18} />, keys: ["Chất liệu", "Họa tiết", "Bề mặt", "Phạm vi dán"] },
  "Củ sạc": { icon: <Zap size={18} />, keys: ["Công suất", "Chuẩn sạc nhanh", "Số cổng", "Loại cổng", "Chân cắm"] },
  "Cáp sạc": { icon: <LinkIcon size={18} />, keys: ["Loại đầu cáp", "Chiều dài", "Công suất", "Chất liệu dây", "Tính năng"] }
};

const emptyFormAccessory = {
  name: "", brand: "", description: "Phụ kiện cao cấp chính hãng", productType: "accessory", categoryName: "Ốp lưng", condition: "new",
  colorImages: [{ colorName: "Mặc định", imageUrl: "", isDefault: true, imageFile: null }], highlights: [""], isFeatured: false, isActive: true,
  specs: [], variants: [{ sku: "", colorName: "Mặc định", size: "Standard", storage: "N/A", price: 0, importPrice: 0, quantity: 0 }]
};

export default function ManageAccessory() {
  const {
    products, form, setForm, showModal, isEditing, searchTerm, setSearchTerm,
    addField, removeField, handleImageFileChange, openModalForAdd, openModalForEdit, closeModal, handleDelete, toggleActive, handleSubmit
  } = useProductManager("accessory", emptyFormAccessory, accessorySpecsConfig);

  return (
    <div className="manage-product">
      <Toaster position="top-right" richColors />
      
      {/* HEADER */}
      <div className="admin-header">
        <div className="header-left">
          <h2>Kho Phụ Kiện</h2>
          <div className="search-box">
            <Search size={18} color="#64748b" />
            <input placeholder="Tìm ốp, sạc, cáp..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <button className="btn-add-main" style={{backgroundColor: '#8b5cf6'}} onClick={openModalForAdd}>
          <Plus size={20} /> Thêm phụ kiện
        </button>
      </div>

      {/* DANH SÁCH SẢN PHẨM */}
      <div className="table-container">
        <table>
          <thead>
            <tr><th>Tên phụ kiện</th><th>Loại</th><th>Giá nhập</th><th>Giá bán</th><th>Tồn kho</th><th>Trạng thái</th><th>Thao tác</th></tr>
          </thead>
          <tbody>
            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
              <tr key={p._id} className={!p.isActive ? "row-disabled" : ""}>
                <td>
                  <strong>{p.name}</strong><br/>
                  <small className="brand-tag">{p.brand}</small>
                </td>
                <td>
                  <span className="type-badge-acc" style={{background: '#f3e8ff', color: '#7e22ce', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600'}}>
                    {p.categoryId?.name || p.categoryName || "Phụ kiện"}
                  </span>
                </td>
                <td style={{color: '#94a3b8'}}>{Math.min(...(p.variants?.map(v => v.importPrice) || [0])).toLocaleString()}đ</td>
                <td style={{color: '#8b5cf6', fontWeight: 'bold'}}>{Math.min(...(p.variants?.map(v => v.price) || [0])).toLocaleString()}đ</td>
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

      {/* MODAL THÊM / SỬA */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-window" style={{ maxWidth: '1000px' }}>
            <div className="modal-header">
              <div className="modal-title">
                {isEditing ? <Edit3 size={20} color="#8b5cf6" /> : <Plus size={20} color="#8b5cf6" />}
                <h3>{isEditing ? `Chỉnh sửa: ${form.name}` : "Nhập phụ kiện mới"}</h3>
              </div>
              <button className="modal-close-btn" onClick={closeModal}><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-scroll-body">
                
                {/* 1. THÔNG TIN CƠ BẢN */}
                <div className="form-card">
                  <div className="card-header-form"><Settings size={18} color="#8b5cf6"/> Thông tin cơ bản</div>
                  <div className="form-grid-3">
                    <div className="form-group-full">
                      <label>Tên sản phẩm *</label>
                      <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Vd: Ốp lưng iPhone 15 Pro Max Silicon Case" />
                    </div>
                    <div className="form-group">
                      <label>Phân loại phụ kiện</label>
                      <select value={form.categoryName} onChange={e => setForm({...form, categoryName: e.target.value})}>
                        {Object.keys(accessorySpecsConfig).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Hãng</label>
                      <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} placeholder="Apple, Samsung, Hoco..." />
                    </div>
                  </div>
                </div>

                {/* 2. ĐẶC ĐIỂM NỔI BẬT */}
                <div className="form-card">
                  <div className="card-header-form"><Zap size={18} color="#f59e0b" /> Đặc điểm nổi bật</div>
                  {form.highlights.map((h, i) => (
                    <div key={`highlight-${i}`} className="dynamic-row" style={{display: 'flex', gap: '10px', marginBottom: '8px'}}>
                      <input style={{flex: 1}} value={h} onChange={e => { const n = [...form.highlights]; n[i] = e.target.value; setForm({...form, highlights: n}); }} placeholder="Vd: Chống sốc chuẩn quân đội" />
                      <button type="button" className="remove-icon-btn" onClick={() => removeField("highlights", i)}><Trash2 size={16}/></button>
                    </div>
                  ))}
                  <button type="button" className="btn-add-sub" style={{color: '#8b5cf6', borderColor: '#8b5cf6'}} onClick={() => addField("highlights", "")}>+ Thêm đặc điểm</button>
                </div>

                {/* 3. HÌNH ẢNH MÀU SẮC - UP FILE */}
                <div className="form-card">
                  <div className="card-header-form"><ImageIcon size={18} color="#8b5cf6" /> Hình ảnh & Màu sắc (File)</div>
                  <div className="color-images-grid">
                    {form.colorImages.map((ci, i) => (
                      <div key={`color-${i}`} className="dynamic-row-color" style={{gridTemplateColumns: '1.5fr 2fr 60px auto auto', gap:'15px', alignItems:'center'}}>
                        <input placeholder="Tên màu" value={ci.colorName} onChange={e => { const u = [...form.colorImages]; u[i].colorName = e.target.value; setForm({...form, colorImages: u}); }} required />
                        
                        <div className="file-input-wrapper">
                            <input 
                                type="file" 
                                accept="image/*" 
                                id={`file-acc-${i}`} 
                                hidden 
                                onChange={(e) => handleImageFileChange(i, e.target.files[0])} 
                            />
                            <button 
                                type="button" 
                                className="btn-upload-img" 
                                onClick={() => document.getElementById(`file-acc-${i}`).click()}
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

                        <label className="checkbox-default" style={{display:'flex', alignItems:'center', gap:'5px', color:'#64748b'}}>
                          <input type="checkbox" checked={ci.isDefault} onChange={() => { const u = form.colorImages.map((item, idx) => ({ ...item, isDefault: idx === i })); setForm({...form, colorImages: u}); }} /> Mặc định
                        </label>
                        <button type="button" className="remove-icon-btn" onClick={() => removeField("colorImages", i)}><Trash2 size={18} /></button>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="btn-add-sub" style={{color: '#8b5cf6', borderColor: '#8b5cf6'}} onClick={() => addField("colorImages", { colorName: "", imageUrl: "", isDefault: false, imageFile: null })}>+ Thêm màu sắc</button>
                </div>

                {/* 4. THÔNG SỐ KỸ THUẬT */}
                <div className="form-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                  <div className="card-header-form"><ListPlus size={18} color="#8b5cf6" /> Thông số & Giá trị</div>
                  <div className="specs-grid-admin" style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    {form.specs.map((spec, idx) => (
                      <div key={`spec-${idx}`} style={{display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '10px'}}>
                        <input value={spec.key} onChange={e => { const newSpecs = [...form.specs]; newSpecs[idx].key = e.target.value; setForm({...form, specs: newSpecs}); }} placeholder="Tên thông số" />
                        <input value={spec.value} onChange={e => { const newSpecs = [...form.specs]; newSpecs[idx].value = e.target.value; setForm({...form, specs: newSpecs}); }} placeholder="Giá trị..." />
                        <button type="button" className="remove-icon-btn" onClick={() => removeField("specs", idx)}><X size={16} /></button>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="btn-add-sub" style={{color: '#8b5cf6', borderColor: '#8b5cf6'}} onClick={() => addField("specs", {key: "", value: ""})}>+ Thêm thông số</button>
                </div>

                {/* 5. PHÂN LOẠI & GIÁ BÁN */}
                <div className="form-card">
                  <div className="card-header-form"><Layers size={18} color="#8b5cf6" /> Phân loại & Giá bán</div>
                  {form.variants.map((v, i) => (
                    <div key={`variant-${i}`} className="variant-block" style={{padding: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '10px'}}>
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '15px', alignItems: 'end'}}>
                        <div className="form-group">
                          <label>Màu sắc</label>
                          <select value={v.colorName} onChange={e => { const u = [...form.variants]; u[i].colorName = e.target.value; setForm({...form, variants: u}); }} required>
                            <option value="">- Chọn màu -</option>
                            {form.colorImages.map(c => ( <option key={`opt-color-${c.colorName}`} value={c.colorName}>{c.colorName || "Chưa đặt tên"}</option> ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Giá nhập</label>
                          <input type="number" value={v.importPrice} onChange={e => { const u = [...form.variants]; u[i].importPrice = e.target.value; setForm({...form, variants: u}); }} />
                        </div>
                        <div className="form-group">
                          <label style={{color: '#8b5cf6'}}>Giá bán</label>
                          <input type="number" style={{fontWeight: 'bold', color: '#8b5cf6'}} value={v.price} onChange={e => { const u = [...form.variants]; u[i].price = e.target.value; setForm({...form, variants: u}); }} required/>
                        </div>
                        <div className="form-group">
                          <label>Tồn kho</label>
                          <input type="number" value={v.quantity} onChange={e => { const u = [...form.variants]; u[i].quantity = e.target.value; setForm({...form, variants: u}); }} required/>
                        </div>
                        <button type="button" className="remove-icon-btn" onClick={() => removeField("variants", i)}><Trash2 size={18}/></button>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn-add-variant-big" style={{background: '#f3e8ff', color: '#7e22ce'}} onClick={() => addField("variants", {sku: "", colorName: "Mặc định", size: "Standard", storage: "N/A", price: 0, importPrice: 0, quantity: 0})}>
                    + Thêm biến thể giá mới
                  </button>
                </div>
              </div>

              {/* 6. FOOTER */}
              <div className="modal-footer-sticky">
                <div className="footer-left">
                  <label className="switch-label">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                    <span>Đang kinh doanh</span>
                  </label>
                </div>
                <div className="footer-right">
                  <button type="button" className="btn-close-form" onClick={closeModal}>Hủy bỏ</button>
                  <button type="submit" className="btn-save-form" style={{background: '#8b5cf6'}}><Save size={18}/> Lưu phụ kiện</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}