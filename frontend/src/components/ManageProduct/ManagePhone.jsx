/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Trash2, Save, X, Edit3, Eye, EyeOff, Search, Settings, ImageIcon, Layers, Zap, CheckCircle2, ListPlus } from "lucide-react";
import { toast, Toaster } from "sonner";
import "./ManageProduct.css";

function ManagePhone() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const sizeOptions = ["6GB", "8GB", "12GB", "16GB", "18GB", "24GB", "28GB", "32GB"];
  const storageOptions = ["64GB", "128GB", "256GB", "512GB", "1TB", "2TB"];

  const emptyForm = {
    name: "", brand: "", description: "", productType: "device", 
    categoryName: "", // Thay categoryId bằng categoryName để người dùng nhập chữ
    condition: "new", 
    conditionLevel: ["99%"], 
    colorImages: [{ colorName: "", imageUrl: "", isDefault: true }],
    highlights: [""], isFeatured: false, isActive: true,
    specs: [{ key: "", value: "" }],
    variants: [{ sku: "", colorName: "", size: "8GB", storage: "128GB", price: 0, importPrice: 0, quantity: 0 }],
  };

  const [form, setForm] = useState(emptyForm);
  const token = localStorage.getItem("token");
  
  const api = axios.create({
    baseURL: "http://localhost:5000/api/products",
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
  try {
    const res = await api.get("/");
    // Lọc chỉ lấy các sản phẩm là "device"
    const devicesOnly = res.data.filter(p => p.productType === "device");
    setProducts(devicesOnly);
  } catch (err) { 
    console.error("Lỗi tải sản phẩm"); 
  }
};

  const toggleActive = async (product) => {
    try {
      await api.put(`/${product._id}`, {
  isActive: !product.isActive
});
      fetchProducts();
    } catch (err) { alert("Không thể thay đổi trạng thái!"); }
  };

  const addField = (field, template) => {
    setForm({ ...form, [field]: [...form[field], template] });
  };

  const removeField = (field, index) => {
    if (form[field].length <= 1) return;
    const updated = [...form[field]];
    updated.splice(index, 1);
    setForm({ ...form, [field]: updated });
  };

  const openEdit = (p) => {
    setIsEditing(true);
    setCurrentId(p._id);
    const specsArr = Object.entries(p.specs || {}).map(([key, value]) => ({ key, value }));
    setForm({
      ...p,
      categoryName: p.categoryId?.name || p.categoryId || "", // Lấy tên nếu đã populate hoặc giữ nguyên ID
      specs: specsArr.length > 0 ? specsArr : [{ key: "", value: "" }],
      colorImages: p.colorImages?.length > 0 ? p.colorImages : [{ colorName: "", imageUrl: "", isDefault: true }],
      conditionLevel: p.conditionLevel || (p.conditionLevel ? [p.conditionLevel] : ["99%"]),
      variants: p.variants?.map(v => ({
  ...v,
  importPrice: v.importPrice || 0
})) || []
    });
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setForm(emptyForm);
    // eslint-disable-next-line react-hooks/immutability
    document.body.style.overflow = 'unset';
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const loading = toast.loading(
    isEditing ? "Đang cập nhật sản phẩm..." : "Đang đăng sản phẩm..."
  );

  try {
    let finalCategoryId = "";

    // ===== Xử lý Category =====
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
          const list = await axios.get(
            "http://localhost:5000/api/categories"
          );

          const found = list.data.find(
            (c) =>
              c.name.toLowerCase() ===
              form.categoryName.trim().toLowerCase()
          );

          if (found) finalCategoryId = found._id;
        } else {
          throw err;
        }
      }
    }

    // ===== Specs =====
    const specsObj = form.specs.reduce((acc, cur) => {
      if (cur.key.trim()) acc[cur.key.trim()] = cur.value;
      return acc;
    }, {});

    // ===== Variants =====
    const sanitizedVariants = form.variants.map((v, index) => ({
      ...v,
      sku:
        v.sku ||
        `${form.name.substring(0, 3).toUpperCase()}-${v.colorName.replace(
          /\s+/g,
          ""
        )}-${v.size}-${v.storage}-${Date.now()}-${index}`,
    }));

    const { categoryName, ...restForm } = form;

    const dataToSave = {
      ...restForm,
      categoryId: finalCategoryId,
      specs: specsObj,
      variants: sanitizedVariants,
      conditionLevel:
        form.condition === "used"
          ? form.conditionLevel
          : undefined,
    };

    // ===== Save Product =====
    if (isEditing) {
      await api.put(`/${currentId}`, dataToSave);
      toast.success("Cập nhật thành công!", { id: loading });
    } else {
      await api.post("/", dataToSave);
      toast.success("Đăng sản phẩm thành công!", { id: loading });
    }

    closeModal();
    fetchProducts();
  } catch (err) {
    console.error(err);
    toast.error(
      err.response?.data?.message || "Có lỗi xảy ra!",
      { id: loading }
    );
  }
};

  return (
    <div className="manage-product">
      <div className="admin-header">
        <div className="header-left">
          <h2>Kho Sản Phẩm</h2>
          <div className="search-box">
            <Search size={18} color="#64748b" />
            <input placeholder="Tìm theo tên..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <button className="btn-add-main" onClick={() => { setForm(emptyForm); setIsEditing(false); setShowModal(true); document.body.style.overflow = 'hidden'; }}>
          <Plus size={20} /> Thêm sản phẩm mới
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Loại</th>
              <th>Giá sàn</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
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
                          <span key={idx} className="used-tag">{lv}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td><span className="type-badge">{p.productType}</span></td>
                <td>{Math.min(...(p.variants?.map(v => v.price) || [0])).toLocaleString()}đ</td>
                <td>{p.variants?.reduce((sum, v) => sum + v.quantity, 0)}</td>
                <td>
                  <button onClick={() => toggleActive(p)} className={`status-btn ${p.isActive ? "on" : "off"}`}>
                    {p.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </td>
                <td className="actions">
                  <button onClick={() => openEdit(p)} className="edit-btn"><Edit3 size={16} /></button>
                  <button
                    onClick={async () => {
                      if (!window.confirm("Xóa vĩnh viễn?")) return;

                      const deleting = toast.loading("Đang xóa...");

                      try {
                        await api.delete(`/${p._id}`);
                        toast.success("Đã xóa thành công!", { id: deleting });
                        fetchProducts(); // reload lại danh sách
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
                            <div key={idx} className="condition-item-row">
                              <select 
                                value={lv} 
                                onChange={(e) => {
                                  const u = [...form.conditionLevel];
                                  u[idx] = e.target.value;
                                  setForm({ ...form, conditionLevel: u });
                                }}
                              >
                                <option value="99%">99% (Keng)</option>
                                <option value="98%">98% (Phẩy nhẹ)</option>
                                <option value="97%">97% (Trầy xước)</option>
                              </select>
                              <button type="button" className="btn-remove-cond" onClick={() => removeField("conditionLevel", idx)}>
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

                <div className="form-card">
                  <div className="card-header-form"><ImageIcon size={18} /> Hình ảnh theo màu sắc</div>
                  <div className="color-images-grid">
                    {form.colorImages.map((ci, i) => (
                      <div key={i} className="dynamic-row-color">
                        <input className="input-color-name" placeholder="Tên màu" value={ci.colorName} onChange={(e) => { const u = [...form.colorImages]; u[i].colorName = e.target.value; setForm({ ...form, colorImages: u }) }} required />
                        <input className="input-color-url" placeholder="Link URL hình ảnh" value={ci.imageUrl} onChange={(e) => { const u = [...form.colorImages]; u[i].imageUrl = e.target.value; setForm({ ...form, colorImages: u }) }} required />
                        <label className="checkbox-default" title="Chọn làm ảnh đại diện">
                          <input type="checkbox" checked={ci.isDefault} onChange={() => {
                            const u = form.colorImages.map((item, idx) => ({ ...item, isDefault: idx === i }));
                            setForm({ ...form, colorImages: u });
                          }} /> <span>Mặc định</span>
                        </label>
                        <button type="button" className="btn-icon-remove" onClick={() => removeField("colorImages", i)}><Trash2 size={18} /></button>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="btn-add-sub" onClick={() => addField("colorImages", { colorName: "", imageUrl: "", isDefault: false })}>+ Thêm màu sắc mới</button>
                </div>

                <div className="form-card">
                  <div className="card-header-form"><Layers size={18} /> Cấu hình & Giá bán</div>
                  <div className="variants-wrapper">
                    {form.variants.map((v, i) => (
                      <div key={i} className="variant-block">
                        <div className="v-header">
                          <div className="v-title">Phiên bản #{i + 1}</div>
                          <Trash2 size={16} className="text-danger-icon" onClick={() => removeField("variants", i)} />
                        </div>
                        <div className="v-body-inputs">
                          <div className="v-field">
                            <label>Màu sắc</label>
                            <select value={v.colorName} onChange={(e) => { const u = [...form.variants]; u[i].colorName = e.target.value; setForm({ ...form, variants: u }) }} required>
                              <option value="">-- Chọn --</option>
                              {form.colorImages.map(c => <option key={c.colorName} value={c.colorName}>{c.colorName || "Chưa nhập tên màu"}</option>)}
                            </select>
                          </div>
                          <div className="v-field">
                            <label>RAM</label>
                            <select value={v.size} onChange={(e) => { const u = [...form.variants]; u[i].size = e.target.value; setForm({ ...form, variants: u }) }} required>
                              {sizeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>
                          <div className="v-field">
                            <label>Bộ nhớ</label>
                            <select value={v.storage} onChange={(e) => { const u = [...form.variants]; u[i].storage = e.target.value; setForm({ ...form, variants: u }) }} required>
                              {storageOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>
                          <div className="v-field"><label>Giá bán (đ)</label><input type="number" value={v.price} onChange={(e) => { const u = [...form.variants]; u[i].price = Number(e.target.value); setForm({ ...form, variants: u }) }} required /></div>
                          <div className="v-field"><label>Giá nhập (đ)</label><input type="number" value={v.importPrice} onChange={(e) => { const u = [...form.variants]; u[i].importPrice = Number(e.target.value); setForm({ ...form, variants: u }) }} /></div>
                          <div className="v-field"><label>Số lượng</label><input type="number" value={v.quantity} onChange={(e) => { const u = [...form.variants]; u[i].quantity = Number(e.target.value); setForm({ ...form, variants: u }) }} required /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="btn-add-variant-big" onClick={() => addField("variants", { sku: "", colorName: "", size: "8GB", storage: "128GB", price: 0, importPrice: 0, quantity: 0 })}>+ Thêm cấu hình mới</button>
                </div>


                <div className="side-by-side">
                  <div className="form-card">
                    <div className="card-header-form"><Zap size={18} /> Điểm nổi bật</div>
                    {form.highlights.map((h, i) => (
                      <div key={i} className="dynamic-row">
                        <input value={h} onChange={(e) => { const u = [...form.highlights]; u[i] = e.target.value; setForm({ ...form, highlights: u }) }} placeholder="Vd: Chip A17 Pro" />
                        <X size={16} className="remove-icon" onClick={() => removeField("highlights", i)} />
                      </div>
                    ))}
                    <button type="button" className="btn-add-sub" onClick={() => addField("highlights", "")}>+ Thêm dòng nổi bật</button>
                  </div>
                  
                  <div className="form-card">
                    <div className="card-header-form">Thông số kỹ thuật</div>
                    {form.specs.map((s, i) => (
                      <div key={i} className="dynamic-row">
                        <input className="spec-key" placeholder="CPU" value={s.key} onChange={(e) => { const u = [...form.specs]; u[i].key = e.target.value; setForm({ ...form, specs: u }) }} />
                        <input className="spec-val" placeholder="Apple A17" value={s.value} onChange={(e) => { const u = [...form.specs]; u[i].value = e.target.value; setForm({ ...form, specs: u }) }} />
                        <X size={16} className="remove-icon" onClick={() => removeField("specs", i)} />
                      </div>
                    ))}
                    <button type="button" className="btn-add-sub" onClick={() => addField("specs", { key: "", value: "" })}>+ Thêm thông số</button>
                  </div>
                </div>

              </div>

              <div className="modal-footer-sticky">
                <div className="footer-left">
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

export default ManagePhone;