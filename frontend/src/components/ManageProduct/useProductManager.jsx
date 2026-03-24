import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

export const useProductManager = (productType, emptyFormTemplate, specsConfig = null) => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState(emptyFormTemplate);
  const [tagsList, setTagsList] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  const token = localStorage.getItem("token");
  const api = axios.create({
    baseURL: "http://localhost:5000/api/products",
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchProducts = async () => {
    try {
      const res = await api.get("?admin=true");
      setAllProducts(res.data);
      setProducts(res.data.filter((p) => p.productType === productType));
      // eslint-disable-next-line no-unused-vars
    } catch (err) { console.error("Lỗi tải dữ liệu sản phẩm"); }
  };

  const fetchTags = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tags");
      setTagsList(res.data.filter(t => t.isActive));
    } catch (err) {
      console.error("Lỗi tải tags", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isEditing && specsConfig && specsConfig[form.categoryName]) {
      const defaultSpecs = specsConfig[form.categoryName].keys.map(key => ({ key, value: "" }));
      setForm(prev => ({ ...prev, specs: defaultSpecs }));
    }
  }, [form.categoryName, isEditing, specsConfig]);

  const addField = (field, template) => setForm({ ...form, [field]: [...form[field], template] });

  const removeField = (field, index) => {
    if (field === "detailImages" && form[field][index]?.imageUrl?.includes("res.cloudinary.com")) {
      setImagesToDelete(prev => [...prev, form[field][index].imageUrl]);
    }
    if (form[field].length <= 1 && !['specs', 'highlights', 'detailImages'].includes(field)) return;
    const updated = [...form[field]];
    updated.splice(index, 1);
    setForm({ ...form, [field]: updated });
  };

  const handleImageFileChange = (index, file) => {
    if (!file) return;
    const oldUrl = form.colorImages[index]?.imageUrl;
    // Dọn dẹp URL cũ nếu có để tránh tràn bộ nhớ
    if (oldUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(oldUrl);
    } else if (oldUrl?.includes('res.cloudinary.com')) {
      setImagesToDelete(prev => [...prev, oldUrl]);
    }
    const previewUrl = URL.createObjectURL(file);
    const updated = [...form.colorImages];
    updated[index].imageFile = file;
    updated[index].imageUrl = previewUrl;
    setForm({ ...form, colorImages: updated });
  };

  const handleDetailImageChange = (index, file) => {
    if (!file) return;
    const oldUrl = form.detailImages[index]?.imageUrl;
    if (oldUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(oldUrl);
    } else if (oldUrl?.includes('res.cloudinary.com')) {
      setImagesToDelete(prev => [...prev, oldUrl]);
    }
    const previewUrl = URL.createObjectURL(file);
    const updated = [...form.detailImages];
    updated[index].imageFile = file;
    updated[index].imageUrl = previewUrl;
    setForm({ ...form, detailImages: updated });
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

    let processedVariants = p.variants?.map(v => ({ ...v, importPrice: v.importPrice || 0 })) || [];

    // ✅ Áp dụng logic gom nhóm "colors" cho TẤT CẢ các loại sản phẩm (device, accessory, electronic)
    if (emptyFormTemplate?.variants?.[0]?.colors !== undefined) {
      const groups = {};
      processedVariants.forEach(v => {
        const key = `${v.size || ''}_${v.storage || ''}_${v.condition || ''}_${v.price || 0}_${v.importPrice || 0}`;
        if (!groups[key]) {
          groups[key] = {
            sku: v.sku || "",
            size: v.size || emptyFormTemplate.variants[0].size,
            storage: v.storage || emptyFormTemplate.variants[0].storage,
            condition: v.condition || emptyFormTemplate.variants[0].condition || "",
            price: v.price || 0,
            importPrice: v.importPrice || 0,
            colors: []
          };
        }
        if (v.colorName || v.quantity !== undefined) {
          groups[key].colors.push({
            colorName: v.colorName || "",
            quantity: v.quantity || 0,
            sku: v.sku
          });
        }
      });
      processedVariants = Object.values(groups);
      if (processedVariants.length === 0) {
        processedVariants = [JSON.parse(JSON.stringify(emptyFormTemplate.variants[0]))];
      }
    }

    const processedDetailImages = (p.detailImages || []).map(url => ({
      imageUrl: url,
      imageFile: null
    }));

    const processedTags = (p.tags || []).map(t => t._id || t);
    const processedCompatibleWith = (p.compatibleWith || []).map(cp => cp._id || cp);

    setForm({
      ...p,
      categoryName: p.categoryId?.name || p.categoryId || p.categoryName || "",
      specs: specsArr.length > 0 ? specsArr : [{ key: "", value: "" }],
      detailedSpecs: p.detailedSpecs || JSON.parse(JSON.stringify(emptyFormTemplate.detailedSpecs || {})),
      variants: processedVariants.length > 0 ? processedVariants : [JSON.parse(JSON.stringify(emptyFormTemplate.variants[0]))],
      conditionLevel: (p.conditionLevel && p.conditionLevel.length > 0) ? p.conditionLevel : ["99%"],
      detailImages: processedDetailImages,
      tags: processedTags,
      compatibleWith: processedCompatibleWith
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
    form.detailImages?.forEach(img => {
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
      // Đổi đường dẫn API thêm "/status" vào cuối
      await api.put(`/${product._id}/status`, { isActive: !product.isActive });

      toast.success(
        !product.isActive ? "Đã hiện sản phẩm!" : "Đã ẩn sản phẩm!"
      );

      fetchProducts();
    } catch (err) {
      toast.error("Lỗi đổi trạng thái");
      console.error(err);
    }
  };

  const handleSelectAll = (e, currentProductList) => {
    if (e.target.checked) {
      const ids = currentProductList.map(p => p._id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...ids])));
    } else {
      const idsToRemove = currentProductList.map(p => p._id);
      setSelectedIds(prev => prev.filter(id => !idsToRemove.includes(id)));
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Đang xử lý ảnh và lưu dữ liệu...");

    try {
      // 1. Upload ảnh màu lên Cloudinary
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

      // 1.5 Upload detailImages
      const updatedDetailImages = [];
      if (form.detailImages) {
        for (let i = 0; i < form.detailImages.length; i++) {
          if (form.detailImages[i].imageFile) {
            const formData = new FormData();
            formData.append("image", form.detailImages[i].imageFile);
            const uploadRes = await axios.post("http://localhost:5000/api/upload", formData);
            updatedDetailImages.push(uploadRes.data.imageUrl);
          } else if (form.detailImages[i].imageUrl && !form.detailImages[i].imageUrl.startsWith('blob:')) {
            // Giữ lại URL cũ nếu không có file mới
            updatedDetailImages.push(form.detailImages[i].imageUrl);
          }
        }
      }

      // 2. Xử lý Category
      let finalCategoryId = "";
      // Lấy categoryName, nếu undefined thì mặc định là "Điện thoại" để không bị lỗi trim
      const safeCategoryName = form.categoryName || "Điện thoại";

      try {
        const catRes = await axios.post("http://localhost:5000/api/categories",
          { name: safeCategoryName.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        finalCategoryId = catRes.data._id;
      } catch (err) {
        // Nếu đã tồn tại, lấy ID từ danh sách
        const list = await axios.get("http://localhost:5000/api/categories");
        const found = list.data.find(c => c.name.toLowerCase() === safeCategoryName.trim().toLowerCase());
        if (found) finalCategoryId = found._id;
        else throw new Error("Không thể xác định danh mục");
      }

      // 3. Chuẩn hóa dữ liệu để tránh lỗi 400 Validation
      const specsObj = form.specs.reduce((acc, cur) => {
        if (cur.key?.trim()) acc[cur.key.trim()] = cur.value;
        return acc;
      }, {});

      const variantsToSave = [];
      form.variants.forEach((v, idx) => {
        if (v.colors && Array.isArray(v.colors)) {
          v.colors.forEach((c, cIdx) => {
            const newVar = {
              ...v,
              colorName: c.colorName,
              quantity: Number(c.quantity) || 0,
              price: Number(v.price) || 0,
              importPrice: Number(v.importPrice) || 0,
              storage: v.storage || "N/A",
              condition: v.condition || "",
              sku: c.sku || v.sku || `${productType.substring(0, 3).toUpperCase()}-${Date.now()}-${idx}-${cIdx}`
            };
            delete newVar.colors;
            variantsToSave.push(newVar);
          });
        } else {
          variantsToSave.push({
            ...v,
            price: Number(v.price) || 0,
            importPrice: Number(v.importPrice) || 0,
            quantity: Number(v.quantity) || 0,
            storage: v.storage || "N/A",
            sku: v.sku || `${productType.substring(0, 3).toUpperCase()}-${Date.now()}-${idx}`
          });
        }
      });
      const validColorImages = updatedColorImages.filter(ci => ci.colorName && ci.colorName.trim() !== "");

      // Nếu người dùng lỡ tay xóa hết màu, tự động gán lại màu Mặc định để tránh lỗi DB
      if (validColorImages.length === 0) {
        validColorImages.push({ colorName: "Mặc định", imageUrl: "", isDefault: true });
      }
      const dataToSave = {
        ...form,
        categoryId: finalCategoryId,
        colorImages: updatedColorImages,
        detailImages: updatedDetailImages,
        specs: specsObj,
        detailedSpecs: form.detailedSpecs,
        highlights: form.highlights.filter(h => h.trim() !== ""), // Bỏ dòng trống
        variants: variantsToSave,
        conditionLevel: form.condition === "new" ? [] : form.conditionLevel,
        tags: form.tags || [],
        compatibleWith: form.compatibleWith || [],
        imagesToDelete
      };

      console.log("frontend detailImages submitting:", updatedDetailImages);
      console.log("dataToSave:", dataToSave);

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
    products, allProducts, form, setForm, showModal, isEditing, searchTerm, setSearchTerm, tagsList,
    selectedIds, setSelectedIds, handleSelectAll, handleSelectOne, clearSelection, refreshData: fetchProducts,
    addField, removeField, handleImageFileChange, handleDetailImageChange, openModalForAdd, openModalForEdit, closeModal,
    handleDelete, toggleActive, handleSubmit
  };
};