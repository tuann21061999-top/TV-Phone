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
    <div className="compatible-selector" style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '15px', background: '#fff' }}>
      
      {/* Bộ lọc và Tìm kiếm */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: '1 1 250px', display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', minWidth: '250px' }}>
          <Search size={16} color="#64748b" style={{ minWidth: '16px' }} />
          <input 
            placeholder="Tìm sản phẩm (ví dụ: Sạc 20W, iPhone 15)..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', marginLeft: '8px', fontSize: '13px' }}
          />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '13px', color: '#475569', minWidth: '150px', flex: '0 0 auto' }}>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {/* Danh sách SP */}
      <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fafafa' }}>
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '20px' }}>Không tìm thấy sản phẩm phù hợp</div>
        ) : (
          filteredProducts.map(p => {
            const isSelected = selectedIds.includes(p._id);
            return (
              <label key={p._id} style={{ 
                display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 15px', cursor: 'pointer', 
                borderBottom: '1px solid #f1f5f9',
                background: isSelected ? '#eff6ff' : 'transparent',
                transition: 'background 0.2s'
              }}>
                <input type="checkbox" checked={isSelected} onChange={() => handleToggle(p._id)} style={{ width: '16px', height: '16px', cursor: 'pointer' }}/>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: isSelected ? '#1e40af' : '#1e293b' }}>{p.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    <span style={{background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', marginRight: '5px'}}>{p.categoryName || p.categoryId?.name}</span>
                    {p.brand ? `${p.brand}` : ''}
                  </div>
                </div>
              </label>
            );
          })
        )}
      </div>
      
      <div style={{ marginTop: '12px', fontSize: '13px', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Tìm thấy <b>{filteredProducts.length}</b> kết quả.</span>
        <span>Đã chọn: <strong style={{color: '#2563eb', fontSize: '14px'}}>{selectedIds.length}</strong> sản phẩm</span>
      </div>
    </div>
  );
}
