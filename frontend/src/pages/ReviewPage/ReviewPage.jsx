import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import ProductReview from '../../components/Review/ProductReview';
import { ShoppingCart } from 'lucide-react';

function ReviewPage() {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${slug}`);
                setProduct(res.data.data || res.data);
            } catch (error) {
                console.error("Lỗi lấy thông tin sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);

    const mainImage = useMemo(() => {
        if (!product) return "";
        const defaultColor = product.colorImages?.find(c => c.isDefault);
        return defaultColor?.imageUrl || product.colorImages?.[0]?.imageUrl || "";
    }, [product]);

    const minPrice = useMemo(() => {
        if (!product?.variants?.length) return 0;
        return Math.min(...product.variants.map(v => v.price));
    }, [product]);

    if (loading) return <div className="flex justify-center items-center min-h-[60vh] text-slate-500 font-medium animate-pulse">Đang tải...</div>;
    if (!product) return <div className="flex justify-center items-center min-h-[60vh] text-red-500 font-medium">Không tìm thấy sản phẩm</div>;

    return (
        <div className="bg-slate-50 min-h-screen font-sans flex flex-col">
            <Header />

            {/* TOP HEADER BAR (Sticky + Mobile Scroll) */}
            <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all">
                <div className="max-w-[1400px] mx-auto px-4 md:px-10 w-full flex justify-between items-center h-12 md:h-[68px]">
                    
                    {/* THÔNG TIN SẢN PHẨM (CHỈ HIỆN TRÊN PC) */}
                    <div className="hidden md:flex items-center gap-4 shrink-0">
                        <img src={mainImage} alt={product.name} className="w-[45px] h-[45px] object-contain bg-slate-100 rounded-lg p-1" />
                        <div>
                            <h2 className="m-0 mb-0.5 text-base font-bold text-slate-800 truncate max-w-[250px] lg:max-w-[300px]">{product.name}</h2>
                            <span className="text-sm font-semibold text-blue-600">{minPrice.toLocaleString()}đ</span>
                        </div>
                    </div>

                    {/* MENU TABS (VUỐT NGANG TRÊN MOBILE) */}
                    <div className="flex items-center gap-6 h-full w-full md:w-auto overflow-x-auto whitespace-nowrap scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <Link to={`/product/${product.slug}`} className="text-[13.5px] md:text-sm font-semibold text-slate-500 no-underline relative h-full flex items-center hover:text-blue-600 transition-colors shrink-0 px-1 md:px-0">
                            Tổng quan
                        </Link>
                        <Link to={`/product/${product.slug}/specs`} className="text-[13.5px] md:text-sm font-semibold text-slate-500 no-underline relative h-full flex items-center hover:text-blue-600 transition-colors shrink-0 px-1 md:px-0">
                            Thông số kỹ thuật chi tiết
                        </Link>
                        <span className="text-[13.5px] md:text-sm font-semibold text-blue-600 relative h-full flex items-center after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2.5px] md:after:h-[3px] after:bg-blue-600 after:rounded-t-sm cursor-default shrink-0 px-1 md:px-0">
                            Đánh giá
                        </span>
                    </div>

                </div>
            </div>

            {/* NỘI DUNG CHÍNH */}
            <div className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-5 mt-4 md:mt-8 mb-12 md:mb-20">
                <div className="bg-white p-4 sm:p-5 md:p-8 rounded-xl md:rounded-2xl shadow-sm border border-slate-200">
                    {/* Bọc component đánh giá bên trong khung này */}
                    {/* Lưu ý: Nếu component ProductReview bên trong chưa chuẩn Responsive, bạn cần vào component đó để chỉnh sửa thêm Tailwind nhé */}
                    <ProductReview productId={product._id} />
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default ReviewPage;