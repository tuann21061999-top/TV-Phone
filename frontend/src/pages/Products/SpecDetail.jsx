import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import { ChevronRight, Cpu, HardDrive, Maximize, Camera, Battery, Smartphone, Wifi, Gamepad2, Layers, ShoppingCart, List } from 'lucide-react';

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
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${slug}`);
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
                    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products?search=${searchCompare}${typeParam}`);
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

    if (loading) return <div className="flex justify-center items-center py-20 text-slate-500 font-medium animate-pulse">Đang tải cấu hình chi tiết...</div>;
    if (!product) return <div className="flex justify-center items-center py-20 text-red-500 font-medium">Không tìm thấy sản phẩm</div>;

    const hasDetailedSpecs = product.detailedSpecs &&
        Object.keys(product.detailedSpecs).length > 0 &&
        Object.values(product.detailedSpecs).some(val => val !== null && val !== "" && (typeof val !== 'object' || Object.keys(val).length > 0));
    const hasBasicSpecs = product.specs && Object.keys(product.specs).length > 0;

    return (
        <div className="bg-slate-50 min-h-screen font-['Inter',sans-serif]">
            <Header />

            {/* Sticky Top Header Bar */}
            <div className="sticky top-0 bg-white border-b border-slate-200 z-40 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                <div className="max-w-[1400px] mx-auto px-4 md:px-10 w-full flex justify-between items-center h-12 md:h-[68px]">
                    
                    {/* THÔNG TIN SẢN PHẨM (CHỈ HIỆN TRÊN PC) */}
                    <div className="hidden md:flex items-center gap-4 shrink-0">
                        <img src={mainImage} alt={product.name} className="w-[45px] h-[45px] object-contain bg-slate-100 rounded-lg p-1" />
                        <div>
                            <h2 className="m-0 mb-0.5 text-base font-bold text-slate-800 truncate max-w-[250px]">{product.name}</h2>
                            <span className="text-sm font-semibold text-blue-600">{minPrice.toLocaleString()}đ</span>
                        </div>
                    </div>
                    
                    {/* MENU TABS (VUỐT NGANG TRÊN MOBILE) */}
                    <div className="flex items-center gap-6 h-full w-full md:w-auto overflow-x-auto whitespace-nowrap scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <Link to={`/product/${product.slug}`} className="text-[13.5px] md:text-sm font-semibold text-slate-500 no-underline relative h-full flex items-center hover:text-blue-600 transition-colors shrink-0 px-1 md:px-0">Tổng quan</Link>
                        <span className="text-[13.5px] md:text-sm font-semibold text-blue-600 relative h-full flex items-center after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2.5px] md:after:h-[3px] after:bg-blue-600 after:rounded-t-sm cursor-default shrink-0 px-1 md:px-0">Thông số kỹ thuật chi tiết</span>
                        <Link to={`/product/${product.slug}/reviews`} className="text-[13.5px] md:text-sm font-semibold text-slate-500 no-underline relative h-full flex items-center hover:text-blue-600 transition-colors shrink-0 px-1 md:px-0">Đánh giá</Link>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 md:px-10 w-full flex flex-col lg:flex-row gap-6 lg:gap-[30px] mt-4 lg:mt-[30px] mb-12 lg:mb-[60px]">
                {/* Left Sidebar */}
                <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4 md:gap-5 order-2 lg:order-1">
                    <div className="bg-white rounded-xl p-5 md:p-6 border border-slate-200 shadow-sm">
                        <h3 className="m-0 mb-2 md:mb-2.5 text-[15px] md:text-base font-bold text-slate-800">So sánh cấu hình</h3>
                        <p className="text-[13px] md:text-[13.5px] text-slate-500 leading-relaxed mb-4 md:mb-5">Chọn thiết bị khác để xem sự khác biệt về cấu hình.</p>
                        <div className="relative">
                            <div className="flex items-center border border-slate-300 rounded-lg p-2 md:p-2.5 px-3 md:px-4 bg-slate-50 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                                <input 
                                    type="text" 
                                    placeholder="Tìm sản phẩm..." 
                                    className="border-none bg-transparent flex-1 outline-none text-[13px] md:text-sm text-slate-800 w-full"
                                    value={searchCompare}
                                    onChange={(e) => setSearchCompare(e.target.value)}
                                />
                                <span className="bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full text-lg font-bold shrink-0 ml-2">
                                    {isSearching ? '...' : '+'}
                                </span>
                            </div>
                            
                            {compareResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-lg z-20 mt-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.1)] max-h-[300px] overflow-y-auto">
                                    {compareResults.map(p => (
                                        <div 
                                            key={p._id} 
                                            className="p-2.5 flex items-center gap-2.5 cursor-pointer border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors"
                                            onClick={() => navigate(`/compare?p1=${product.slug}&p2=${p.slug}`)}
                                        >
                                            <img src={p.colorImages?.find(c => c.isDefault)?.imageUrl || p.colorImages?.[0]?.imageUrl} alt={p.name} className="w-10 h-10 object-contain" />
                                            <div className="flex-1 text-[13px] font-semibold text-slate-800">{p.name}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-green-50 rounded-xl p-5 md:p-6 border border-green-200 shadow-sm">
                        <h3 className="m-0 mb-2 md:mb-2.5 text-[15px] md:text-base font-bold text-blue-600">Bạn cần hỗ trợ?</h3>
                        <p className="text-[13px] md:text-[13.5px] text-slate-600 leading-relaxed mb-4 md:mb-5">Các chuyên gia công nghệ của chúng tôi luôn sẵn lòng giúp đỡ.</p>
                        <Link to="/contact" className="block text-center bg-white border border-blue-600 text-blue-600 p-2.5 md:p-3 rounded-lg font-semibold text-[14px] md:text-base no-underline transition-colors hover:bg-blue-50">
                            Chat với tư vấn viên
                        </Link>
                    </div>
                </div>

                {/* Right Main Content */}
                <div className="flex-1 min-w-0 order-1 lg:order-2">
                    <nav className="flex items-center gap-1.5 md:gap-2 text-[13px] md:text-sm text-slate-500 mb-5 md:mb-6 flex-wrap">
                        <Link to="/" className="text-slate-500 hover:text-blue-600 no-underline transition-colors">Trang chủ</Link> 
                        <ChevronRight size={14} />
                        <Link to={`/product/${product.slug}`} className="text-slate-500 hover:text-blue-600 no-underline transition-colors">{product.name}</Link> 
                        <ChevronRight size={14} />
                        <span className="font-semibold text-slate-800">Thông số kỹ thuật</span>
                    </nav>

                    {hasDetailedSpecs ? (
                        <div className="flex flex-col gap-6 md:gap-10">
                            {Object.entries(product.detailedSpecs).map(([groupName, specsArr], idx) => {
                                // Bỏ qua nhóm nếu không có dữ liệu thực tế
                                const validSpecs = Array.isArray(specsArr) ? specsArr.filter(s => s.value && String(s.value).trim() !== "") : [];
                                if (validSpecs.length === 0) return null;

                                return (
                                    <div key={idx} className="bg-transparent">
                                        <div className="flex items-center gap-2.5 md:gap-3 mb-4 md:mb-5">
                                            <div className="bg-blue-50 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-lg text-blue-600 shrink-0">
                                                {ICONS[groupName] || <List size={20} className="text-blue-600" />}
                                            </div>
                                            <h3 className="m-0 text-lg md:text-xl font-bold text-slate-800">{groupName}</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 bg-white p-5 md:p-8 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm">
                                            {validSpecs.map((spec, sIdx) => (
                                                <div key={sIdx} className="flex flex-col gap-1.5">
                                                    <div className="text-[12px] md:text-[13px] font-bold uppercase tracking-[0.5px] text-slate-400">{spec.key}</div>
                                                    <div className="text-[14px] md:text-[15px] text-slate-700 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: String(spec.value).replace(/\n/g, '<br/>') }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : hasBasicSpecs ? (
                        <div className="flex flex-col gap-6 md:gap-10">
                            <div className="bg-transparent">
                                <div className="flex items-center gap-2.5 md:gap-3 mb-4 md:mb-5">
                                    <div className="bg-blue-50 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-lg shrink-0">
                                        <List size={20} className="text-blue-600" />
                                    </div>
                                    <h3 className="m-0 text-lg md:text-xl font-bold text-slate-800">Cấu hình sản phẩm</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 bg-white p-5 md:p-8 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm">
                                    {Object.entries(product.specs).map(([key, value], idx) => (
                                        <div key={idx} className="flex flex-col gap-1.5">
                                            <div className="text-[12px] md:text-[13px] font-bold uppercase tracking-[0.5px] text-slate-400">{key}</div>
                                            <div className="text-[14px] md:text-[15px] text-slate-700 leading-relaxed font-medium">{value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-8 md:p-10 text-center rounded-xl md:rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-slate-500 mb-4 md:mb-5 text-[14px] md:text-[15px]">Chưa có thông tin cấu hình phù hợp</p>
                            <Link to={`/product/${product.slug}`} className="inline-block bg-blue-600 text-white py-2 md:py-2.5 px-5 md:px-6 rounded-lg no-underline font-semibold hover:bg-blue-700 transition-colors text-[14px] md:text-base">
                                Quay lại Tổng quan
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default SpecDetail;