/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Trash2, Save, X, Edit3, Search, Settings, Layers, Zap, Headphones, Watch, BatteryCharging, Snowflake, ListPlus, ImageIcon } from "lucide-react";
import { toast, Toaster } from "sonner";
import "./ManageProduct.css";

function ManageElectronic() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const electronicSpecsConfig = {
    "Tai nghe": {
      icon: <Headphones size={18} />,
      keys: ["Kiểu tai nghe", "Kết nối", "Bluetooth", "Chống ồn", "Thời lượng pin", "Cổng sạc", "Kháng nước"]
    },
    "Sạc dự phòng": {
      icon: <BatteryCharging size={18} />,
      keys: ["Dung lượng", "Công suất", "Số cổng", "Loại cổng", "Sạc nhanh", "Tính năng"]
    },
    "Đồng hồ": {
      icon: <Watch size={18} />,
      keys: ["Kích thước mặt", "Chất liệu dây", "Phiên bản", "Tương thích", "Kháng nước", "Sức khỏe"]
    },
    "Quạt tản nhiệt": {
      icon: <Snowflake size={18} />,
      keys: ["Kết nối", "Tương thích", "Kiểu gắn", "Tốc độ quạt", "Đèn LED"]
    }
  };

  const emptyForm = {
    name: "", brand: "", description: "Sản phẩm điện tử chất lượng cao",
    productType: "electronic",
    categoryName: "Tai nghe",
    condition: "new",
    colorImages: [{ colorName: "Mặc định", imageUrl: "", isDefault: true }],
    highlights: [""], 
    isFeatured: false, 
    isActive: true,
    specs: [], 
    variants: [{ sku: "", colorName: "Mặc định", size: "Standard", storage: "N/A", price: 0, importPrice: 0, quantity: 0 }],
  };

  const [form, setForm] = useState(emptyForm);
  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "http://localhost:5000/api/products",
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => { fetchProducts(); }, []);

  // Tự động điền mẫu thông số khi chọn Category (chỉ khi thêm mới)
  useEffect(() => {
    if (!isEditing && electronicSpecsConfig[form.categoryName]) {
      const defaultSpecs = electronicSpecsConfig[form.categoryName].keys.map(key => ({
        key: key, value: "" 
      }));
      setForm(prev => ({ ...prev, specs: defaultSpecs }));
    }
  }, [form.categoryName, isEditing]);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/");
      // Lọc lấy sản phẩm điện tử
      const electronicsOnly = res.data.filter(p => p.productType === "electronic");
      setProducts(electronicsOnly);
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
    
    // Chuyển specs từ Object { CPU: "..." } sang Array [{ key: "CPU", value: "..." }]
    const specsArr = p.specs && typeof p.specs === 'object' 
      ? Object.entries(p.specs).map(([k, v]) => ({ key: k, value: v }))
      : [];
    
    setForm({ 
      ...p, 
      categoryName: p.categoryId?.name || p.categoryId || p.categoryName || "",
      specs: specsArr.length > 0 ? specsArr : [],
      variants: p.variants?.map(v => ({
        ...v,
        importPrice: v.importPrice || 0,
        storage: v.storage || "N/A",
        size: v.size || "Standard"
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
    const loading = toast.loading(isEditing ? "Đang cập nhật..." : "Đang đăng sản phẩm...");

    try {
      let finalCategoryId = "";

      // 1. Xử lý Category (Giống ManagePhone)
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
          : `ELEC-${form.name.substring(0, 3).toUpperCase()}-${v.colorName.replace(/\s+/g, "")}-${Date.now()}-${idx}`
      }));

      // 4. Loại bỏ categoryName khỏi payload chính
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
        toast.success("Đăng bán thành công!", { id: loading });
      }

      closeModal();
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Có lỗi xảy ra!", { id: loading });
    }
  };

  const toggleActive = async (product) => {
    try {
      await api.put(`/${product._id}`, { isActive: !product.isActive });
      fetchProducts();
    } catch (err) { 
      toast.error("Không thể thay đổi trạng thái!"); 
    }
  };

  return (
    <div className="manage-product">
      <Toaster position="top-right" richColors />
      <div className="admin-header">
        <div className="header-left">
          <h2>Quản lý Đồ Điện Tử</h2>
          <div className="search-box">
            <Search size={18} color="#64748b" />
            <input placeholder="Tìm thiết bị..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <button className="btn-add-main" onClick={() => { setForm(emptyForm); setIsEditing(false); setShowModal(true); document.body.style.overflow = 'hidden'; }}>
          <Plus size={20} /> Thêm thiết bị mới
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Thiết bị</th>
              <th>Phân loại</th>
              <th>Giá nhập</th>
              <th>Giá bán</th>
              <th>Tồn kho</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
              <tr key={p._id} className={!p.isActive ? "row-disabled" : ""}>
                <td>
                    <div className="product-info-cell">
                        <strong>{p.name}</strong>
                    </div>
                </td>
                <td><span className="type-badge">{p.categoryId?.name || p.categoryName || "Điện tử"}</span></td>
                <td style={{color: '#94a3b8'}}>{Math.min(...(p.variants?.map(v => v.importPrice) || [0])).toLocaleString()}đ</td>
                <td style={{fontWeight: 'bold', color: '#10b981'}}>{Math.min(...(p.variants?.map(v => v.price) || [0])).toLocaleString()}đ</td>
                <td>{p.variants?.reduce((sum, v) => sum + v.quantity, 0)}</td>
                <td className="actions">
                  <button onClick={() => handleEdit(p)} className="edit-btn"><Edit3 size={16} /></button>
                  <button
                    onClick={async () => {
                      if (!window.confirm("Xóa vĩnh viễn sản phẩm này?")) return;
                      const deleting = toast.loading("Đang xóa...");
                      try {
                        await api.delete(`/${p._id}`);
                        toast.success("Đã xóa!", { id: deleting });
                        fetchProducts();
                      } catch (err) {
                        toast.error("Xóa thất bại!", { id: deleting });
                      }
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
                
                <div className="form-card">
                  <div className="card-header-form"><Settings size={18} /> Thông tin chung</div>
                  <div className="input-row">
                    <div className="field full">
                      <label>Tên sản phẩm *</label>
                      <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Ví dụ: Tai nghe Sony WH-1000XM5" />
                    </div>
                    <div className="field">
                      <label>Danh mục</label>
                      <select value={form.categoryName} onChange={e => setForm({...form, categoryName: e.target.value})}>
                        {Object.keys(electronicSpecsConfig).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label>Hãng</label>
                      <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} placeholder="Sony, Apple, JBL..." />
                    </div>
                  </div>
                </div>

                <div className="form-card">
                  <div className="card-header-form"><Zap size={18} color="#f59e0b" /> Đặc điểm nổi bật</div>
                  {form.highlights.map((h, i) => (
                    <div key={i} className="dynamic-row" style={{marginBottom: '8px'}}>
                      <input style={{flex: 1}} value={h} onChange={e => {
                        const newH = [...form.highlights]; newH[i] = e.target.value; setForm({...form, highlights: newH});
                      }} placeholder="Vd: Pin trâu 50 giờ sử dụng" />
                      <button type="button" className="btn-icon-remove" onClick={() => removeField("highlights", i)}><Trash2 size={16}/></button>
                    </div>
                  ))}
                  <button type="button" className="btn-add-sub" onClick={() => addField("highlights", "")}>+ Thêm đặc điểm</button>
                </div>

                <div className="form-card">
                  <div className="card-header-form"><ImageIcon size={18} /> Hình ảnh theo màu sắc</div>
                  <div className="color-images-grid">
                    {form.colorImages.map((ci, i) => (
                      <div key={i} className="dynamic-row-color">
                        <input className="input-color-name" placeholder="Tên màu" value={ci.colorName} onChange={e => {
                          const u = [...form.colorImages]; u[i].colorName = e.target.value; setForm({...form, colorImages: u});
                        }} required />
                        <input className="input-color-url" placeholder="URL hình ảnh" value={ci.imageUrl} onChange={e => {
                          const u = [...form.colorImages]; u[i].imageUrl = e.target.value; setForm({...form, colorImages: u});
                        }} required />
                        <label className="checkbox-default">
                          <input type="checkbox" checked={ci.isDefault} onChange={() => {
                            const u = form.colorImages.map((item, idx) => ({ ...item, isDefault: idx === i }));
                            setForm({...form, colorImages: u});
                          }} /> <span>Mặc định</span>
                        </label>
                        <button type="button" className="btn-icon-remove" onClick={() => removeField("colorImages", i)}><Trash2 size={18} /></button>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="btn-add-sub" onClick={() => addField("colorImages", { colorName: "", imageUrl: "", isDefault: false })}>+ Thêm màu mới</button>
                </div>

                <div className="form-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                  <div className="card-header-form"><ListPlus size={18} /> Thông số kỹ thuật</div>
                  <div className="specs-grid-admin">
                    {form.specs.map((spec, idx) => (
                      <div key={idx} className="spec-input-group">
                        <input className="spec-key-input" value={spec.key} onChange={e => {
                          const newSpecs = [...form.specs]; newSpecs[idx].key = e.target.value; setForm({...form, specs: newSpecs});
                        }} placeholder="Tên thông số" />
                        <input className="spec-val-input" value={spec.value} onChange={e => {
                          const newSpecs = [...form.specs]; newSpecs[idx].value = e.target.value; setForm({...form, specs: newSpecs});
                        }} placeholder="Giá trị..." />
                        <X size={16} className="remove-spec-icon" onClick={() => removeField("specs", idx)} />
                      </div>
                    ))}
                  </div>
                  <button type="button" className="btn-add-sub" onClick={() => addField("specs", {key: "", value: ""})}>+ Thêm thông số</button>
                </div>

                <div className="form-card">
                  <div className="card-header-form"><Layers size={18} /> Biến thể & Giá bán</div>
                  {form.variants.map((v, i) => (
                    <div key={i} className="variant-block-advanced">
                      <div className="variant-grid">
                        <div className="v-field">
                          <label>Màu sắc</label>
                          <select value={v.colorName} onChange={e => {
                            const u = [...form.variants]; u[i].colorName = e.target.value; setForm({...form, variants: u});
                          }} required>
                            <option value="">-- Chọn màu --</option>
                            {form.colorImages.map(c => (
                              <option key={c.colorName} value={c.colorName}>{c.colorName || "Màu chưa đặt tên"}</option>
                            ))}
                          </select>
                        </div>
                        <div className="v-field">
                          <label>Giá nhập</label>
                          <input type="number" value={v.importPrice} onChange={e => {
                            const u = [...form.variants]; u[i].importPrice = e.target.value; setForm({...form, variants: u});
                          }} />
                        </div>
                        <div className="v-field">
                          <label>Giá bán</label>
                          <input type="number" value={v.price} onChange={e => {
                            const u = [...form.variants]; u[i].price = e.target.value; setForm({...form, variants: u});
                          }} />
                        </div>
                        <div className="v-field">
                          <label>Số lượng</label>
                          <input type="number" value={v.quantity} onChange={e => {
                            const u = [...form.variants]; u[i].quantity = e.target.value; setForm({...form, variants: u});
                          }} />
                        </div>
                        <button type="button" className="btn-remove-v" onClick={() => removeField("variants", i)}><Trash2 size={18}/></button>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn-add-variant-big" onClick={() => addField("variants", {sku: "", colorName: "", size: "Standard", storage: "N/A", price: 0, importPrice: 0, quantity: 0})}>+ Thêm biến thể giá</button>
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
                    <button type="submit" className="btn-save-form"><Save size={18} /> Lưu vào kho</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageElectronic;