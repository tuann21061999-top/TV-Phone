import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import ProductReview from '../../components/Review/ProductReview';
import { ShoppingCart } from 'lucide-react';
import '../SpecDetail/SpecDetail.css'; // Re-use sticky nav styling

function ReviewPage() {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`http://localhost:5000/api/products/${slug}`);
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

    if (loading) return <div className="loading-state">Đang tải...</div>;
    if (!product) return <div className="error-state">Không tìm thấy sản phẩm</div>;

    return (
        <div className="spec-detail-page">
            <Header />

            {/* STICKY TOP HEADER BAR */}
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
                        <Link to={`/product/${product.slug}/specs`} className="nav-link">Thông số kỹ thuật</Link>
                        <span className="nav-link active">Đánh giá</span>
                        <Link to={`/product/${product.slug}`} className="btn-buy-now-sticky">
                            <ShoppingCart size={16} /> Mua ngay
                        </Link>
                    </div>
                </div>
            </div>

            <div className="spec-container" style={{ marginTop: '40px', marginBottom: '80px', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <ProductReview productId={product._id} />
            </div>

            <Footer />
        </div>
    );
}

export default ReviewPage;
