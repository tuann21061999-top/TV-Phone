import React, { useState, useEffect } from "react";
import axios from "axios";
import { Sparkles, X, Search, ChevronRight, Wand2 } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";

const SmartFinderWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [specs, setSpecs] = useState([]);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null); // null: form, []: no match, [...]: results
  const navigate = useNavigate();
  const location = useLocation();

  // Ẩn nút trên trang admin
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    if (isOpen && specs.length === 0) {
      fetchSpecs();
    }
  }, [isOpen]);

  const fetchSpecs = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/compare-specs/active`);
      setSpecs(res.data || []);
    } catch (e) {
      console.error("Lỗi tải thông số thông minh:", e);
    }
  };

  const handleSelectTier = (groupId, tierId) => {
    setRatings(prev => ({
      ...prev,
      [groupId]: tierId
    }));
  };

  const handleSearch = async () => {
    const selectedCount = Object.values(ratings).filter(Boolean).length;
    if (selectedCount === 0) {
      alert("Vui lòng chọn ít nhất 1 tùy chọn để tìm kiếm!");
      return;
    }

    setLoading(true);
    try {
      // Clean up empty ratings
      const payload = {};
      for (const [k, v] of Object.entries(ratings)) {
        if (v) payload[k] = v;
      }

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/products/smart-search`, {
        ratings: payload
      });
      setResults(res.data || []);
    } catch (e) {
      console.error("Lỗi tìm kiếm:", e);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setResults(null);
    setRatings({});
  };

  const getMinPrice = (product) => {
    if (!product?.variants?.length) return 0;
    return Math.min(...product.variants.map(v => v.price));
  };

  return (
    <>
      {/* Nút nổi đũa thần */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[130px] right-6 w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white border-none cursor-pointer flex items-center justify-center shadow-[0_4px_16px_rgba(245,158,11,0.4)] z-[9998] transition-all duration-300 hover:scale-[1.08] hover:shadow-[0_6px_20px_rgba(245,158,11,0.5)] group"
        title="Tìm kiếm thông minh"
      >
        <Wand2 size={26} strokeWidth={2.5} className="group-hover:animate-pulse" />
        <span className="absolute -top-2 -left-4 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm animate-bounce whitespace-nowrap">
          Tìm kiếm thông minh
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[600px] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 m-0">Tìm kiếm thông minh</h3>
                  <p className="text-[12px] text-slate-500 m-0 mt-0.5">Tìm máy siêu chuẩn theo nhu cầu của bạn</p>
                </div>
              </div>
              <button 
                className="bg-white border-none w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer shadow-sm transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 md:p-6 bg-slate-50">
              {results === null ? (
                // FORM CHỌN TIÊU CHÍ
                <div className="space-y-6">
                  {specs.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 animate-pulse">Đang tải cấu hình...</div>
                  ) : (
                    specs.map(spec => (
                      <div key={spec._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-700 m-0 mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          {spec.name}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => handleSelectTier(spec._id, '')}
                            className={`p-2 text-[12px] md:text-[13px] font-semibold rounded-lg border transition-all cursor-pointer ${
                              !ratings[spec._id] 
                                ? "bg-blue-50 border-blue-200 text-blue-700 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2)]" 
                                : "bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600"
                            }`}
                          >
                            Bỏ qua
                          </button>
                          {spec.tiers.sort((a,b) => a.rank - b.rank).map(tier => {
                            const isSelected = ratings[spec._id] === tier._id;
                            // Màu theo rank (1,2: emerald, 3,4: amber, else: slate)
                            let colorClass = "border-slate-200 text-slate-600 hover:border-blue-300";
                            let activeClass = "bg-blue-500 border-blue-500 text-white shadow-md";
                            
                            if (tier.rank <= 2) {
                              activeClass = "bg-emerald-500 border-emerald-500 text-white shadow-md";
                            } else if (tier.rank <= 4) {
                              activeClass = "bg-amber-500 border-amber-500 text-white shadow-md";
                            }

                            return (
                              <button
                                key={tier._id}
                                type="button"
                                onClick={() => handleSelectTier(spec._id, tier._id)}
                                className={`p-2 text-[12px] md:text-[13px] font-semibold rounded-lg border transition-all cursor-pointer ${
                                  isSelected ? activeClass : colorClass
                                }`}
                              >
                                {tier.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                // KẾT QUẢ TÌM KIẾM
                <div>
                  {loading ? (
                    <div className="text-center py-20 text-slate-500 animate-pulse">
                      <Sparkles size={40} className="mx-auto mb-4 text-amber-400" />
                      Đang tìm kiếm sản phẩm hoàn hảo nhất...
                    </div>
                  ) : results.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                      <Search size={40} className="mx-auto mb-4 text-slate-300" />
                      <p className="text-slate-600 font-medium text-[15px]">Rất tiếc, không tìm thấy sản phẩm nào phù hợp.</p>
                      <button onClick={resetSearch} className="mt-4 px-6 py-2.5 bg-blue-50 text-blue-600 rounded-lg font-bold border-none cursor-pointer hover:bg-blue-100 transition-colors">
                        Thử lại với tuỳ chọn khác
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* TOP 1 - BEST MATCH */}
                      <div className="relative bg-gradient-to-b from-amber-50 to-white p-1 rounded-2xl border-2 border-amber-300 shadow-[0_8px_24px_rgba(245,158,11,0.15)]">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-md">
                          Lựa Chọn Phù Hợp Nhất
                        </div>
                        <div className="bg-white rounded-xl p-4 mt-2 flex flex-col md:flex-row items-center gap-5">
                          <img 
                            src={results[0].colorImages?.[0]?.imageUrl || results[0].images?.[0]} 
                            alt={results[0].name} 
                            className="w-32 h-32 object-contain drop-shadow-md"
                          />
                          <div className="flex-1 text-center md:text-left">
                            <h4 className="text-lg font-extrabold text-slate-800 mb-1">{results[0].name}</h4>
                            <p className="text-amber-600 font-black text-xl mb-3">
                              {getMinPrice(results[0]).toLocaleString()}đ
                            </p>
                            <Link 
                              to={`/product/${results[0].slug}`} 
                              onClick={() => setIsOpen(false)}
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2.5 rounded-xl font-bold transition-transform hover:-translate-y-0.5 shadow-lg shadow-amber-500/30 no-underline"
                            >
                              Xem chi tiết <ChevronRight size={18} />
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* RELATED MATCHES */}
                      {results.length > 1 && (
                        <div>
                          <h4 className="text-sm font-bold text-slate-600 mb-3 pl-1 flex items-center gap-2">
                            Các lựa chọn tốt khác
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {results.slice(1).map(prod => (
                              <Link 
                                key={prod._id} 
                                to={`/product/${prod.slug}`}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all no-underline group"
                              >
                                <img 
                                  src={prod.colorImages?.[0]?.imageUrl || prod.images?.[0]} 
                                  alt={prod.name} 
                                  className="w-16 h-16 object-contain group-hover:scale-105 transition-transform"
                                />
                                <div>
                                  <h5 className="text-[13px] font-bold text-slate-800 line-clamp-2 m-0 mb-1 leading-tight group-hover:text-blue-600 transition-colors">
                                    {prod.name}
                                  </h5>
                                  <span className="text-[13px] font-extrabold text-red-500">
                                    {getMinPrice(prod).toLocaleString()}đ
                                  </span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-center pt-2">
                        <button onClick={resetSearch} className="px-5 py-2 bg-slate-200 text-slate-600 rounded-lg font-bold border-none cursor-pointer hover:bg-slate-300 transition-colors text-sm">
                          Tìm lại
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Form Action */}
            {results === null && (
              <div className="p-4 md:p-5 border-t border-slate-100 bg-white flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={resetSearch} 
                  className="px-5 py-2.5 rounded-xl font-bold cursor-pointer border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                >
                  Xóa chọn
                </button>
                <button 
                  type="button" 
                  onClick={handleSearch} 
                  disabled={loading}
                  className="px-8 py-2.5 rounded-xl font-bold cursor-pointer border-none bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-[0_4px_12px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                >
                  {loading ? <span className="animate-spin text-lg leading-none">↻</span> : <Search size={18} />}
                  TÌM NGAY
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SmartFinderWidget;
