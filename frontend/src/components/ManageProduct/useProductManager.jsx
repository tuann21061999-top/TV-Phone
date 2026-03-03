import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

export const useProductManager = (productType, emptyFormTemplate, specsConfig = null) => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState(emptyFormTemplate);

  const token = localStorage.getItem("token");
  const api = axios.create({
    baseURL: "http://localhost:5000/api/products",
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchProducts = async () => {
    try {
      const res = await api.get("/");
      setProducts(res.data.filter((p) => p.productType === productType));
    // eslint-disable-next-line no-unused-vars
    } catch (err) { console.error("Lỗi tải dữ liệu"); }
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    if (!isEditing && specsConfig && specsConfig[form.categoryName]) {
      const defaultSpecs = specsConfig[form.categoryName].keys.map(key => ({ key, value: "" }));
      setForm(prev => ({ ...prev, specs: defaultSpecs }));
    }
  }, [form.categoryName, isEditing, specsConfig]);

  const addField = (field, template) => setForm({ ...form, [field]: [...form[field], template] });
  
  const removeField = (field, index) => {
    if (form[field].length <= 1 && !['specs', 'highlights'].includes(field)) return;
    const updated = [...form[field]];
    updated.splice(index, 1);
    setForm({ ...form, [field]: updated });
  };

  const handleImageFileChange = (index, file) => {
    if (!file) return;
    // Dọn dẹp URL cũ nếu có để tránh tràn bộ nhớ
    if (form.colorImages[index].imageUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(form.colorImages[index].imageUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    const updated = [...form.colorImages];
    updated[index].imageFile = file;
    updated[index].imageUrl = previewUrl;
    setForm({ ...form, colorImages: updated });
  };

  const openModalForAdd = () => {
    setForm(emptyFormTemplate);
    setIsEditing(false);
    setShowModal(true);
    document.body.style.overflow = "hidden";
  };

  const openModalForEdit = (p) => {
    setIsEditing(true);
    setCurrentId(p._id);
    const specsArr = p.specs && typeof p.specs === "object" ? Object.entries(p.specs).map(([k, v]) => ({ key: k, value: v })) : [];
    setForm({
      ...p,
      categoryName: p.categoryId?.name || p.categoryId || p.categoryName || "",
      specs: specsArr.length > 0 ? specsArr : [{ key: "", value: "" }],
      variants: p.variants?.map(v => ({ ...v, importPrice: v.importPrice || 0 })) || [],
      conditionLevel: p.conditionLevel || ["99%"]
    });
    setShowModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setShowModal(false);
    // Dọn dẹp các URL preview blob
    form.colorImages.forEach(img => {
      if (img.imageUrl?.startsWith('blob:')) URL.revokeObjectURL(img.imageUrl);
    });
    document.body.style.overflow = "unset";
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa vĩnh viễn sản phẩm này?")) return;
    try {
      await api.delete(`/${id}`);
      toast.success("Đã xóa!");
      fetchProducts();
    // eslint-disable-next-line no-unused-vars
    } catch (err) { toast.error("Xóa thất bại!"); }
  };

  const toggleActive = async (product) => {
    try {
      await api.put(`/${product._id}`, { isActive: !product.isActive });
      fetchProducts();
    // eslint-disable-next-line no-unused-vars
    } catch (err) { toast.error("Lỗi đổi trạng thái"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Đang xử lý ảnh và lưu dữ liệu...");

    try {
      // 1. Upload ảnh lên Cloudinary
      const updatedColorImages = [...form.colorImages];
      for (let i = 0; i < updatedColorImages.length; i++) {
        if (updatedColorImages[i].imageFile) {
          const formData = new FormData();
          formData.append("image", updatedColorImages[i].imageFile);
          const uploadRes = await axios.post("http://localhost:5000/api/upload", formData);
          updatedColorImages[i].imageUrl = uploadRes.data.imageUrl;
          delete updatedColorImages[i].imageFile;
        }
      }

      // 2. Xử lý Category
      let finalCategoryId = "";
      try {
        const catRes = await axios.post("http://localhost:5000/api/categories", 
          { name: form.categoryName.trim() }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        finalCategoryId = catRes.data._id;
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        // Nếu đã tồn tại, lấy ID từ danh sách
        const list = await axios.get("http://localhost:5000/api/categories");
        const found = list.data.find(c => c.name.toLowerCase() === form.categoryName.trim().toLowerCase());
        if (found) finalCategoryId = found._id;
        else throw new Error("Không thể xác định danh mục");
      }

      // 3. Chuẩn hóa dữ liệu để tránh lỗi 400 Validation
      const specsObj = form.specs.reduce((acc, cur) => { 
        if (cur.key?.trim()) acc[cur.key.trim()] = cur.value; 
        return acc; 
      }, {});

      const dataToSave = {
        ...form,
        categoryId: finalCategoryId,
        colorImages: updatedColorImages,
        specs: specsObj,
        highlights: form.highlights.filter(h => h.trim() !== ""), // Bỏ dòng trống
        variants: form.variants.map((v, idx) => ({
          ...v,
          price: Number(v.price) || 0,
          importPrice: Number(v.importPrice) || 0,
          quantity: Number(v.quantity) || 0,
          storage: v.storage || "N/A", // QUAN TRỌNG: Sửa lỗi thiếu storage cho Phụ kiện
          sku: v.sku || `${productType.substring(0,3).toUpperCase()}-${Date.now()}-${idx}`
        }))
      };

      // Gửi API
      if (isEditing) await api.put(`/${currentId}`, dataToSave);
      else await api.post("/", dataToSave);

      toast.success("Lưu sản phẩm thành công!", { id: loadingToast });
      closeModal();
      fetchProducts();
    } catch (err) { 
      const errorMsg = err.response?.data?.message || err.message || "Lỗi hệ thống!";
      toast.error(errorMsg, { id: loadingToast }); 
    }
  };

  return {
    products, form, setForm, showModal, isEditing, searchTerm, setSearchTerm,
    addField, removeField, handleImageFileChange, openModalForAdd, openModalForEdit, closeModal,
    handleDelete, toggleActive, handleSubmit
  };
};