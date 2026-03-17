import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, X, Search, Phone as PhoneIcon, MapPin, ShieldCheck, Mail } from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './ProductCompare.css';

function ProductCompare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const p1Slug = searchParams.get('p1');
  const p2Slug = searchParams.get('p2');

  const [product1, setProduct1] = useState(null);
  const [product2, setProduct2] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search state for inline adding
  const [searchCompare, setSearchCompare] = useState('');
  const [compareResults, setCompareResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeSearchSlot, setActiveSearchSlot] = useState(null); // 'p1' or 'p2'

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const fetchP1 = p1Slug ? axios.get(`http://localhost:5000/api/products/${p1Slug}`) : Promise.resolve({ data: null });
        const fetchP2 = p2Slug ? axios.get(`http://localhost:5000/api/products/${p2Slug}`) : Promise.resolve({ data: null });

        const [res1, res2] = await Promise.all([fetchP1, fetchP2]);
        setProduct1(res1.data?.data || res1.data);
        setProduct2(res2.data?.data || res2.data);
      } catch (error) {
        console.error("Lỗi lấy thông tin sản phẩm so sánh:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [p1Slug, p2Slug]);

  useEffect(() => {
    let debounceTimer;
    if (searchCompare.length > 1 && activeSearchSlot) {
        setIsSearching(true);
        debounceTimer = setTimeout(async () => {
            try {
                // Giới hạn tìm kiếm là điện thoại để so sánh cho đồng bộ
                const res = await axios.get(`http://localhost:5000/api/products?search=${searchCompare}&type=device`);
                const otherSlug = activeSearchSlot === 'p1' ? p2Slug : p1Slug;
                const filtered = (res.data || []).filter(p => p.slug !== otherSlug).slice(0, 10);
                setCompareResults(filtered);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsSearching(false);
            }
        }, 300);
    } else {
        setCompareResults([]);
    }
    return () => clearTimeout(debounceTimer);
  }, [searchCompare, activeSearchSlot, p1Slug, p2Slug]);

  const handleSelectProduct = (newSlug) => {
    if (activeSearchSlot === 'p1') {
      navigate(`/compare?p1=${newSlug}${p2Slug ? `&p2=${p2Slug}` : ''}`);
    } else {
      navigate(`/compare?${p1Slug ? `p1=${p1Slug}&` : ''}p2=${newSlug}`);
    }
    setSearchCompare('');
    setActiveSearchSlot(null);
    setCompareResults([]);
  };

  const getMainImage = (product) => {
    if (!product) return "";
    const defaultColor = product.colorImages?.find(c => c.isDefault);
    return defaultColor?.imageUrl || product.colorImages?.[0]?.imageUrl || "";
  };

  const getMinPrice = (product) => {
    if (!product?.variants?.length) return 0;
    return Math.min(...product.variants.map(v => v.price));
  };

  const combinedSpecs = useMemo(() => {
    const specsMap = new Map(); // Map<GroupName, Map<KeyName, { p1Value, p2Value }>>

    // Lọc ra các nhóm thông số quan trọng nhất mà người dùng hay quan tâm
    const IMPORTANT_GROUPS = [
      "Màn hình",
      "CPU & RAM",
      "Chụp hình & Quay phim",
      "Thông tin pin",
      "Thiết kế & Trọng lượng"
    ];

    const processSpecs = (product, isP1) => {
      if (!product?.detailedSpecs) return;

      Object.entries(product.detailedSpecs).forEach(([groupName, specsArr]) => {
        if (!IMPORTANT_GROUPS.includes(groupName)) return;

        if (!specsMap.has(groupName)) {
          specsMap.set(groupName, new Map());
        }
        
        const groupMap = specsMap.get(groupName);
        
        specsArr.forEach(spec => {
          if (!spec.key || spec.value === undefined || spec.value === null) return;
          
          if (!groupMap.has(spec.key)) {
            groupMap.set(spec.key, { p1Value: "-", p2Value: "-" });
          }
          
          const specItem = groupMap.get(spec.key);
          if (isP1) specItem.p1Value = spec.value;
          else specItem.p2Value = spec.value;
        });
      });
    };

    processSpecs(product1, true);
    processSpecs(product2, false);

    // Xóa các nhóm rỗng
    const finalSpecs = [];
    specsMap.forEach((groupMap, groupName) => {
      if (groupMap.size > 0) {
        const items = [];
        groupMap.forEach((values, key) => {
          items.push({ key, ...values });
        });
        finalSpecs.push({ groupName, items });
      }
    });

    return finalSpecs;
  }, [product1, product2]);

  const handleRemoveProduct = (isP1) => {
    if (isP1) {
      if (p2Slug) {
        navigate(`/compare?p1=${p2Slug}`);
      } else {
        navigate(`/compare`);
      }
    } else {
      navigate(`/compare?p1=${p1Slug}`);
    }
  };

  if (loading) return <div className="loading-state">Đang tải dữ liệu so sánh...</div>;

  const hasProducts = product1 || product2;

  return (
    <div className="product-compare-page">
      <Header />

      <div className="compare-container">
        <nav className="breadcrumb">
          <Link to="/">Trang chủ</Link> <ChevronRight size={14} />
          <Link to="/phones">Điện thoại</Link> <ChevronRight size={14} />
          <span className="current">So sánh sản phẩm</span>
        </nav>

        <div className="compare-header-title">
          <h1>So sánh chi tiết</h1>
          <p>Đối chiếu thông số kỹ thuật giữa các siêu phẩm công nghệ hàng đầu.</p>
        </div>

        {hasProducts ? (
          <div className="compare-content">
            {/* STICKY HEADER CHO CÁC SẢN PHẨM */}
            <div className="compare-products-header sticky-compare-bar">
              <div className="compare-header-cell label-cell">
                <div className="compare-instruction">
                  <h3>Thông số so sánh</h3>
                  <p>Chọn tối đa 2 sản phẩm để so sánh</p>
                </div>
              </div>

              {/* PRODUCT 1 */}
              <div className="compare-header-cell product-cell">
                {product1 ? (
                  <div className="product-compare-card">
                    <button className="btn-remove-product" onClick={() => handleRemoveProduct(true)}>
                      <X size={16} />
                    </button>
                    <img src={getMainImage(product1)} alt={product1.name} className="compare-product-img" />
                    <h3 className="compare-product-name">{product1.name}</h3>
                    <div className="compare-product-price">{getMinPrice(product1).toLocaleString()}đ</div>
                    <Link to={`/product/${product1.slug}`} className="btn-buy-now">Mua ngay</Link>
                  </div>
                ) : (
                  <div className="empty-product-slot">
                    {!activeSearchSlot || activeSearchSlot !== 'p1' ? (
                      <>
                        <div className="empty-slot-icon">+</div>
                        <p>Thêm sản phẩm</p>
                        <button className="btn-outline-primary" style={{ marginTop: '15px', padding: '8px 16px', fontSize: '13px' }} onClick={() => setActiveSearchSlot('p1')}>
                          Tìm kiếm
                        </button>
                      </>
                    ) : (
                      <div className="inline-compare-search" style={{ width: '100%', position: 'relative' }}>
                        <div className="compare-search" style={{ width: '100%' }}>
                          <input 
                            type="text" 
                            placeholder="Nhập tên điện thoại..." 
                            value={searchCompare}
                            onChange={(e) => setSearchCompare(e.target.value)}
                            autoFocus
                            style={{ width: '100%', padding: '10px 15px', borderRadius: '6px', border: '1px solid #ddd' }}
                          />
                          {isSearching && <span style={{ position: 'absolute', right: '10px', top: '10px', fontSize: '12px', color: '#888' }}>...</span>}
                        </div>
                        {compareResults.length > 0 && (
                          <div className="compare-search-results" style={{
                            position: 'absolute', top: '100%', left: 0, right: 0, 
                            background: 'white', border: '1px solid #ddd', borderRadius: '8px', 
                            zIndex: 10, marginTop: '5px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            maxHeight: '250px', overflowY: 'auto', textAlign: 'left'
                          }}>
                              {compareResults.map(p => (
                                  <div 
                                      key={p._id} 
                                      style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                      onClick={() => handleSelectProduct(p.slug)}
                                  >
                                      <img src={p.colorImages?.find(c => c.isDefault)?.imageUrl || p.colorImages?.[0]?.imageUrl} alt={p.name} style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                                      <div style={{ flex: 1, fontSize: '12px', fontWeight: 500, color: '#333' }}>{p.name}</div>
                                  </div>
                              ))}
                          </div>
                        )}
                        <button style={{ marginTop: '10px', fontSize: '12px', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }} onClick={() => { setActiveSearchSlot(null); setSearchCompare(''); }}>Hủy</button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* PRODUCT 2 */}
              <div className="compare-header-cell product-cell">
                {product2 ? (
                  <div className="product-compare-card">
                    <button className="btn-remove-product" onClick={() => handleRemoveProduct(false)}>
                      <X size={16} />
                    </button>
                    <img src={getMainImage(product2)} alt={product2.name} className="compare-product-img" />
                    <h3 className="compare-product-name">{product2.name}</h3>
                    <div className="compare-product-price">{getMinPrice(product2).toLocaleString()}đ</div>
                    <Link to={`/product/${product2.slug}`} className="btn-buy-now">Mua ngay</Link>
                  </div>
                ) : (
                  <div className="empty-product-slot">
                    {!activeSearchSlot || activeSearchSlot !== 'p2' ? (
                      <>
                        <div className="empty-slot-icon">+</div>
                        <p>Thêm sản phẩm để so sánh</p>
                        <button className="btn-outline-primary" style={{ marginTop: '15px', padding: '8px 16px', fontSize: '13px' }} onClick={() => setActiveSearchSlot('p2')}>
                          Tìm kiếm
                        </button>
                      </>
                    ) : (
                      <div className="inline-compare-search" style={{ width: '100%', position: 'relative' }}>
                        <div className="compare-search" style={{ width: '100%' }}>
                          <input 
                            type="text" 
                            placeholder="Nhập tên điện thoại..." 
                            value={searchCompare}
                            onChange={(e) => setSearchCompare(e.target.value)}
                            autoFocus
                            style={{ width: '100%', padding: '10px 15px', borderRadius: '6px', border: '1px solid #ddd' }}
                          />
                          {isSearching && <span style={{ position: 'absolute', right: '10px', top: '10px', fontSize: '12px', color: '#888' }}>...</span>}
                        </div>
                        {compareResults.length > 0 && (
                          <div className="compare-search-results" style={{
                            position: 'absolute', top: '100%', left: 0, right: 0, 
                            background: 'white', border: '1px solid #ddd', borderRadius: '8px', 
                            zIndex: 10, marginTop: '5px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            maxHeight: '250px', overflowY: 'auto', textAlign: 'left'
                          }}>
                              {compareResults.map(p => (
                                  <div 
                                      key={p._id} 
                                      style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                      onClick={() => handleSelectProduct(p.slug)}
                                  >
                                      <img src={p.colorImages?.find(c => c.isDefault)?.imageUrl || p.colorImages?.[0]?.imageUrl} alt={p.name} style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                                      <div style={{ flex: 1, fontSize: '12px', fontWeight: 500, color: '#333' }}>{p.name}</div>
                                  </div>
                              ))}
                          </div>
                        )}
                        <button style={{ marginTop: '10px', fontSize: '12px', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }} onClick={() => { setActiveSearchSlot(null); setSearchCompare(''); }}>Hủy</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* BẢNG SO SÁNH */}
            <div className="compare-table-wrapper">
              <div className="compare-table-row table-header-labels">
                <div className="compare-cell bold-text">Thông số kỹ thuật</div>
                <div className="compare-cell bold-text">{product1?.name || "-"}</div>
                <div className="compare-cell bold-text">{product2?.name || "-"}</div>
              </div>

              {combinedSpecs.map((group, gIdx) => (
                <div key={gIdx} className="compare-group-section">
                  <div className="compare-group-title">
                    {group.groupName.toUpperCase()}
                  </div>
                  
                  {group.items.map((item, iIdx) => (
                    <div key={iIdx} className="compare-table-row">
                      <div className="compare-cell spec-label">{item.key}</div>
                      <div className="compare-cell spec-value" dangerouslySetInnerHTML={{ __html: item.p1Value.replace(/\n/g, '<br/>') }}></div>
                      <div className="compare-cell spec-value" dangerouslySetInnerHTML={{ __html: item.p2Value.replace(/\n/g, '<br/>') }}></div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Support Footer Banner */}
            <div className="compare-support-banner">
              <div className="support-banner-content">
                <div className="support-text">
                  <h3>Vẫn còn phân vân?</h3>
                  <p>Liên hệ đội ngũ tư vấn viên của TechNova để được hỗ trợ tốt nhất.</p>
                </div>
                <div className="support-actions">
                  <Link to="/contact" className="btn-outline-primary">Chat với chuyên gia</Link>
                  <a href="tel:18001234" className="btn-primary-solid">Gọi 1800 1234</a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-compare-state">
            <p>Vui lòng chọn sản phẩm để so sánh.</p>
            <Link to="/phones" className="btn-primary-solid">Xem danh sách điện thoại</Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default ProductCompare;
