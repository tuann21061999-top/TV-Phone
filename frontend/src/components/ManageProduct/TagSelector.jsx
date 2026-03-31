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
    <div className="border border-slate-300 rounded-xl p-4 bg-white shadow-sm">
      {Object.entries(groupedTags).map(([type, tags]) => (
        <div key={type} className="mb-4 pb-3 border-b border-dashed border-slate-200 last:mb-0 last:pb-0 last:border-b-0">
          <strong className="block mb-2 text-slate-700 text-[13px]">
            {typeLabels[type] || type}
          </strong>
          <div className="flex flex-wrap gap-2.5">
            {tags.map(tag => {
              const isSelected = selectedTags.includes(tag._id);
              return (
                <label 
                  key={tag._id} 
                  className={`flex items-center gap-1.5 text-xs font-medium py-1.5 px-3 rounded-full cursor-pointer transition-all border ${
                    isSelected 
                      ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' 
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    hidden
                    checked={isSelected}
                    onChange={(e) => {
                      const newTags = e.target.checked 
                        ? [...selectedTags, tag._id]
                        : selectedTags.filter(id => id !== tag._id);
                      onChange(newTags);
                    }}
                  />
                  <div className={`w-3.5 h-3.5 rounded-[4px] border-[1.5px] flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'
                  }`}>
                    {isSelected && (
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                  {tag.name}
                </label>
              );
            })}
          </div>
        </div>
      ))}
      {tagsList.length === 0 && <span className="text-[13px] text-slate-500 italic block mt-2">Chưa có tag nào phù hợp trong hệ thống.</span>}
    </div>
  );
}