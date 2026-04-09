import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function CompatibleProductSelector({ products, selectedIds, currentProductId, onChange }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");

  const availableProducts = products.filter(p => p._id !== currentProductId);
  
  // Lấy danh sách category duy nhất
  const categories = ["Tất cả", ...new Set(availableProducts.map(p => p.categoryName || p.categoryId?.name).filter(Boolean))];

  const filteredProducts = availableProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const cat = p.categoryName || p.categoryId?.name;
    const matchCat = categoryFilter === "Tất cả" || cat === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleToggle = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(item => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="border border-slate-300 rounded-xl p-4 bg-white shadow-sm">
      
      {/* Bộ lọc và Tìm kiếm */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-[250px] flex items-center bg-slate-50 py-2 px-3 rounded-lg border border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
          <Search size={16} className="text-slate-500 shrink-0" />
          <input 
            placeholder="Tìm sản phẩm (ví dụ: Sạc 20W, iPhone 15)..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="border-none bg-transparent outline-none w-full ml-2 text-[13px] text-slate-700"
          />
        </div>
        <select 
          value={categoryFilter} 
          onChange={e => setCategoryFilter(e.target.value)} 
          className="flex-none min-w-[150px] p-2 px-3 rounded-lg border border-slate-200 bg-slate-50 text-[13px] text-slate-700 outline-none focus:border-blue-400 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center] bg-[length:14px_14px] pr-8"
        >
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {/* Danh sách SP */}
      <div className="max-h-[250px] overflow-y-auto border border-slate-200 rounded-lg bg-slate-50 scrollbar-thin">
        {filteredProducts.length === 0 ? (
          <div className="text-center text-slate-400 text-[13px] p-6">Không tìm thấy sản phẩm phù hợp</div>
        ) : (
          <div className="flex flex-col">
            {filteredProducts.map(p => {
              const isSelected = selectedIds.includes(p._id);
              return (
                <label 
                  key={p._id} 
                  className={`flex items-center gap-3 p-3 px-4 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors ${isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-100/50'}`}
                >
                  <input 
                    type="checkbox" 
                    checked={isSelected} 
                    onChange={() => handleToggle(p._id)} 
                    className="w-4 h-4 cursor-pointer accent-blue-600 rounded"
                  />
                  <div className="flex flex-col">
                    <div className={`text-[13px] font-semibold ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>{p.name}</div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded shadow-sm">{p.categoryName || p.categoryId?.name}</span>
                      {p.brand && <span>{p.brand}</span>}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="mt-3 text-xs text-slate-500 flex justify-between items-center px-1">
        <span>Tìm thấy <b>{filteredProducts.length}</b> kết quả.</span>
        <span>Đã chọn: <strong className="text-blue-600 text-sm">{selectedIds.length}</strong> sản phẩm</span>
      </div>
    </div>
  );
}