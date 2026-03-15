import React from 'react';

export default function TagSelector({ tagsList, selectedTags, onChange }) {
  // Nhóm các tag lại theo type
  const groupedTags = tagsList.reduce((acc, tag) => {
    const type = tag.type || 'Khác';
    if (!acc[type]) acc[type] = [];
    acc[type].push(tag);
    return acc;
  }, {});

  const typeLabels = {
    'Usage': 'Nhu cầu sử dụng',
    'Feature': 'Tính năng nổi bật',
    'Price Segment': 'Phân khúc giá',
    'Khác': 'Khác'
  };

  return (
    <div className="tags-grouped-container" style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '15px', background: '#fff' }}>
      {Object.entries(groupedTags).map(([type, tags]) => (
        <div key={type} className="tag-group" style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px dashed #e2e8f0' }}>
          <strong style={{ display: 'block', marginBottom: '8px', color: '#334155', fontSize: '14px' }}>
            {typeLabels[type] || type}
          </strong>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {tags.map(tag => (
              <label key={tag._id} style={{ 
                display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', 
                background: selectedTags.includes(tag._id) ? '#dbeafe' : '#f1f5f9', 
                color: selectedTags.includes(tag._id) ? '#1e40af' : '#475569',
                border: `1px solid ${selectedTags.includes(tag._id) ? '#bfdbfe' : 'transparent'}`,
                padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s' 
              }}>
                <input 
                  type="checkbox" 
                  hidden
                  checked={selectedTags.includes(tag._id)}
                  onChange={(e) => {
                    const newTags = e.target.checked 
                      ? [...selectedTags, tag._id]
                      : selectedTags.filter(id => id !== tag._id);
                    onChange(newTags);
                  }}
                />
                <div style={{ 
                  width: '14px', height: '14px', borderRadius: '4px', 
                  border: `2px solid ${selectedTags.includes(tag._id) ? '#3b82f6' : '#cbd5e1'}`,
                  background: selectedTags.includes(tag._id) ? '#3b82f6' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {selectedTags.includes(tag._id) && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </div>
                {tag.name}
              </label>
            ))}
          </div>
        </div>
      ))}
      {tagsList.length === 0 && <span style={{fontSize: '13px', color: '#64748b'}}>Chưa có tag nào trong hệ thống.</span>}
    </div>
  );
}
