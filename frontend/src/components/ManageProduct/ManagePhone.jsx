import React from "react";
import { Plus, Trash2, Save, X, Edit3, Eye, EyeOff, Search, Settings, ImageIcon, Layers, Zap, ListPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useProductManager } from "./useProductManager";
import "./ManageProduct.css";

const sizeOptions = ["6GB", "8GB", "12GB", "16GB", "18GB", "24GB", "28GB", "32GB"];
const storageOptions = ["64GB", "128GB", "256GB", "512GB", "1TB", "2TB"];

const emptyForm = {
  name: "", brand: "", productGroup: "", description: "", productType: "device",
  categoryName: "Điện thoại", condition: "new", conditionLevel: ["99%"],
  colorImages: [{ colorName: "", imageUrl: "", isDefault: true, imageFile: null }],
  detailImages: [],
  highlights: [""], isFeatured: false, isActive: true,
  specs: [
    { key: "Màn hình", value: "" },
    { key: "Hệ điều hành", value: "" },
    { key: "Camera sau", value: "" },
    { key: "Camera trước", value: "" },
    { key: "CPU", value: "" },
    { key: "RAM", value: "" },
    { key: "Bộ nhớ trong", value: "" },
    { key: "Thẻ SIM", value: "" },
    { key: "Dung lượng pin", value: "" },
    { key: "Thiết kế", value: "" }
  ],
  detailedSpecs: {
    "Thông tin chung": [
      { key: "Hệ điều hành", value: "" },
      { key: "Ngôn ngữ", value: "" }
    ],
    "Màn hình": [
      { key: "Loại màn hình", value: "" },
      { key: "Màu màn hình", value: "" },
      { key: "Chuẩn màn hình", value: "" },
      { key: "Độ phân giải", value: "" },
      { key: "Màn hình rộng", value: "" },
      { key: "Công nghệ cảm ứng", value: "" }
    ],
    "Chụp hình & Quay phim": [
      { key: "Camera sau", value: "" },
      { key: "Camera trước", value: "" },
      { key: "Đèn Flash", value: "" },
      { key: "Tính năng camera", value: "" },
      { key: "Quay phim", value: "" },
      { key: "Videocall", value: "" }
    ],
    "CPU & RAM": [
      { key: "Tốc độ CPU", value: "" },
      { key: "Số nhân", value: "" },
      { key: "Chipset", value: "" },
      { key: "RAM", value: "" },
      { key: "Chip đồ họa (GPU)", value: "" }
    ],
    "Bộ nhớ & Lưu trữ": [
      { key: "Danh bạ", value: "" },
      { key: "Bộ nhớ trong (ROM)", value: "" },
      { key: "Thẻ nhớ ngoài", value: "" },
      { key: "Hỗ trợ thẻ tối đa", value: "" }
    ],
    "Thiết kế & Trọng lượng": [
      { key: "Kiểu dáng", value: "" },
      { key: "Kích thước", value: "" },
      { key: "Trọng lượng (g)", value: "" }
    ],
    "Thông tin pin": [
      { key: "Loại pin", value: "" },
      { key: "Dung lượng pin", value: "" },
      { key: "Pin có thể tháo rời", value: "" }
    ],
    "Kết nối & Cổng giao tiếp": [
      { key: "3G", value: "" },
      { key: "4G", value: "" },
      { key: "Loại Sim", value: "" },
      { key: "Khe gắn Sim", value: "" },
      { key: "Wifi", value: "" },
      { key: "GPS", value: "" },
      { key: "Bluetooth", value: "" },
      { key: "GPRS/EDGE", value: "" },
      { key: "Jack tai nghe", value: "" },
      { key: "NFC", value: "" },
      { key: "Kết nối USB", value: "" },
      { key: "Kết nối khác", value: "" },
      { key: "Cổng sạc", value: "" }
    ],
    "Giải trí & Ứng dụng": [
      { key: "Xem phim", value: "" },
      { key: "Nghe nhạc", value: "" },
      { key: "Ghi âm", value: "" },
      { key: "FM radio", value: "" },
      { key: "Chức năng khác", value: "" }
    ]
  },
  variants: [{ sku: "", size: "8GB", storage: "128GB", condition: "99%", price: 0, importPrice: 0, colors: [{ colorName: "", quantity: 0 }] }],
};

