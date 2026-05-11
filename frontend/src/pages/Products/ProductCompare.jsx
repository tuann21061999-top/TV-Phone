import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, X, ArrowUp, ArrowDown } from 'lucide-react';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';

function ProductCompare() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const p1Slug = searchParams.get('p1');
  const p2Slug = searchParams.get('p2');

  const [product1, setProduct1] = useState(null);
  const [product2, setProduct2] = useState(null);
  const [loading, setLoading] = useState(true);
  const [compareSpecs, setCompareSpecs] = useState([]);

  const [searchCompare, setSearchCompare] = useState('');
  const [compareResults, setCompareResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeSearchSlot, setActiveSearchSlot] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [res1, res2, specsRes] = await Promise.all([
          p1Slug ? axios.get(`${import.meta.env.VITE_API_URL}/api/products/${p1Slug}`) : Promise.resolve({ data: null }),
          p2Slug ? axios.get(`${import.meta.env.VITE_API_URL}/api/products/${p2Slug}`) : Promise.resolve({ data: null }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/compare-specs/active`),
        ]);
        setProduct1(res1.data?.data || res1.data);
        setProduct2(res2.data?.data || res2.data);
        setCompareSpecs(specsRes.data || []);
      } catch (error) {
        console.error("Lỗi lấy thông tin sản phẩm so sánh:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [p1Slug, p2Slug]);

  useEffect(() => {
    let timer;
    if (searchCompare.length > 1 && activeSearchSlot) {
      setIsSearching(true);
      timer = setTimeout(async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products?search=${searchCompare}&type=device`);
          const otherSlug = activeSearchSlot === 'p1' ? p2Slug : p1Slug;
          setCompareResults((res.data || []).filter(p => p.slug !== otherSlug).slice(0, 10));
        } catch (e) { console.error(e); }
        finally { setIsSearching(false); }
      }, 300);
    } else { setCompareResults([]); }
    return () => clearTimeout(timer);
  }, [searchCompare, activeSearchSlot, p1Slug, p2Slug]);

  const handleSelectProduct = (newSlug) => {
    if (activeSearchSlot === 'p1') navigate(`/compare?p1=${newSlug}${p2Slug ? `&p2=${p2Slug}` : ''}`);
    else navigate(`/compare?${p1Slug ? `p1=${p1Slug}&` : ''}p2=${newSlug}`);
    setSearchCompare(''); setActiveSearchSlot(null); setCompareResults([]);
  };

  const getMainImage = (p) => {
    if (!p) return "";
    return p.colorImages?.find(c => c.isDefault)?.imageUrl || p.colorImages?.[0]?.imageUrl || "";
  };

  const getMinPrice = (p) => {
    if (!p?.variants?.length) return 0;
    return Math.min(...p.variants.map(v => v.price));
  };

  // Lấy rank của sản phẩm cho một nhóm so sánh
  const getProductRank = (product, groupId, group) => {
    if (!product?.compareRatings) return null;
    const rating = product.compareRatings.find(r => {
      const rGroupId = r.groupId?._id || r.groupId;
      return rGroupId === groupId;
    });
    if (!rating) return null;
    const tierId = rating.tierId?._id || rating.tierId;
    const tier = group.tiers.find(t => t._id === tierId);
    return tier ? { rank: tier.rank, name: tier.name } : null;
  };

  // Tính trạng thái mũi tên dựa trên rank (rank thấp = tốt hơn)
  const getArrowStatus = (p1Rank, p2Rank) => {
    if (!p1Rank || !p2Rank) return { p1: 'neutral', p2: 'neutral' };
    if (p1Rank.rank === p2Rank.rank) return { p1: 'neutral', p2: 'neutral' };
    if (p1Rank.rank < p2Rank.rank) return { p1: 'better', p2: 'worse' };
    return { p1: 'worse', p2: 'better' };
  };

  // Danh sách nhóm thông số (dùng CompareSpec làm template hiển thị, detailedSpecs làm data)
  const combinedSpecs = useMemo(() => {
    if (!compareSpecs.length || (!product1 && !product2)) return [];

    // 5 nhóm cố định theo tên CompareSpec
    return compareSpecs.map(group => {
      const groupName = group.name;
      const p1Group = product1?.detailedSpecs?.[groupName] || [];
      const p2Group = product2?.detailedSpecs?.[groupName] || [];

      // Merge specs from both products
      const specsMap = new Map();
      p1Group.forEach(s => { if (s.key && s.value) specsMap.set(s.key, { p1Value: s.value, p2Value: '-' }); });
      p2Group.forEach(s => {
        if (!s.key || !s.value) return;
        if (specsMap.has(s.key)) specsMap.get(s.key).p2Value = s.value;
        else specsMap.set(s.key, { p1Value: '-', p2Value: s.value });
      });

      const items = [];
      specsMap.forEach((vals, key) => items.push({ key, ...vals }));

      // Tính arrow status dựa trên tier rank
      const p1Rank = getProductRank(product1, group._id, group);
      const p2Rank = getProductRank(product2, group._id, group);
      const arrowStatus = getArrowStatus(p1Rank, p2Rank);

      return { groupName, items, arrowStatus, p1Rank, p2Rank };
    }).filter(g => g.items.length > 0);
  }, [product1, product2, compareSpecs]);

  const handleRemoveProduct = (isP1) => {
    if (isP1) navigate(p2Slug ? `/compare?p1=${p2Slug}` : `/compare`);
    else navigate(`/compare?p1=${p1Slug}`);
  };

  const ArrowIndicator = ({ status }) => {
    if (status === 'better') return (
      <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-emerald-50 border border-emerald-200 shadow-sm">
        <ArrowUp size={16} className="text-emerald-500" strokeWidth={3} />
      </div>
    );
    if (status === 'worse') return (
      <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-red-50 border border-red-200 shadow-sm">
        <ArrowDown size={16} className="text-red-500" strokeWidth={3} />
      </div>
    );
    return null;
  };

  const ProductCard = ({ product, isP1 }) => (
    <div className="bg-white rounded-lg md:rounded-xl p-2.5 sm:p-4 md:p-5 text-center relative w-full max-w-[160px] sm:max-w-[200px] md:max-w-[250px] shadow-sm border border-slate-100 flex flex-col items-center transition-all hover:shadow-md">
      <button className="absolute top-1 right-1 md:top-2 md:right-2 bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 border-none rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center cursor-pointer transition-colors" onClick={() => handleRemoveProduct(isP1)}>
        <X size={14} className="md:w-4 md:h-4" />
      </button>
      <img src={getMainImage(product)} alt={product.name} className="w-16 h-16 sm:w-20 sm:h-20 md:w-36 md:h-36 object-contain mb-2 md:mb-4" />
      <h3 className="text-[11.5px] sm:text-[13px] md:text-base font-bold text-slate-800 mb-1 md:mb-2 line-clamp-2 h-8 sm:h-10 md:h-12 leading-tight">{product.name}</h3>
      <div className="text-blue-600 font-extrabold text-[13px] sm:text-[15px] md:text-lg mb-2 md:mb-4">{getMinPrice(product).toLocaleString()}đ</div>
      <Link to={`/product/${product.slug}`} className="bg-blue-600 text-white py-1.5 px-2 md:py-2 md:px-4 rounded-md md:rounded-lg font-bold text-[11px] sm:text-[12px] md:text-[13px] w-full text-center transition-colors hover:bg-blue-700">Mua ngay</Link>
    </div>
  );

  const SearchSlot = ({ slot }) => (
    <div className="bg-white border-2 border-dashed border-slate-200 rounded-lg md:rounded-xl w-full max-w-[160px] sm:max-w-[200px] md:max-w-[250px] flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 text-slate-400">
      {activeSearchSlot !== slot ? (
        <>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl md:text-2xl mb-2 md:mb-3 text-slate-300">+</div>
          <p className="text-[11.5px] md:text-sm font-medium mb-3 md:mb-4 text-center">Thêm sản phẩm</p>
          <button className="bg-white border border-blue-600 text-blue-600 py-1.5 px-2.5 md:py-2 md:px-4 rounded-md md:rounded-lg text-[10.5px] md:text-xs font-bold transition-colors hover:bg-blue-50 cursor-pointer" onClick={() => setActiveSearchSlot(slot)}>Tìm kiếm</button>
        </>
      ) : (
        <div className="w-full relative">
          <input type="text" placeholder="Nhập tên..." value={searchCompare} onChange={(e) => setSearchCompare(e.target.value)} autoFocus className="w-full p-2 px-2 md:p-2.5 md:px-4 border border-slate-300 rounded-md md:rounded-lg text-[12px] md:text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-800" />
          {isSearching && <span className="absolute right-2 top-2.5 text-[10px] text-slate-400 animate-pulse">...</span>}
          {compareResults.length > 0 && (
            <div className="absolute top-full left-[-20px] right-[-20px] md:left-0 md:right-0 bg-white border border-slate-200 rounded-lg md:rounded-xl z-[60] mt-1 md:mt-2 shadow-2xl max-h-[200px] md:max-h-[250px] overflow-y-auto w-[200px] sm:w-auto">
              {compareResults.map(p => (
                <div key={p._id} className="p-2 md:p-3 flex items-center gap-2 md:gap-3 cursor-pointer border-b border-slate-50 last:border-none hover:bg-slate-50" onClick={() => handleSelectProduct(p.slug)}>
                  <img src={p.colorImages?.find(c => c.isDefault)?.imageUrl || p.colorImages?.[0]?.imageUrl} alt={p.name} className="w-6 h-6 md:w-8 md:h-8 object-contain" />
                  <div className="flex-1 text-[11px] md:text-[13px] font-semibold text-slate-700 truncate">{p.name}</div>
                </div>
              ))}
            </div>
          )}
          <button className="mt-2 md:mt-3 text-[11px] md:text-xs bg-transparent border-none text-slate-400 cursor-pointer hover:text-slate-600 w-full" onClick={() => { setActiveSearchSlot(null); setSearchCompare(''); }}>Hủy</button>
        </div>
      )}
    </div>
  );

  if (loading) return <div className="flex justify-center items-center py-20 text-slate-500 font-medium animate-pulse">Đang tải dữ liệu so sánh...</div>;

  const hasProducts = product1 || product2;

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-10">
      <Header />
      <div className="max-w-[1200px] mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6">
        <nav className="flex items-center gap-1.5 md:gap-2 text-[12px] md:text-sm text-slate-500 mb-5 md:mb-8 flex-wrap">
          <Link to="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
          <ChevronRight size={14} />
          <Link to="/phones" className="hover:text-blue-600 transition-colors">Điện thoại</Link>
          <ChevronRight size={14} />
          <span className="text-slate-900 font-semibold">So sánh sản phẩm</span>
        </nav>

        <div className="mb-5 md:mb-8">
          <h1 className="text-xl md:text-3xl font-extrabold text-slate-800 mb-1.5 md:mb-2">So sánh chi tiết</h1>
          <p className="text-slate-500 text-[13px] md:text-[15px]">Đối chiếu thông số kỹ thuật giữa các siêu phẩm công nghệ hàng đầu.</p>
        </div>

        {hasProducts ? (
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* STICKY HEADER */}
            <div className="flex items-stretch bg-slate-50 border-b border-slate-200 sticky top-12 md:top-[70px] z-[40] p-2 sm:p-3 md:p-5 gap-2 sm:gap-3 md:gap-5">
              <div className="flex-[0.8] hidden md:flex items-center px-2">
                <div>
                  <h3 className="text-blue-700 font-bold text-lg mb-1">Thông số so sánh</h3>
                  <p className="text-slate-400 text-[13px] m-0">Chọn tối đa 2 sản phẩm để so sánh</p>
                </div>
              </div>
              <div className="flex-1 flex justify-center">
                {product1 ? <ProductCard product={product1} isP1={true} /> : <SearchSlot slot="p1" />}
              </div>
              <div className="flex-1 flex justify-center">
                {product2 ? <ProductCard product={product2} isP1={false} /> : <SearchSlot slot="p2" />}
              </div>
            </div>

            {/* BẢNG SO SÁNH */}
            <div className="p-0 md:p-5 md:pb-10 bg-white">
              <div className="flex bg-slate-50 border-b-2 border-slate-200 py-3 md:py-4 font-bold text-slate-800 text-[12px] sm:text-[13px] md:text-base">
                <div className="flex-[0.8] px-2 sm:px-3 md:px-5 text-left truncate">Thông số kỹ thuật</div>
                <div className="flex-1 px-1.5 sm:px-3 md:px-5 text-center line-clamp-2 md:truncate">{product1?.name || "-"}</div>
                <div className="flex-1 px-1.5 sm:px-3 md:px-5 text-center line-clamp-2 md:truncate">{product2?.name || "-"}</div>
              </div>

              {combinedSpecs.map((group, gIdx) => (
                <div key={gIdx} className="w-full">
                  {/* GROUP HEADER + ARROWS */}
                  <div className="flex items-center bg-blue-50/50 py-2 md:py-3">
                    <div className="flex-[0.8] px-2 sm:px-3 md:px-5 text-blue-700 font-extrabold text-[11px] md:text-[13px] uppercase tracking-wider">
                      {group.groupName}
                    </div>
                    <div className="flex-1 flex justify-center">
                      {product1 && product2 && <ArrowIndicator status={group.arrowStatus.p1} />}
                    </div>
                    <div className="flex-1 flex justify-center">
                      {product1 && product2 && <ArrowIndicator status={group.arrowStatus.p2} />}
                    </div>
                  </div>

                  {group.items.map((item, iIdx) => (
                    <div key={iIdx} className="flex items-center border-b border-slate-100 transition-colors hover:bg-slate-50/50">
                      <div className="flex-[0.8] px-2 sm:px-3 md:px-5 py-3 md:py-4 text-[11.5px] sm:text-[12.5px] md:text-sm text-slate-500 font-medium break-words">{item.key}</div>
                      <div className="flex-1 px-1.5 sm:px-3 md:px-5 py-3 md:py-4 text-[11.5px] sm:text-[12.5px] md:text-sm text-slate-800 font-semibold text-center leading-relaxed break-words" dangerouslySetInnerHTML={{ __html: item.p1Value.replace(/\\n/g, '<br/>') }}></div>
                      <div className="flex-1 px-1.5 sm:px-3 md:px-5 py-3 md:py-4 text-[11.5px] sm:text-[12.5px] md:text-sm text-slate-800 font-semibold text-center leading-relaxed break-words" dangerouslySetInnerHTML={{ __html: item.p2Value.replace(/\\n/g, '<br/>') }}></div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="bg-slate-100/80 p-5 md:p-10 m-0 md:m-5 rounded-none md:rounded-2xl border-t md:border border-slate-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                <div className="text-center md:text-left">
                  <h3 className="text-lg md:text-2xl font-bold text-slate-800 mb-1.5">Vẫn còn phân vân?</h3>
                  <p className="text-slate-500 text-[13px] md:text-[15px] m-0">Liên hệ đội ngũ tư vấn viên của V&T Nexis để được hỗ trợ tốt nhất.</p>
                </div>
                <div className="flex flex-row gap-3 md:gap-4 w-full md:w-auto mt-2 md:mt-0">
                  <Link to="/contact" className="flex-1 md:flex-none text-center border border-blue-600 text-blue-600 bg-white py-2.5 md:py-3 px-4 md:px-6 rounded-lg md:rounded-xl font-bold text-[13px] md:text-base hover:bg-blue-50">Chat với chuyên gia</Link>
                  <a href="tel:18001234" className="flex-1 md:flex-none text-center bg-blue-600 text-white py-2.5 md:py-3 px-4 md:px-6 rounded-lg md:rounded-xl font-bold text-[13px] md:text-base hover:bg-blue-700 shadow-lg shadow-blue-600/20">Gọi 1800 1234</a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 md:py-20 bg-white rounded-xl md:rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 mb-5 md:mb-6 text-[15px] md:text-lg">Vui lòng chọn sản phẩm để so sánh.</p>
            <Link to="/phones" className="inline-block bg-blue-600 text-white py-2.5 md:py-3 px-6 md:px-8 rounded-lg md:rounded-xl font-bold text-[14px] md:text-base hover:bg-blue-700 shadow-lg shadow-blue-600/20">Xem danh sách điện thoại</Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default ProductCompare;