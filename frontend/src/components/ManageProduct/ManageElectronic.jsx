/* eslint-disable no-unused-vars */
import React from "react";
import { Plus, Trash2, Save, X, Edit3, Eye, EyeOff, Search, Settings, ImageIcon, Layers, Zap, ListPlus, Headphones, BatteryCharging, Watch, Snowflake } from "lucide-react";
import { Toaster, toast } from "sonner";
import { useProductManager } from "./useProductManager"; 
import "./ManageProduct.css";

// Cấu hình thông số tự động cho Điện tử
const electronicSpecsConfig = {
  "Tai nghe": { icon: <Headphones size={18} />, keys: ["Kiểu tai nghe", "Kết nối", "Bluetooth", "Chống ồn", "Thời lượng pin", "Cổng sạc", "Kháng nước"] },
  "Sạc dự phòng": { icon: <BatteryCharging size={18} />, keys: ["Dung lượng", "Công suất", "Số cổng", "Loại cổng", "Sạc nhanh", "Tính năng"] },
  "Đồng hồ": { icon: <Watch size={18} />, keys: ["Kích thước mặt", "Chất liệu dây", "Phiên bản", "Tương thích", "Kháng nước", "Sức khỏe"] },
  "Quạt tản nhiệt": { icon: <Snowflake size={18} />, keys: ["Kết nối", "Tương thích", "Kiểu gắn", "Tốc độ quạt", "Đèn LED"] }
};

const emptyFormElectronic = {
  name: "", brand: "", description: "Sản phẩm điện tử chất lượng cao", productType: "electronic", categoryName: "Tai nghe", condition: "new",
  colorImages: [{ colorName: "Mặc định", imageUrl: "", isDefault: true, imageFile: null }], highlights: [""], isFeatured: false, isActive: true,
  specs: [], variants: [{ sku: "", colorName: "Mặc định", size: "Standard", storage: "N/A", price: 0, importPrice: 0, quantity: 0 }]
};

