import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Edit2, RefreshCcw, Search, AlertTriangle, X } from "lucide-react";
import "./ManagePromotions.css";

const ManagePromotions = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");

    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [discountType, setDiscountType] = useState("none");
    const [discountValue, setDiscountValue] = useState("");
    const [promotionEnd, setPromotionEnd] = useState("");
    const [isShockDeal, setIsShockDeal] = useState(false);
    const [quantityLimit, setQuantityLimit] = useState("");
    const [projectedPrice, setProjectedPrice] = useState(null);
    const [projectedProfit, setProjectedProfit] = useState(null);

    const fetchPromotions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/promotions/admin/promotions", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPromotions(res.data);
        } catch (error) {
            console.error("Lỗi fetch promotions", error);
            toast.error("Không thể tải danh sách khuyến mãi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    // Tính toán realtime khi nhập form
    useEffect(() => {
        if (!selectedProduct) return;

        let newPrice = selectedProduct.lowestPrice;
        const val = Number(discountValue) || 0;

        if (discountType === "fixed") {
            newPrice = Math.max(0, selectedProduct.lowestPrice - val);
        } else if (discountType === "percentage") {
            newPrice = Math.max(0, selectedProduct.lowestPrice - (selectedProduct.lowestPrice * val / 100));
        }

        setProjectedPrice(newPrice);
        setProjectedProfit(newPrice - (selectedProduct.avgImportPrice || 0));
    }, [discountType, discountValue, selectedProduct]);

    const handleOpenModal = (product) => {
        setSelectedProduct(product);
        setDiscountType(product.discountType || "none");
        setDiscountValue(product.discountValue || "");

        if (product.promotionEnd) {
            const date = new Date(product.promotionEnd);
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
            setPromotionEnd(date.toISOString().slice(0, 16));
        } else {
            setPromotionEnd("");
        }

        setIsShockDeal(product.isShockDeal || false);
        setQuantityLimit(product.quantityLimit || "");
        setShowModal(true);
    };

    const handleSaveDiscount = async (e) => {
        e.preventDefault();
        if (discountType !== "none" && (!discountValue || !promotionEnd)) {
            toast.error("Vui lòng nhập đầy đủ giá trị và thời hạn!");
            return;
        }
        if (discountType !== "none" && new Date(promotionEnd) <= new Date()) {
            toast.error("Thời hạn kết thúc phải ở tương lai!");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            // Gọi API cấp sản phẩm (không có variantId nữa)
            const res = await axios.put(
                `http://localhost:5000/api/promotions/admin/promotions/${selectedProduct.productId}`,
                { discountType, discountValue: Number(discountValue), promotionEnd, isShockDeal, quantityLimit: Number(quantityLimit) || 0 },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.warning) {
                toast.warning(res.data.warning, { duration: 5000 });
            } else {
                toast.success("Áp dụng khuyến mãi thành công cho toàn bộ phiên bản!");
            }

            setShowModal(false);
            fetchPromotions();
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi cập nhật khuyến mãi");
        }
    };

    const handleResetDiscount = async (product) => {
        if (!window.confirm(`Bạn có chắc muốn hủy khuyến mãi cho "${product.productName}"?`)) return;
        try {
            const token = localStorage.getItem("token");
            // Gọi API cấp sản phẩm reset
            await axios.put(
                `http://localhost:5000/api/promotions/admin/promotions/${product.productId}/reset`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Đã hủy khuyến mãi!");
            fetchPromotions();
        } catch (error) {
            toast.error("Lỗi khi hủy khuyến mãi");
        }
    };

    const filteredPromotions = promotions.filter(p => {
        const matchesSearch = p.productName.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;
        if (filter === "active") return p.isActivePromo;
        if (filter === "none") return !p.isActivePromo;
        return true;
    });

    return (
        <div className="manage-promotions">
            <div className="manage-header">
                <h2>Quản lý Khuyến mãi Sản phẩm</h2>
                <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: "14px" }}>
                    Thiết lập giảm giá cho 1 sản phẩm sẽ tự động áp dụng cho TẤT CẢ phiên bản của sản phẩm đó
                </p>
            </div>

            <div className="controls-row">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Tìm theo tên sản phẩm..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-box">
                    <select value={filter} onChange={e => setFilter(e.target.value)}>
                        <option value="all">Tất cả sản phẩm</option>
                        <option value="active">Đang khuyến mãi</option>
                        <option value="none">Chưa có khuyến mãi</option>
                    </select>
                </div>

                <button className="btn-refresh" onClick={fetchPromotions}>
                    <RefreshCcw size={16} /> Làm mới
                </button>
            </div>

            <div className="table-responsive">
                <table className="promo-table">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Số phiên bản</th>
                            <th>Giá thấp nhất</th>
                            <th>Giá sau giảm</th>
                            <th>Trạng thái</th>
                            <th>Kết thúc</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>Đang tải dữ liệu...</td></tr>
                        ) : filteredPromotions.length === 0 ? (
                            <tr><td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>Không tìm thấy sản phẩm nào</td></tr>
                        ) : (
                            filteredPromotions.map((item, index) => (
                                <tr key={index} className={item.isActivePromo ? "active-row" : ""}>
                                    <td>
                                        <div className="product-info-cell">
                                            <img src={item.productImage || "/no-image.png"} alt="product" />
                                            <div className="names">
                                                <strong>{item.productName}</strong>
                                                <small style={{ color: "#64748b" }}>
                                                    {item.variantCount} phiên bản · Tồn: {item.totalStock}
                                                </small>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: "600" }}>{item.variantCount}</td>
                                    <td>{item.lowestPrice?.toLocaleString()}đ</td>
                                    <td>
                                        {item.isActivePromo && item.lowestDiscountPrice != null ? (
                                            <div className="discount-info">
                                                <strong className={item.lowestDiscountPrice < item.avgImportPrice ? "text-danger" : "text-success"}>
                                                    {item.lowestDiscountPrice?.toLocaleString()}đ
                                                </strong>
                                                {item.isShockDeal && <small className="badge-promo">SHOCK</small>}
                                            </div>
                                        ) : (
                                            <span style={{ color: "#94a3b8" }}>—</span>
                                        )}
                                    </td>
                                    <td>
                                        {item.isActivePromo ? (
                                            <span className="status-badge active">Đang chạy</span>
                                        ) : item.promotionEnd ? (
                                            <span className="status-badge expired">Hết hạn</span>
                                        ) : (
                                            <span className="status-badge none">Chưa có</span>
                                        )}
                                    </td>
                                    <td>
                                        {item.promotionEnd ? (
                                            <small className="end-time">{new Date(item.promotionEnd).toLocaleString("vi-VN")}</small>
                                        ) : "—"}
                                    </td>
                                    <td className="actions-cell">
                                        <button className="btn-edit-promo" onClick={() => handleOpenModal(item)}>
                                            <Edit2 size={15} /> Thiết lập
                                        </button>
                                        {item.isActivePromo && (
                                            <button className="btn-reset-promo" onClick={() => handleResetDiscount(item)}>
                                                Hủy
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {showModal && selectedProduct && (
                <div className="promo-modal-overlay">
                    <div className="promo-modal">
                        <div className="modal-header">
                            <h3>Thiết lập Khuyến mãi</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSaveDiscount} className="modal-body">
                            <div className="variant-summary">
                                <strong>{selectedProduct.productName}</strong>
                                <br />
                                <span style={{ color: "#64748b", fontSize: "13px" }}>
                                    {selectedProduct.variantCount} phiên bản · Giảm giá sẽ áp dụng cho TẤT CẢ phiên bản
                                </span>
                                <br />
                                Giá gốc thấp nhất: <span className="text-primary">{selectedProduct.lowestPrice?.toLocaleString()}đ</span> |
                                WAC TB: <span className="text-warning">{selectedProduct.avgImportPrice?.toLocaleString()}đ</span>
                            </div>

                            <div className="form-group">
                                <label>Loại Giảm giá</label>
                                <select value={discountType} onChange={e => setDiscountType(e.target.value)}>
                                    <option value="none">Không giảm giá</option>
                                    <option value="fixed">Giảm số tiền cụ thể (VNĐ)</option>
                                    <option value="percentage">Giảm theo % (áp dụng đều cho mọi phiên bản)</option>
                                </select>
                            </div>

                            {discountType !== "none" && (
                                <>
                                    <div className="form-group">
                                        <label>Giá trị giảm {discountType === "percentage" ? "(%)" : "(VNĐ)"}</label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={discountValue}
                                            onChange={e => setDiscountValue(e.target.value)}
                                            placeholder={discountType === "percentage" ? "VD: 10 (nghĩa là giảm 10%)" : "VD: 500000"}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Thời gian kết thúc</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={promotionEnd}
                                            onChange={e => setPromotionEnd(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group checkbox-group">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={isShockDeal}
                                                onChange={e => setIsShockDeal(e.target.checked)}
                                            />
                                            Đánh dấu là Flash Sale / Shock Deal
                                        </label>
                                    </div>

                                    {isShockDeal && (
                                        <div className="form-group">
                                            <label>Số lượng giới hạn (Bỏ trống hoặc 0 if không giới hạn)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={quantityLimit}
                                                onChange={e => setQuantityLimit(e.target.value)}
                                                placeholder="VD: 50"
                                            />
                                        </div>
                                    )}

                                    <div className="projection-box">
                                        <p>Giá thấp nhất sau KM dự tính: <strong>{projectedPrice?.toLocaleString()}đ</strong></p>
                                        {projectedProfit !== null && (
                                            <p className={`profit-calc ${projectedProfit < 0 ? 'loss' : 'gain'}`}>
                                                {projectedProfit < 0 ? <AlertTriangle size={16} /> : null}
                                                {projectedProfit < 0 ? 'CẢNH BÁO BÁN LỖ: ' : 'Lợi nhuận dự tính: '}
                                                {projectedProfit.toLocaleString()}đ / sản phẩm
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn-save">Lưu & Áp dụng</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagePromotions;
