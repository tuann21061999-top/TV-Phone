/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Trash2, Save, X, Edit3, Search, Settings, ImageIcon, Layers, Zap, Smartphone, ShieldCheck, Cpu, Link, ListPlus } from "lucide-react";
import { toast, Toaster } from "sonner";
import "./ManageProduct.css"; 

function ManageAccessory() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const accessorySpecsConfig = {
    "Ốp lưng": {
      icon: <Smartphone size={18} />,
      keys: ["Dòng máy", "Chất liệu", "Kiểu thiết kế", "Sạc không dây", "Loại bảo vệ"]
    },
    "Cường lực": {
      icon: <ShieldCheck size={18} />,
      keys: ["Dòng máy", "Loại kính", "Độ cứng", "Độ dày", "Lớp phủ", "Viền kính"]
    },
    "Dán lưng": {
      icon: <Cpu size={18} />,
      keys: ["Chất liệu", "Họa tiết", "Bề mặt", "Phạm vi dán"]
    },
    "Củ sạc": {
      icon: <Zap size={18} />,
      keys: ["Công suất", "Chuẩn sạc nhanh", "Số cổng", "Loại cổng", "Chân cắm"]
    },
    "Cáp sạc": {
      icon: <Link size={18} />,
      keys: ["Loại đầu cáp", "Chiều dài", "Công suất", "Chất liệu dây", "Tính năng"]
    }
  };

  const emptyForm = {
    name: "", brand: "", description: "Phụ kiện cao cấp chính hãng", 
    productType: "accessory", 
    categoryName: "Ốp lưng", 
    condition: "new",
    colorImages: [{ colorName: "Mặc định", imageUrl: "", isDefault: true }],
    highlights: [""], 
    isFeatured: false, 
    isActive: true,
    specs: [], 
    variants: [{ sku: "", colorName: "Mặc định", size: "Standard", price: 0, importPrice: 0, quantity: 0 }],
  };

  const [form, setForm] = useState(emptyForm);
  const token = localStorage.getItem("token");
  
  const api = axios.create({
    baseURL: "http://localhost:5000/api/products",
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    if (!isEditing && accessorySpecsConfig[form.categoryName]) {
      const defaultSpecs = accessorySpecsConfig[form.categoryName].keys.map(key => ({
        key: key, value: "" 
      }));
      setForm(prev => ({ ...prev, specs: defaultSpecs }));
    }
  }, [form.categoryName, isEditing]);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/");
      const accessoriesOnly = res.data.filter(p => p.productType === "accessory");
      setProducts(accessoriesOnly);
    } catch (err) { 
        console.error("Lỗi tải dữ liệu:", err);
    }
  };

  const addField = (field, template) => {
    setForm({ ...form, [field]: [...form[field], template] });
  };

  const removeField = (field, index) => {
    if (form[field].length <= 1 && field !== 'specs') return;
    const updated = [...form[field]];
    updated.splice(index, 1);
    setForm({ ...form, [field]: updated });
  };

  const handleEdit = (p) => {
    setIsEditing(true);
    setCurrentId(p._id);
    
    // Chuyển specs từ Object sang Array
    const specsArr = p.specs && typeof p.specs === 'object' 
      ? Object.entries(p.specs).map(([k, v]) => ({ key: k, value: v }))
      : [];
    
    setForm({ 
      ...p, 
      categoryName: p.categoryId?.name || p.categoryId || p.categoryName || "Ốp lưng",
      specs: specsArr,
      variants: p.variants?.map(v => ({
        ...v,
        importPrice: v.importPrice || 0,
        price: v.price || 0,
        quantity: v.quantity || 0
      })) || []
    });
    
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setCurrentId(null);
    setForm(emptyForm);
    document.body.style.overflow = 'unset';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loading = toast.loading(isEditing ? "Đang cập nhật..." : "Đang lưu phụ kiện...");
    
    try {
      let finalCategoryId = "";

      // 1. Xử lý Category (Tạo mới hoặc lấy ID hiện có)
      if (form.categoryName) {
        try {
          const catRes = await axios.post(
            "http://localhost:5000/api/categories",
            { name: form.categoryName.trim() },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          finalCategoryId = catRes.data._id;
        } catch (err) {
          if (err.response?.data?.message === "Danh mục đã tồn tại") {
            const list = await axios.get("http://localhost:5000/api/categories");
            const found = list.data.find(
              (c) => c.name.toLowerCase() === form.categoryName.trim().toLowerCase()
            );
            if (found) finalCategoryId = found._id;
          } else {
            throw err;
          }
        }
      }

      // 2. Chuyển Specs từ Array sang Object
      const specsObj = form.specs.reduce((acc, cur) => {
        if (cur.key && cur.key.trim()) {
          acc[cur.key.trim()] = cur.value;
        }
        return acc;
      }, {});

      // 3. Chuẩn hóa Variants và tạo SKU
      const validatedVariants = form.variants.map((v, idx) => ({
        ...v,
        price: Number(v.price) || 0,
        importPrice: Number(v.importPrice) || 0,
        quantity: Number(v.quantity) || 0,
        sku: v.sku && v.sku.trim() !== "" 
          ? v.sku 
          : `ACC-${form.brand.substring(0, 2).toUpperCase()}-${Date.now()}-${idx}`
      }));

      // 4. Tạo Payload
      const { categoryName, ...restForm } = form;
      const dataToSave = { 
        ...restForm, 
        categoryId: finalCategoryId,
        specs: specsObj, 
        variants: validatedVariants 
      };

      if (isEditing) {
        await api.put(`/${currentId}`, dataToSave);
        toast.success("Cập nhật thành công!", { id: loading });
      } else {
        await api.post("/", dataToSave);
        toast.success("Thêm phụ kiện thành công!", { id: loading });
      }

      closeModal();
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Lỗi hệ thống!", { id: loading });
    }
  };

  return (
    <div className="manage-product">
      <Toaster position="top-right" richColors />
      <div className="admin-header">
        <div className="header-left">
          <h2>Kho Phụ Kiện</h2>
          <div className="search-box">
            <Search size={18} color="#64748b" />
            <input placeholder="Tìm ốp, sạc, cáp..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <button className="btn-add-main" style={{backgroundColor: '#8b5cf6'}} onClick={() => { setForm(emptyForm); setIsEditing(false); setShowModal(true); document.body.style.overflow = 'hidden'; }}>
          <Plus size={20} /> Thêm phụ kiện
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Tên phụ kiện</th>
              <th>Loại</th>
              <th>Giá nhập</th>
              <th>Giá bán</th>
              <th>Tồn kho</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
              <tr key={p._id} className={!p.isActive ? "row-disabled" : ""}>
                <td>
                    <div className="product-info-cell">
                        <strong>{p.name}</strong><br/>
                        <small className="brand-tag">{p.brand}</small>
                    </div>
                </td>
                <td>
                  <span className="type-badge-acc" style={{background: '#f3e8ff', color: '#7e22ce', padding: '2px 8px', borderRadius: '4px', fontSize: '12px'}}>
                    {p.categoryId?.name || p.categoryName || "Phụ kiện"}
                  </span>
                </td>
                <td style={{color: '#94a3b8'}}>{Math.min(...(p.variants?.map(v => v.importPrice) || [0])).toLocaleString()}đ</td>
                <td style={{color: '#8b5cf6', fontWeight: 'bold'}}>{Math.min(...(p.variants?.map(v => v.price) || [0])).toLocaleString()}đ</td>
                <td>{p.variants?.reduce((sum, v) => sum + v.quantity, 0)}</td>
                <td className="actions">
                  <button onClick={() => handleEdit(p)} className="edit-btn"><Edit3 size={16} /></button>
                  <button 
                    onClick={async () => {
                        if(!window.confirm("Xác nhận xóa phụ kiện này?")) return;
                        try {
                            await api.delete(`/${p._id}`);
                            toast.success("Đã xóa");
                            fetchProducts();
                        } catch(err) { toast.error("Không thể xóa"); }
                    }} 
                    className="delete-btn"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-window" style={{maxWidth: '1000px'}}>
            <div className="modal-header">
              <div className="modal-title">
                {isEditing ? <Edit3 size={20} color="#8b5cf6" /> : <Plus size={20} color="#8b5cf6" />}
                <h3>{isEditing ? `Chỉnh sửa: ${form.name}` : "Nhập phụ kiện mới"}</h3>
              </div>
              <button className="modal-close-btn" onClick={closeModal}><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-scroll-body">
                
                <div className="form-card">
                  <div className="card-header-form"><Settings size={18} /> Thông tin cơ bản</div>
                  <div className="input-row">
                    <div className="field full">
                      <label>Tên sản phẩm *</label>
                      <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Vd: Ốp lưng iPhone 15 Pro Max Silicon Case" />
                    </div>
                    <div className="field">
                      <label>Phân loại phụ kiện</label>
                      <select value={form.categoryName} onChange={e => setForm({...form, categoryName: e.target.value})}>
                        {Object.keys(accessorySpecsConfig).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label>Hãng</label>
                      <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} placeholder="Apple, Samsung, Hoco..." />
                    </div>
                  </div>
                </div>

                <div className="form-card">
                  <div className="card-header-form"><ImageIcon size={18} color="#8b5cf6" /> Hình ảnh & Màu sắc</div>
                  {form.colorImages.map((ci, i) => (
                    <div key={i} className="dynamic-row-color" style={{display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center'}}>
                      <input style={{flex: 1}} placeholder="Tên màu" value={ci.colorName} onChange={e => {
                        const u = [...form.colorImages]; u[i].colorName = e.target.value; setForm({...form, colorImages: u});
                      }} required />
                      <input style={{flex: 2}} placeholder="Link URL hình ảnh" value={ci.imageUrl} onChange={e => {
                        const u = [...form.colorImages]; u[i].imageUrl = e.target.value; setForm({...form, colorImages: u});
                      }} required />
                      <label className="checkbox-default">
                        <input type="checkbox" checked={ci.isDefault} onChange={() => {
                          const u = form.colorImages.map((item, idx) => ({ ...item, isDefault: idx === i }));
                          setForm({...form, colorImages: u});
                        }} /> <span>Mặc định</span>
                      </label>
                      <button type="button" className="btn-icon-remove" onClick={() => removeField("colorImages", i)}><Trash2 size={16}/></button>
                    </div>
                  ))}
                  <button type="button" className="btn-add-sub" onClick={() => addField("colorImages", { colorName: "", imageUrl: "", isDefault: false })}>+ Thêm màu sắc</button>
                </div>

                <div className="side-by-side" style={{display: 'flex', gap: '20px'}}>
                  <div className="form-card" style={{flex: 2, borderLeft: '4px solid #8b5cf6'}}>
                    <div className="card-header-form"><ListPlus size={18} color="#8b5cf6" /> Thông số & Giá trị</div>
                    <div className="specs-grid-admin">
                      {form.specs.map((spec, idx) => (
                        <div key={idx} className="spec-input-group">
                          <input className="spec-key-input" value={spec.key} onChange={e => {
                            const newSpecs = [...form.specs]; newSpecs[idx].key = e.target.value; setForm({...form, specs: newSpecs});
                          }} placeholder="Tên thông số" />
                          <input className="spec-val-input" value={spec.value} onChange={e => {
                            const newSpecs = [...form.specs]; newSpecs[idx].value = e.target.value; setForm({...form, specs: newSpecs});
                          }} placeholder="Giá trị..." />
                          <X size={14} className="remove-spec-icon" onClick={() => removeField("specs", idx)} />
                        </div>
                      ))}
                    </div>
                    <button type="button" className="btn-add-sub" onClick={() => addField("specs", {key: "", value: ""})}>+ Thêm thông số</button>
                  </div>

                  <div className="form-card" style={{flex: 1}}>
                    <div className="card-header-form"><Zap size={18} color="#f59e0b" /> Điểm nổi bật</div>
                    {form.highlights.map((h, i) => (
                      <div key={i} className="dynamic-row" style={{marginBottom: '8px'}}>
                        <input style={{flex: 1}} value={h} onChange={e => {
                          const n = [...form.highlights]; n[i] = e.target.value; setForm({...form, highlights: n});
                        }} placeholder="Vd: Chống sốc chuẩn quân đội" />
                        <button type="button" className="btn-icon-remove" onClick={() => removeField("highlights", i)}><Trash2 size={14}/></button>
                      </div>
                    ))}
                    <button type="button" className="btn-add-sub" onClick={() => addField("highlights", "")}>+ Thêm</button>
                  </div>
                </div>

                <div className="form-card">
                  <div className="card-header-form"><Layers size={18} color="#8b5cf6" /> Phân loại & Giá</div>
                  {form.variants.map((v, i) => (
                    <div key={i} className="variant-block-advanced">
                      <div className="variant-grid" style={{display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 40px', gap: '10px', alignItems: 'center'}}>
                        <select value={v.colorName} onChange={e => {
                          const u = [...form.variants]; u[i].colorName = e.target.value; setForm({...form, variants: u});
                        }} required>
                          <option value="">-- Chọn màu sắc --</option>
                          {form.colorImages.map(c => (
                            <option key={c.colorName} value={c.colorName}>{c.colorName || "Màu chưa đặt tên"}</option>
                          ))}
                        </select>
                        <input placeholder="Giá nhập" type="number" value={v.importPrice} onChange={e => {
                          const u = [...form.variants]; u[i].importPrice = e.target.value; setForm({...form, variants: u});
                        }} />
                        <input placeholder="Giá bán" type="number" style={{fontWeight: 'bold', color: '#8b5cf6'}} value={v.price} onChange={e => {
                          const u = [...form.variants]; u[i].price = e.target.value; setForm({...form, variants: u});
                        }} />
                        <input placeholder="Số lượng" type="number" value={v.quantity} onChange={e => {
                          const u = [...form.variants]; u[i].quantity = e.target.value; setForm({...form, variants: u});
                        }} />
                        <button type="button" className="btn-remove-v" onClick={() => removeField("variants", i)}><Trash2 size={18}/></button>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn-add-variant-big" onClick={() => addField("variants", {sku: "", colorName: "", size: "Standard", price: 0, importPrice: 0, quantity: 0})}>+ Thêm phiên bản giá mới</button>
                </div>
              </div>

              <div className="modal-footer-sticky">
                <div className="footer-left">
                  <label className="switch-label">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                    <span>Đang kinh doanh</span>
                  </label>
                </div>
                <div className="footer-right">
                    <button type="button" className="btn-close-form" onClick={closeModal}>Hủy</button>
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

export default ManageAccessory;