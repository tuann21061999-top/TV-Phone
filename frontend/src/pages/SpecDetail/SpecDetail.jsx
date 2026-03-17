import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { ChevronRight, Cpu, HardDrive, Maximize, Camera, Battery, Smartphone, Wifi, Gamepad2, Layers, ShoppingCart, List } from 'lucide-react';
import './SpecDetail.css';

const ICONS = {
    "Thông tin chung": <Layers size={20} color="#2563eb" />,
    "Màn hình": <Maximize size={20} color="#2563eb" />,
    "Chụp hình & Quay phim": <Camera size={20} color="#2563eb" />,
    "CPU & RAM": <Cpu size={20} color="#2563eb" />,
    "Bộ nhớ & Lưu trữ": <HardDrive size={20} color="#2563eb" />,
    "Thiết kế & Trọng lượng": <Smartphone size={20} color="#2563eb" />,
    "Thông tin pin": <Battery size={20} color="#2563eb" />,
    "Kết nối & Cổng giao tiếp": <Wifi size={20} color="#2563eb" />,
    "Giải trí & Ứng dụng": <Gamepad2 size={20} color="#2563eb" />,
};

function SpecDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // Search for compare state
    const [searchCompare, setSearchCompare] = useState('');
    const [compareResults, setCompareResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`http://localhost:5000/api/products/${slug}`);
                setProduct(res.data.data || res.data);
            } catch (error) {
                console.error("Lỗi lấy thông số chi tiết:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);

    useEffect(() => {
        let debounceTimer;
        if (searchCompare.length > 1) {
            setIsSearching(true);
            debounceTimer = setTimeout(async () => {
                try {
                    const typeParam = product?.productType === 'device' ? '&type=device' : '';
                    const res = await axios.get(`http://localhost:5000/api/products?search=${searchCompare}${typeParam}`);
                    // Filter out the current product from search results, increase limit to 15
                    const filtered = (res.data || []).filter(p => p.slug !== slug).slice(0, 15);
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
    }, [searchCompare, slug]);

    const mainImage = useMemo(() => {
        if (!product) return "";
        const defaultColor = product.colorImages?.find(c => c.isDefault);
        return defaultColor?.imageUrl || product.colorImages?.[0]?.imageUrl || "";
    }, [product]);

    const minPrice = useMemo(() => {
        if (!product?.variants?.length) return 0;
        return Math.min(...product.variants.map(v => v.price));
    }, [product]);

    if (loading) return <div className="loading-state">Đang tải cấu hình chi tiết...</div>;
    if (!product) return <div className="error-state">Không tìm thấy sản phẩm</div>;

    const hasDetailedSpecs = product.detailedSpecs &&
        Object.keys(product.detailedSpecs).length > 0 &&
        Object.values(product.detailedSpecs).some(val => val !== null && val !== "" && (typeof val !== 'object' || Object.keys(val).length > 0));
    const hasBasicSpecs = product.specs && Object.keys(product.specs).length > 0;

    return (
        <div className="spec-detail-page">
            <Header />

            {/* Sticky Top Header Bar */}
            <div className="spec-sticky-header">
                <div className="spec-container sticky-content">
                    <div className="sticky-product-info">
                        <img src={mainImage} alt={product.name} />
                        <div>
                            <h2 className="sticky-title">{product.name}</h2>
                            <span className="sticky-price">{minPrice.toLocaleString()}đ</span>
                        </div>
                    </div>
                    <div className="sticky-nav">
                        <Link to={`/product/${product.slug}`} className="nav-link">Tổng quan</Link>
                        <span className="nav-link active">Thông số kỹ thuật chi tiết</span>
                        <Link to={`/product/${product.slug}/reviews`} className="nav-link">Đánh giá</Link>
                    </div>
                </div>
            </div>

            <div className="spec-container main-content-layout">
                {/* Left Sidebar */}
                <div className="spec-sidebar">
                    <div className="sidebar-card">
                        <h3>So sánh cấu hình</h3>
                        <p className="sidebar-desc">Chọn thiết bị khác để xem sự khác biệt về cấu hình.</p>
                        <div className="compare-search-dropdown-wrapper" style={{ position: 'relative' }}>
                            <div className="compare-search">
                                <input 
                                    type="text" 
                                    placeholder="Tìm sản phẩm..." 
                                    value={searchCompare}
                                    onChange={(e) => setSearchCompare(e.target.value)}
                                />
                                <span className="plus-icon">{isSearching ? '...' : '+'}</span>
                            </div>
                            
                            {compareResults.length > 0 && (
                                <div className="compare-search-results" style={{
                                    position: 'absolute', top: '100%', left: 0, right: 0, 
                                    background: 'white', border: '1px solid #ddd', borderRadius: '8px', 
                                    zIndex: 10, marginTop: '5px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    maxHeight: '300px', overflowY: 'auto'
                                }}>
                                    {compareResults.map(p => (
                                        <div 
                                            key={p._id} 
                                            className="search-result-item"
                                            style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                            onClick={() => navigate(`/compare?p1=${product.slug}&p2=${p.slug}`)}
                                        >
                                            <img src={p.colorImages?.find(c => c.isDefault)?.imageUrl || p.colorImages?.[0]?.imageUrl} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                                            <div style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: '#333' }}>{p.name}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="sidebar-card support-card">
                        <h3 className="text-primary">Bạn cần hỗ trợ?</h3>
                        <p className="sidebar-desc">Các chuyên gia công nghệ của chúng tôi luôn sẵn lòng giúp đỡ.</p>
                        <Link to="/contact" className="btn-support-chat">Chat với tư vấn viên</Link>
                    </div>
                </div>

                {/* Right Main Content */}
                <div className="spec-main">
                    <nav className="breadcrumb">
                        <Link to="/">Trang chủ</Link> <ChevronRight size={14} />
                        <Link to={`/product/${product.slug}`}>{product.name}</Link> <ChevronRight size={14} />
                        <span className="current">Thông số kỹ thuật</span>
                    </nav>

                    {hasDetailedSpecs ? (
                        <div className="detailed-specs-list">
                            {Object.entries(product.detailedSpecs).map(([groupName, specsArr], idx) => {
                                // Bỏ qua nhóm nếu không có dữ liệu thực tế
                                const validSpecs = Array.isArray(specsArr) ? specsArr.filter(s => s.value && String(s.value).trim() !== "") : [];
                                if (validSpecs.length === 0) return null;

                                return (
                                    <div key={idx} className="spec-group-box">
                                        <div className="spec-group-header">
                                            <div className="icon-wrapper">
                                                {ICONS[groupName] || <List size={20} color="#2563eb" />}
                                            </div>
                                            <h3 className="spec-group-title">{groupName}</h3>
                                        </div>

                                        <div className="spec-items-grid">
                                            {validSpecs.map((spec, sIdx) => (
                                                <div key={sIdx} className="spec-item-cell">
                                                    <div className="spec-item-key">{spec.key}</div>
                                                    <div className="spec-item-value" dangerouslySetInnerHTML={{ __html: String(spec.value).replace(/\n/g, '<br/>') }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : hasBasicSpecs ? (
                        <div className="detailed-specs-list fallback-specs">
                            <div className="spec-group-box">
                                <div className="spec-group-header">
                                    <div className="icon-wrapper">
                                        <List size={20} color="#2563eb" />
                                    </div>
                                    <h3 className="spec-group-title">Cấu hình sản phẩm</h3>
                                </div>
                                <div className="spec-items-grid">
                                    {Object.entries(product.specs).map(([key, value], idx) => (
                                        <div key={idx} className="spec-item-cell">
                                            <div className="spec-item-key">{key}</div>
                                            <div className="spec-item-value">{value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="no-detailed-specs-message">
                            <p>chưa có thông tin phù hợp</p>
                            <Link to={`/product/${product.slug}`} className="btn-back">Quay lại Tổng quan</Link>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default SpecDetail;