export default function ManagePhone() {
  const {
    products, form, setForm, showModal, isEditing, searchTerm, setSearchTerm,
    addField, removeField, handleImageFileChange, handleDetailImageChange, openModalForAdd, openModalForEdit, closeModal, handleDelete, toggleActive, handleSubmit
  } = useProductManager("device", emptyForm);

  const [activeTab, setActiveTab] = React.useState("Tất cả");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const cat = p.categoryId?.name || p.categoryName || "Điện thoại";
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
          <h2>Kho Điện Thoại</h2>
          <div className="search-box">
            <Search size={18} color="#64748b" />
            <input placeholder="Tìm theo tên..." value={searchTerm} onChange={handleSearch} />
          </div>
        </div>
        <button className="btn-add-main" onClick={openModalForAdd}>
          <Plus size={20} /> Thêm điện thoại mới
        </button>
      </div>

      {/* TABS PHÂN LOẠI */}
      <div className="category-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
        {["Tất cả", "Điện thoại", "Tablet"].map(tab => (
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

      {/* TABLE */}
      <div className="table-container">
        <table>
          <thead>
            <tr><th>Sản phẩm</th><th>Loại</th><th>Giá sàn</th><th>Tồn kho</th><th>Trạng thái</th><th>Thao tác</th></tr>
          </thead>
          <tbody>
            {currentProducts.map((p) => (
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
                      <label>Nhóm SP Liên kết (Tùy chọn)</label>
                      <input value={form.productGroup} onChange={(e) => setForm({ ...form, productGroup: e.target.value })} placeholder="VD: GRP-IPHONE15" />
                    </div>
                    <div className="field">
                      <label>Danh mục sản phẩm *</label>
                      <select
                        value={form.categoryName}
                        onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
                      >
                        <option value="Điện thoại">Điện thoại</option>
                        <option value="Tablet">Tablet</option>
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
                                const u = [...form.conditionLevel]; u.splice(idx, 1); setForm({ ...form, conditionLevel: u });
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
                      <textarea rows="6" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả chung về sản phẩm..." />
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

                {/* 2.5 HÌNH ẢNH CHI TIẾT */}
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
                        <div className="v-body-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                            <div className="v-field" style={{ flex: '1 1 45%' }}>
                              <label>RAM</label>
                              <select value={v.size} onChange={(e) => { const u = [...form.variants]; u[i].size = e.target.value; setForm({ ...form, variants: u }) }} required>
                                {sizeOptions.map(opt => <option key={`ram-${opt}`} value={opt}>{opt}</option>)}
                              </select>
                            </div>
                            <div className="v-field" style={{ flex: '1 1 45%' }}>
                              <label>Bộ nhớ (ROM)</label>
                              <select value={v.storage} onChange={(e) => { const u = [...form.variants]; u[i].storage = e.target.value; setForm({ ...form, variants: u }) }} required>
                                {storageOptions.map(opt => <option key={`rom-${opt}`} value={opt}>{opt}</option>)}
                              </select>
                            </div>
                            {form.condition === "used" && (
                              <div className="v-field" style={{ flex: '1 1 45%' }}>
                                <label>Tình trạng</label>
                                <select value={v.condition} onChange={(e) => { const u = [...form.variants]; u[i].condition = e.target.value; setForm({ ...form, variants: u }) }} required>
                                  {form.conditionLevel.map(lvl => <option key={`cond-${lvl}`} value={lvl}>{lvl}</option>)}
                                </select>
                              </div>
                            )}
                            <div className="v-field" style={{ flex: '1 1 45%' }}><label>Giá bán (đ)</label><input type="number" value={v.price} onChange={(e) => { const u = [...form.variants]; u[i].price = Number(e.target.value); setForm({ ...form, variants: u }) }} required /></div>
                            <div className="v-field" style={{ flex: '1 1 45%' }}><label>Giá nhập (đ)</label><input type="number" value={v.importPrice} onChange={(e) => { const u = [...form.variants]; u[i].importPrice = Number(e.target.value); setForm({ ...form, variants: u }) }} /></div>
                          </div>

                          <div className="colors-section" style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <label style={{ margin: 0, fontWeight: '600', color: '#334155' }}>Màu sắc & Số lượng</label>
                            </div>

                            {v.colors?.map((c, cIdx) => (
                              <div key={`color-${i}-${cIdx}`} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                                <select value={c.colorName} onChange={(e) => { const u = [...form.variants]; u[i].colors[cIdx].colorName = e.target.value; setForm({ ...form, variants: u }) }} style={{ flex: 1.5 }} required>
                                  <option value="">-- Chọn màu --</option>
                                  {form.colorImages
                                    .filter(img => {
                                      // Chỉ hiện những màu chưa được chọn trong mảng colors của variant hiện tại,
                                      // HOẶC chính là màu đang được chọn ở dropdown này (để hiển thị đúng value hiện tại)
                                      const isSelectedElsewhere = v.colors.some((vc, idx) => idx !== cIdx && vc.colorName === img.colorName);
                                      return !isSelectedElsewhere;
                                    })
                                    .map((img, idx) => (
                                      <option key={`opt-${idx}-${img.colorName}`} value={img.colorName}>
                                        {img.colorName || "Chưa nhập tên màu"}
                                      </option>
                                    ))}
                                </select>
                                <input type="number" placeholder="Số lượng" value={c.quantity} onChange={(e) => { const u = [...form.variants]; u[i].colors[cIdx].quantity = Number(e.target.value); setForm({ ...form, variants: u }) }} style={{ flex: 1 }} min="0" required />
                                <button type="button" className="remove-icon-btn text-danger-icon" onClick={() => {
                                  const u = [...form.variants];
                                  if (u[i].colors.length > 1) {
                                    u[i].colors.splice(cIdx, 1);
                                    setForm({ ...form, variants: u });
                                  } else {
                                    toast.error("Phải có ít nhất 1 màu cho mỗi cấu hình!");
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
                  <button type="button" className="btn-add-variant-big btn-add-sub" onClick={() => addField("variants", { sku: "", size: "8GB", storage: "128GB", condition: form.conditionLevel[0] || "", price: 0, importPrice: 0, colors: [{ colorName: "", quantity: 0 }] })}>+ Thêm cấu hình mới</button>
                </div>

                {/* 4. NỔI BẬT & THÔNG SỐ */}
                <div className="side-by-side" style={{ display: 'flex', gap: '20px' }}>
                  <div className="form-card" style={{ flex: 1 }}>
                    <div className="card-header-form"><Zap size={18} /> Điểm nổi bật</div>
                    {form.highlights.map((h, i) => (
                      <div key={`highlight-${i}`} className="dynamic-row" style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                        <input style={{ flex: 1 }} value={h} onChange={(e) => { const u = [...form.highlights]; u[i] = e.target.value; setForm({ ...form, highlights: u }) }} placeholder="Vd: Chip A17 Pro" />
                        <button type="button" className="remove-icon-btn" onClick={() => removeField("highlights", i)}><X size={16} /></button>
                      </div>
                    ))}
                    <button type="button" className="btn-add-sub" onClick={() => addField("highlights", "")}>+ Thêm dòng nổi bật</button>
                  </div>

                  <div className="form-card" style={{ flex: 1 }}>
                    <div className="card-header-form">Thông số kỹ thuật tổng quát</div>
                    {form.specs.map((s, i) => (
                      <div key={`spec-${i}`} className="dynamic-row" style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                        <input style={{ flex: 1 }} placeholder="CPU" value={s.key} onChange={(e) => { const u = [...form.specs]; u[i].key = e.target.value; setForm({ ...form, specs: u }) }} />
                        <input style={{ flex: 2 }} placeholder="Apple A17" value={s.value} onChange={(e) => { const u = [...form.specs]; u[i].value = e.target.value; setForm({ ...form, specs: u }) }} />
                        <button type="button" className="remove-icon-btn" onClick={() => removeField("specs", i)}><X size={16} /></button>
                      </div>
                    ))}
                    <button type="button" className="btn-add-sub" onClick={() => addField("specs", { key: "", value: "" })}>+ Thêm thông số</button>
                  </div>
                </div>

                {/* 5. CẤU HÌNH CHI TIẾT (FULL SPECS) */}
                <div className="form-card detailed-specs-section">
                  <div className="card-header-form"><ListPlus size={18} /> Cấu hình chi tiết (SpecDetail)</div>
                  {Object.keys(form.detailedSpecs || emptyForm.detailedSpecs).map((groupName, gIdx) => (
                    <div key={`ds-group-${gIdx}`} style={{ marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#1e293b', borderBottom: '2px solid #cbd5e1', paddingBottom: '5px' }}>{groupName}</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                        {(form.detailedSpecs?.[groupName] || emptyForm.detailedSpecs[groupName]).map((spec, sIdx) => (
                          <div key={`ds-item-${gIdx}-${sIdx}`} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>{spec.key}</label>
                            <textarea
                              rows="2"
                              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical' }}
                              placeholder="Nhập thông số..."
                              value={spec.value || ""}
                              onChange={(e) => {
                                const newDetailedSpecs = { ...form.detailedSpecs };
                                if (!newDetailedSpecs[groupName]) {
                                  // Dự phòng trường hợp missing structure
                                  newDetailedSpecs[groupName] = JSON.parse(JSON.stringify(emptyForm.detailedSpecs[groupName]));
                                }
                                newDetailedSpecs[groupName][sIdx].value = e.target.value;
                                setForm({ ...form, detailedSpecs: newDetailedSpecs });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* FOOTER */}
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