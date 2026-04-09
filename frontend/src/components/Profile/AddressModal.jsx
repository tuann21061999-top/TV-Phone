import React, { useEffect, useState } from "react";
import axios from "axios";

const AddressModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    detail: "",
    isDefault: false
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Cần lưu state cho các code để bind vào thẻ <select value={...}>
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedDistrictCode, setSelectedDistrictCode] = useState("");
  const [selectedWardCode, setSelectedWardCode] = useState("");

  // 1. Tải danh sách tỉnh ban đầu
  useEffect(() => {
    axios.get("https://provinces.open-api.vn/api/p/")
      .then(res => setProvinces(res.data));
  }, []);

  // 2. Điền dữ liệu khi mở Modal (Sửa hoặc Thêm mới)
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Nạp data vào form (Họ tên, SĐT, Chi tiết)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm(initialData);

        // Map ngược Tên -> Code để hiển thị đúng Tỉnh/Quận/Phường trên thẻ select
        if (provinces.length > 0) {
          const p = provinces.find(x => x.name === initialData.province);
          if (p) {
            setSelectedProvinceCode(p.code);
            // Lấy danh sách quận/huyện dựa trên mã tỉnh tìm được
            axios.get(`https://provinces.open-api.vn/api/p/${p.code}?depth=2`).then(res => {
              setDistricts(res.data.districts);
              const d = res.data.districts.find(x => x.name === initialData.district);
              
              if (d) {
                setSelectedDistrictCode(d.code);
                // Lấy danh sách phường/xã dựa trên mã quận tìm được
                axios.get(`https://provinces.open-api.vn/api/d/${d.code}?depth=2`).then(res2 => {
                  setWards(res2.data.wards);
                  const w = res2.data.wards.find(x => x.name === initialData.ward);
                  if (w) setSelectedWardCode(w.code);
                });
              }
            });
          }
        }
      } else {
        // Nếu không có initialData (Thêm mới) -> Reset toàn bộ form
        setForm({ fullName: "", phone: "", province: "", district: "", ward: "", detail: "", isDefault: false });
        setSelectedProvinceCode("");
        setSelectedDistrictCode("");
        setSelectedWardCode("");
        setDistricts([]);
        setWards([]);
      }
    }
  }, [isOpen, initialData, provinces]);

  // Chọn tỉnh
  const handleProvinceChange = async (code) => {
    setSelectedProvinceCode(code);
    setSelectedDistrictCode(""); // Reset quận/huyện
    setSelectedWardCode("");     // Reset phường/xã
    
    if (!code) {
      setDistricts([]);
      setWards([]);
      setForm({ ...form, province: "", district: "", ward: "" });
      return;
    }

    const province = provinces.find(p => p.code === parseInt(code));
    setForm({ ...form, province: province ? province.name : "", district: "", ward: "" });

    const res = await axios.get(`https://provinces.open-api.vn/api/p/${code}?depth=2`);
    setDistricts(res.data.districts);
    setWards([]);
  };

  // Chọn quận
  const handleDistrictChange = async (code) => {
    setSelectedDistrictCode(code);
    setSelectedWardCode(""); // Reset phường/xã
    
    if (!code) {
      setWards([]);
      setForm({ ...form, district: "", ward: "" });
      return;
    }

    const district = districts.find(d => d.code === parseInt(code));
    setForm({ ...form, district: district ? district.name : "", ward: "" });

    const res = await axios.get(`https://provinces.open-api.vn/api/d/${code}?depth=2`);
    setWards(res.data.wards);
  };

  // Chọn phường
  const handleWardChange = (code) => {
    setSelectedWardCode(code);
    const ward = wards.find(w => w.code === parseInt(code));
    setForm({ ...form, ward: ward ? ward.name : "" });
  };

  const handleSubmit = () => {
    if (!form.fullName || !form.phone || !form.province || !form.district || !form.ward || !form.detail) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    onSave(form);
  };
  useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return () => {
    document.body.style.overflow = "auto";
  };
}, [isOpen]);

  if (!isOpen) return null;

  return (
  <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center">
    <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6">

      <h3 className="text-lg font-bold text-slate-800 mb-4">
        {initialData ? "Cập nhật địa chỉ" : "Thêm địa chỉ"}
      </h3>

      <div className="flex flex-col gap-3">

        <input
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Họ và tên"
          value={form.fullName || ""}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />

        <input
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Số điện thoại"
          value={form.phone || ""}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <select
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
          value={selectedProvinceCode}
          onChange={(e) => handleProvinceChange(e.target.value)}
        >
          <option value="">Chọn tỉnh/thành phố</option>
          {provinces.map(p => (
            <option key={p.code} value={p.code}>{p.name}</option>
          ))}
        </select>

        <select
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
          value={selectedDistrictCode}
          onChange={(e) => handleDistrictChange(e.target.value)}
          disabled={!selectedProvinceCode}
        >
          <option value="">Chọn quận/huyện</option>
          {districts.map(d => (
            <option key={d.code} value={d.code}>{d.name}</option>
          ))}
        </select>

        <select
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
          value={selectedWardCode}
          onChange={(e) => handleWardChange(e.target.value)}
          disabled={!selectedDistrictCode}
        >
          <option value="">Chọn phường/xã</option>
          {wards.map(w => (
            <option key={w.code} value={w.code}>{w.name}</option>
          ))}
        </select>

        <textarea
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Số nhà, tên đường"
          value={form.detail || ""}
          onChange={(e) => setForm({ ...form, detail: e.target.value })}
        />

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={form.isDefault || false}
            onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
          />
          Đặt làm mặc định
        </label>

      </div>

      <div className="flex justify-end gap-3 mt-5">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-100"
        >
          Hủy
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Lưu thay đổi
        </button>
      </div>

    </div>
  </div>
);
};

export default AddressModal;