export default function ManageElectronic() {
  const {
    products, form, setForm, showModal, isEditing, searchTerm, setSearchTerm,
    addField, removeField, handleImageFileChange, openModalForAdd, openModalForEdit, closeModal, handleDelete, toggleActive, handleSubmit
  } = useProductManager("electronic", emptyFormElectronic, electronicSpecsConfig);

  return (
    <div className="manage-product">
      <Toaster position="top-right" richColors />
      
      {/* HEADER */}
      <div className="admin-header">
        <div className="header-left">
          <h2>Quản lý Đồ Điện Tử</h2>
          <div className="search-box">
            <Search size={18} color="#64748b" />
            <input placeholder="Tìm thiết bị..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <button className="btn-add-main" onClick={openModalForAdd}>
          <Plus size={20} /> Thêm thiết bị mới
        </button>
      </div>

      {/* DANH SÁCH SẢN PHẨM */}
      <div className="table-container">
        <table>
          <thead>
            <tr><th>Thiết bị</th><th>Phân loại</th><th>Giá nhập</th><th>Giá bán</th><th>Tồn kho</th><th>Trạng thái</th><th>Thao tác</th></tr>
          </thead>
          <tbody>
            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
              <tr key={p._id} className={!p.isActive ? "row-disabled" : ""}>
                <td><strong>{p.name}</strong></td>
                <td><span className="type-badge">{p.categoryId?.name || p.categoryName || "Điện tử"}</span></td>
                <td style={{color: '#94a3b8'}}>{Math.min(...(p.variants?.map(v => v.importPrice) || [0])).toLocaleString()}đ</td>
                <td style={{fontWeight: 'bold', color: '#10b981'}}>{Math.min(...(p.variants?.map(v => v.price) || [0])).toLocaleString()}đ</td>
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
                      <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Ví dụ: Tai nghe Sony WH-1000XM5" />
                    </div>
                    <div className="form-group">
                      <label>Danh mục</label>
                      <select value={form.categoryName} onChange={e => setForm({...form, categoryName: e.target.value})}>
                        {Object.keys(electronicSpecsConfig).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Hãng</label>
                      <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} placeholder="Sony, Apple, JBL..." />
                    </div>
                  </div>
                </div>

                {/* 2. ĐẶC ĐIỂM NỔI BẬT */}
                <div className="form-card">
                  <div className="card-header-form"><Zap size={18} color="#f59e0b" /> Đặc điểm nổi bật</div>
                  {form.highlights.map((h, i) => (
                    <div key={`highlight-${i}`} className="dynamic-row" style={{display: 'flex', gap: '10px', marginBottom: '8px'}}>
                      <input style={{flex: 1}} value={h} onChange={e => { const n = [...form.highlights]; n[i] = e.target.value; setForm({...form, highlights: n}); }} placeholder="Vd: Pin trâu 50 giờ sử dụng" />
                      <button type="button" className="remove-icon-btn" onClick={() => removeField("highlights", i)}><Trash2 size={16}/></button>
                    </div>
                  ))}
                  <button type="button" className="btn-add-sub" onClick={() => addField("highlights", "")}>+ Thêm đặc điểm</button>
                </div>

                {/* 3. HÌNH ẢNH MÀU SẮC */}
                <div className="form-card">
                  <div className="card-header-form"><ImageIcon size={18} /> Hình ảnh theo màu sắc</div>
                  <div className="color-images-grid">
                    {form.colorImages.map((ci, i) => (
                      <div key={`color-${i}`} className="dynamic-row-color" style={{display:'grid', gridTemplateColumns: '1fr 2fr 60px auto auto', gap:'15px', alignItems:'center'}}>
                        <input placeholder="Tên màu" value={ci.colorName} onChange={e => { const u = [...form.colorImages]; u[i].colorName = e.target.value; setForm({...form, colorImages: u}); }} required />
                        
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

                        <label className="checkbox-default" style={{display:'flex', alignItems:'center', gap:'5px', color:'#64748b'}}>
                          <input type="checkbox" checked={ci.isDefault} onChange={() => { const u = form.colorImages.map((item, idx) => ({ ...item, isDefault: idx === i })); setForm({...form, colorImages: u}); }} /> Mặc định
                        </label>
                        <button type="button" className="remove-icon-btn" onClick={() => removeField("colorImages", i)}><Trash2 size={18} /></button>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="btn-add-sub" onClick={() => addField("colorImages", { colorName: "", imageUrl: "", isDefault: false, imageFile: null })}>+ Thêm màu mới</button>
                </div>

                {/* 4. THÔNG SỐ KỸ THUẬT */}
                <div className="form-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                  <div className="card-header-form"><ListPlus size={18} /> Thông số kỹ thuật</div>
                  <div className="specs-grid-admin" style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    {form.specs.map((spec, idx) => (
                      <div key={`spec-${idx}`} style={{display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '10px'}}>
                        <input value={spec.key} onChange={e => { const newSpecs = [...form.specs]; newSpecs[idx].key = e.target.value; setForm({...form, specs: newSpecs}); }} placeholder="Tên thông số (Vd: Kháng nước)" />
                        <input value={spec.value} onChange={e => { const newSpecs = [...form.specs]; newSpecs[idx].value = e.target.value; setForm({...form, specs: newSpecs}); }} placeholder="Giá trị (Vd: IP68)" />
                        <button type="button" className="remove-icon-btn" onClick={() => removeField("specs", idx)}><X size={16} /></button>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="btn-add-sub" onClick={() => addField("specs", {key: "", value: ""})}>+ Thêm thông số</button>
                </div>

                {/* 5. CẤU HÌNH & GIÁ BÁN */}
                <div className="form-card">
                  <div className="card-header-form"><Layers size={18} /> Biến thể & Giá bán</div>
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
                          <label>Giá bán</label>
                          <input type="number" value={v.price} onChange={e => { const u = [...form.variants]; u[i].price = e.target.value; setForm({...form, variants: u}); }} required/>
                        </div>
                        <div className="form-group">
                          <label>Tồn kho</label>
                          <input type="number" value={v.quantity} onChange={e => { const u = [...form.variants]; u[i].quantity = e.target.value; setForm({...form, variants: u}); }} required/>
                        </div>
                        <button type="button" className="remove-icon-btn" onClick={() => removeField("variants", i)}><Trash2 size={18}/></button>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn-add-variant-big" onClick={() => addField("variants", {sku: "", colorName: "", size: "Standard", storage: "N/A", price: 0, importPrice: 0, quantity: 0})}>
                    + Thêm biến thể giá mới
                  </button>
                </div>
              </div>

              {/* 6. FOOTER */}
              <div className="modal-footer-sticky">
                <div className="footer-left" style={{display: 'flex', gap: '20px'}}>
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
                  <button type="submit" className="btn-save-form"><Save size={18}/> {isEditing ? "Lưu thay đổi" : "Lưu vào kho"}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}