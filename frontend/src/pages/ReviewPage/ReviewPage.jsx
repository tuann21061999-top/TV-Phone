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

            {/* TOP HEADER BAR (Không cuộn theo trang) */}
            <div className="hidden md:block z-40 bg-white border-b border-slate-200 shadow-sm transition-all">
                <div className="max-w-[1400px] mx-auto px-10 flex justify-between items-center h-16">
                    <div className="flex items-center gap-4">
                        <img src={mainImage} alt={product.name} className="h-10 w-10 object-contain" />
                        <div className="flex flex-col">
                            <h2 className="m-0 text-sm font-bold text-slate-800 truncate max-w-[200px] lg:max-w-[300px]">{product.name}</h2>
                            <span className="text-xs font-bold text-blue-600">{minPrice.toLocaleString()}đ</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 h-full">
                        <Link to={`/product/${product.slug}`} className="text-slate-600 font-medium hover:text-blue-600 h-full flex items-center text-sm no-underline transition-colors px-2">
                            Tổng quan
                        </Link>
                        <Link to={`/product/${product.slug}/specs`} className="text-slate-600 font-medium hover:text-blue-600 h-full flex items-center text-sm no-underline transition-colors px-2">
                            Thông số kỹ thuật chi tiết
                        </Link>
                        <span className="text-blue-600 font-semibold border-b-2 border-blue-600 h-full flex items-center text-sm cursor-default px-2">
                            Đánh giá
                        </span>
                    </div>
                </div>
            </div>

            {/* NỘI DUNG CHÍNH */}
            <div className="flex-1 w-full max-w-[1200px] mx-auto px-5 mt-8 mb-20">
                <div className="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                    {/* Bọc component đánh giá bên trong khung này */}
                    <ProductReview productId={product._id} />
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default ReviewPage;
