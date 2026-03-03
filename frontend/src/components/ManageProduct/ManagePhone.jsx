/* eslint-disable no-unused-vars */
import React from "react";
import { Plus, Trash2, Save, X, Edit3, Eye, EyeOff, Search, Settings, ImageIcon, Layers, Zap, ListPlus } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useProductManager } from "./useProductManager"; 
import "./ManageProduct.css";

const sizeOptions = ["6GB", "8GB", "12GB", "16GB", "18GB", "24GB", "28GB", "32GB"];
const storageOptions = ["64GB", "128GB", "256GB", "512GB", "1TB", "2TB"];

const emptyForm = {
  name: "", brand: "", description: "", productType: "device", 
  categoryName: "", condition: "new", conditionLevel: ["99%"], 
  colorImages: [{ colorName: "", imageUrl: "", isDefault: true, imageFile: null }],
  highlights: [""], isFeatured: false, isActive: true,
  specs: [{ key: "", value: "" }],
  variants: [{ sku: "", colorName: "", size: "8GB", storage: "128GB", price: 0, importPrice: 0, quantity: 0 }],
};

export default function ManagePhone() {
  const {
    products, form, setForm, showModal, isEditing, searchTerm, setSearchTerm,
    addField, removeField, handleImageFileChange, openModalForAdd, openModalForEdit, closeModal, handleDelete, toggleActive, handleSubmit
  } = useProductManager("device", emptyForm);

  return (
    <div className="manage-product">
      <Toaster position="top-right" richColors />
      
      {/* HEADER */}
      <div className="admin-header">
        <div className="header-left">
          <h2>Kho Điện Thoại</h2>
          <div className="search-box">
            <Search size={18} color="#64748b" />
            <input placeholder="Tìm theo tên..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <button className="btn-add-main" onClick={openModalForAdd}>
          <Plus size={20} /> Thêm điện thoại mới
        </button>
      </div>

      {/* TABLE */}
      <div className="table-container">
        <table>
          <thead>
            <tr><th>Sản phẩm</th><th>Loại</th><th>Giá sàn</th><th>Tồn kho</th><th>Trạng thái</th><th>Thao tác</th></tr>
          </thead>
          <tbody>
            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
              <tr key={p._id} className={!p.isActive ? "row-disabled" : ""}>
                <td>
                  <div className="product-info-cell">
                    <strong>{p.name}</strong>
                    {p.condition === "used" && (
                      <div className="tags-container">
                        {p.conditionLevel?.map((lv, idx) => (
                          <span key={`cond-${p._id}-${idx}`} className="used-tag">{lv}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td><span className="type-badge">{p.categoryId?.name || p.categoryName || "Điện thoại"}</span></td>
                <td>{Math.min(...(p.variants?.map(v => v.price) || [0])).toLocaleString()}đ</td>
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

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-window">
            <div className="modal-header">
              <div className="modal-title">
                {isEditing ? <Edit3 size={20} color="#2563eb" /> : <Plus size={20} color="#2563eb" />}
                <h3>{isEditing ? "Cập nhật sản phẩm" : "Đăng sản phẩm mới"}</h3>
              </div>
              <button className="modal-close-btn" onClick={closeModal}><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-scroll-body">
                
                {/* 1. THÔNG TIN CHUNG */}
                <div className="form-card">
                  <div className="card-header-form"><Settings size={18} /> Thông tin chung</div>
                  <div className="input-row">
                    <div className="field full">
                      <label>Tên sản phẩm *</label>
                      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Ví dụ: iPhone 15 Pro Max" />
                    </div>
                    <div className="field">
                      <label>Thương hiệu</label>
                      <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Apple" />
                    </div>
                    <div className="field">
                      <label>Danh mục sản phẩm *</label>
                      <input value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })} required placeholder="Nhập tên danh mục (vd: iPhone)" />
                    </div>
                    <div className="field">
                      <label>Phân loại</label>
                      <select value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value })}>
                        <option value="device">Thiết bị (Điện thoại/Tablet)</option>
                        <option value="electronic">Điện tử (Tai nghe/Đồng hồ)</option>
                        <option value="accessory">Phụ kiện (Ốp/Sạc)</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Tình trạng tổng quát</label>
                      <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                        <option value="new">Mới nguyên seal (New)</option>
                        <option value="used">Đã qua sử dụng (Used)</option>
                      </select>
                    </div>

                    {form.condition === "used" && (
                      <div className="field full animate-fade-in">
                        <label>Các mức độ tình trạng hiện có (Condition Levels)</label>
                        <div className="condition-list-input">
                          {form.conditionLevel.map((lv, idx) => (
                            <div key={`cond-lv-${idx}`} className="condition-item-row">
                              <select value={lv} onChange={(e) => {
                                const u = [...form.conditionLevel]; u[idx] = e.target.value; setForm({ ...form, conditionLevel: u });
                              }}>
                                <option value="99%">99% (Keng)</option>
                                <option value="98%">98% (Phẩy nhẹ)</option>
                                <option value="97%">97% (Trầy xước)</option>
                              </select>
                              <button type="button" className="btn-remove-cond" onClick={() => {
                                const u = [...form.conditionLevel]; u.splice(idx, 1); setForm({...form, conditionLevel: u});
                              }}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                          <button type="button" className="btn-add-cond" onClick={() => addField("conditionLevel", "99%")}>
                            <ListPlus size={16} /> Thêm mức tình trạng khác
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="field full">
                      <label>Mô tả chi tiết</label>
                      <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả chung về sản phẩm..." />
                    </div>
                  </div>
                </div>

                {/* 2. HÌNH ẢNH MÀU SẮC */}
                <div className="form-card">
                  <div className="card-header-form"><ImageIcon size={18} /> Hình ảnh theo màu sắc</div>
                  <div className="color-images-grid">
                    {form.colorImages.map((ci, i) => (
                      <div key={`color-${i}`} className="dynamic-row-color" style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 60px auto auto', gap: '10px', alignItems: 'center' }}>
                        <input className="input-color-name" placeholder="Tên màu" value={ci.colorName} onChange={(e) => { const u = [...form.colorImages]; u[i].colorName = e.target.value; setForm({ ...form, colorImages: u }) }} required />
                        
                        <div className="file-input-wrapper">
                            <input 
                                type="file" 
                                accept="image/*" 
                                id={`file-phone-${i}`} 
                                hidden 
                                onChange={(e) => handleImageFileChange(i, e.target.files[0])} 
                            />
                            <button 
                                type="button" 
                                className="btn-upload-img" 
                                onClick={() => document.getElementById(`file-phone-${i}`).click()}
                                style={{ width: '100%', fontSize: '13px' }}
                            >
                                {ci.imageFile ? "✓ Đã chọn ảnh" : "📁 Tải ảnh từ máy"}
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

                        <label className="checkbox-default" title="Chọn làm ảnh đại diện">
                          <input type="checkbox" checked={ci.isDefault} onChange={() => {
                            const u = form.colorImages.map((item, idx) => ({ ...item, isDefault: idx === i }));
                            setForm({ ...form, colorImages: u });
                          }} /> <span>Mặc định</span>
                        </label>
                        <button type="button" className="btn-icon-remove remove-icon-btn" onClick={() => removeField("colorImages", i)}><Trash2 size={18} /></button>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="btn-add-sub" onClick={() => addField("colorImages", { colorName: "", imageUrl: "", isDefault: false, imageFile: null })}>+ Thêm màu sắc mới</button>
                </div>

                {/* 3. CẤU HÌNH & GIÁ BÁN */}
                <div className="form-card">
                  <div className="card-header-form"><Layers size={18} /> Cấu hình & Giá bán</div>
                  <div className="variants-wrapper">
                    {form.variants.map((v, i) => (
                      <div key={`variant-${i}`} className="variant-block">
                        <div className="v-header">
                          <div className="v-title">Phiên bản #{i + 1}</div>
                          <Trash2 size={16} className="text-danger-icon remove-icon" onClick={() => removeField("variants", i)} />
                        </div>
                        <div className="v-body-inputs">
                          <div className="v-field">
                            <label>Màu sắc</label>
                            <select value={v.colorName} onChange={(e) => { const u = [...form.variants]; u[i].colorName = e.target.value; setForm({ ...form, variants: u }) }} required>
                              <option value="">-- Chọn --</option>
                              {form.colorImages.map(c => <option key={`opt-color-${c.colorName}`} value={c.colorName}>{c.colorName || "Chưa nhập tên màu"}</option>)}
                            </select>
                          </div>
                          <div className="v-field">
                            <label>RAM</label>
                            <select value={v.size} onChange={(e) => { const u = [...form.variants]; u[i].size = e.target.value; setForm({ ...form, variants: u }) }} required>
                              {sizeOptions.map(opt => <option key={`ram-${opt}`} value={opt}>{opt}</option>)}
                            </select>
                          </div>
                          <div className="v-field">
                            <label>Bộ nhớ (ROM)</label>
                            <select value={v.storage} onChange={(e) => { const u = [...form.variants]; u[i].storage = e.target.value; setForm({ ...form, variants: u }) }} required>
                              {storageOptions.map(opt => <option key={`rom-${opt}`} value={opt}>{opt}</option>)}
                            </select>
                          </div>
                          <div className="v-field"><label>Giá bán (đ)</label><input type="number" value={v.price} onChange={(e) => { const u = [...form.variants]; u[i].price = Number(e.target.value); setForm({ ...form, variants: u }) }} required /></div>
                          <div className="v-field"><label>Giá nhập (đ)</label><input type="number" value={v.importPrice} onChange={(e) => { const u = [...form.variants]; u[i].importPrice = Number(e.target.value); setForm({ ...form, variants: u }) }} /></div>
                          <div className="v-field"><label>Số lượng</label><input type="number" value={v.quantity} onChange={(e) => { const u = [...form.variants]; u[i].quantity = Number(e.target.value); setForm({ ...form, variants: u }) }} required /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="btn-add-variant-big btn-add-sub" onClick={() => addField("variants", { sku: "", colorName: "", size: "8GB", storage: "128GB", price: 0, importPrice: 0, quantity: 0 })}>+ Thêm cấu hình mới</button>
                </div>

                {/* 4. NỔI BẬT & THÔNG SỐ */}
                <div className="side-by-side" style={{display: 'flex', gap: '20px'}}>
                  <div className="form-card" style={{flex: 1}}>
                    <div className="card-header-form"><Zap size={18} /> Điểm nổi bật</div>
                    {form.highlights.map((h, i) => (
                      <div key={`highlight-${i}`} className="dynamic-row" style={{display: 'flex', gap: '10px', marginBottom: '8px'}}>
                        <input style={{flex: 1}} value={h} onChange={(e) => { const u = [...form.highlights]; u[i] = e.target.value; setForm({ ...form, highlights: u }) }} placeholder="Vd: Chip A17 Pro" />
                        <button type="button" className="remove-icon-btn" onClick={() => removeField("highlights", i)}><X size={16} /></button>
                      </div>
                    ))}
                    <button type="button" className="btn-add-sub" onClick={() => addField("highlights", "")}>+ Thêm dòng nổi bật</button>
                  </div>
                  
                  <div className="form-card" style={{flex: 1}}>
                    <div className="card-header-form">Thông số kỹ thuật</div>
                    {form.specs.map((s, i) => (
                      <div key={`spec-${i}`} className="dynamic-row" style={{display: 'flex', gap: '10px', marginBottom: '8px'}}>
                        <input style={{flex: 1}} placeholder="CPU" value={s.key} onChange={(e) => { const u = [...form.specs]; u[i].key = e.target.value; setForm({ ...form, specs: u }) }} />
                        <input style={{flex: 2}} placeholder="Apple A17" value={s.value} onChange={(e) => { const u = [...form.specs]; u[i].value = e.target.value; setForm({ ...form, specs: u }) }} />
                        <button type="button" className="remove-icon-btn" onClick={() => removeField("specs", i)}><X size={16} /></button>
                      </div>
                    ))}
                    <button type="button" className="btn-add-sub" onClick={() => addField("specs", { key: "", value: "" })}>+ Thêm thông số</button>
                  </div>
                </div>

              </div>

              {/* FOOTER */}
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
                  <button type="submit" className="btn-save-form"><Save size={18} /> {isEditing ? "Lưu thay đổi" : "Đăng bán ngay"}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}