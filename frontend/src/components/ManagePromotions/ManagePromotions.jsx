import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Edit2, RefreshCcw, Search, AlertTriangle, X } from "lucide-react";

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

        // Tránh lỗi False Positive: Nếu Giá bán thấp nhất < Giá nhập T/Bình thì phép tính này vô nghĩa và luôn ra âm
        if ((selectedProduct.avgImportPrice || 0) <= selectedProduct.lowestPrice) {
            setProjectedProfit(newPrice - (selectedProduct.avgImportPrice || 0));
        } else {
            setProjectedProfit(null); // Ẩn nhãn dự tính
        }
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
        <div className="p-5 bg-slate-50 min-h-screen font-sans box-border">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 m-0">Quản lý Khuyến mãi Sản phẩm</h2>
                <p className="text-slate-500 mt-1 text-sm">
                    Thiết lập giảm giá cho 1 sản phẩm sẽ tự động áp dụng cho TẤT CẢ phiên bản của sản phẩm đó
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 flex-1 max-w-[400px] focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                    <Search size={18} className="text-slate-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Tìm theo tên sản phẩm..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="border-none p-2.5 outline-none w-full text-sm text-slate-700 bg-transparent"
                    />
                </div>

                <div className="relative">
                    <select
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="appearance-none py-2.5 pl-4 pr-10 border border-slate-200 rounded-lg outline-none bg-white text-slate-700 text-sm cursor-pointer focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:16px_16px]"
                    >
                        <option value="all">Tất cả sản phẩm</option>
                        <option value="active">Đang khuyến mãi</option>
                        <option value="none">Chưa có khuyến mãi</option>
                    </select>
                </div>

                <button
                    className="flex items-center gap-1.5 py-2.5 px-4 bg-white border border-slate-200 rounded-lg cursor-pointer text-slate-600 text-sm font-medium transition-all hover:bg-slate-100 active:bg-slate-200"
                    onClick={fetchPromotions}
                >
                    <RefreshCcw size={16} /> Làm mới
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-sm overflow-x-auto border border-slate-200">
                <table className="w-full min-w-[1000px] border-collapse text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b-2 border-slate-200">
                            <th className="p-4 font-semibold text-slate-600 text-[13px] uppercase tracking-wide whitespace-nowrap">Sản phẩm</th>
                            <th className="p-4 font-semibold text-slate-600 text-[13px] uppercase tracking-wide whitespace-nowrap">Số phiên bản</th>
                            <th className="p-4 font-semibold text-slate-600 text-[13px] uppercase tracking-wide whitespace-nowrap">Giá thấp nhất</th>
                            <th className="p-4 font-semibold text-slate-600 text-[13px] uppercase tracking-wide whitespace-nowrap">Giá sau giảm</th>
                            <th className="p-4 font-semibold text-slate-600 text-[13px] uppercase tracking-wide whitespace-nowrap">Trạng thái</th>
                            <th className="p-4 font-semibold text-slate-600 text-[13px] uppercase tracking-wide whitespace-nowrap">Kết thúc</th>
                            <th className="p-4 font-semibold text-slate-600 text-[13px] uppercase tracking-wide whitespace-nowrap text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" className="text-center p-10 text-slate-500 font-medium">Đang tải dữ liệu...</td></tr>
                        ) : filteredPromotions.length === 0 ? (
                            <tr><td colSpan="7" className="text-center p-10 text-slate-500 font-medium">Không tìm thấy sản phẩm nào</td></tr>
                        ) : (
                            filteredPromotions.map((item, index) => (
                                <tr key={index} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${item.isActivePromo ? "bg-green-50/30" : ""}`}>
                                    <td className="p-4 align-middle">
                                        <div className="flex items-center gap-3">
                                            <img src={item.productImage || "/no-image.png"} alt="product" className="w-10 h-10 rounded-md object-cover border border-slate-200 shrink-0" />
                                            <div className="flex flex-col">
                                                <strong className="text-sm text-slate-800 line-clamp-1">{item.productName}</strong>
                                                <small className="text-slate-500 text-xs font-medium mt-0.5">
                                                    {item.variantCount} phiên bản · Tồn: {item.totalStock}
                                                </small>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle font-semibold text-slate-700">{item.variantCount}</td>
                                    <td className="p-4 align-middle font-medium text-slate-600">{item.lowestPrice?.toLocaleString()}đ</td>
                                    <td className="p-4 align-middle">
                                        {item.isActivePromo && item.lowestDiscountPrice != null ? (
                                            <div className="flex flex-col items-start gap-1">
                                                <strong className={`text-[15px] ${item.lowestDiscountPrice < item.avgImportPrice ? "text-red-500" : "text-green-600"}`}>
                                                    {item.lowestDiscountPrice?.toLocaleString()}đ
                                                </strong>
                                                {item.isShockDeal && <span className="inline-block bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider">SHOCK</span>}
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 font-medium">—</span>
                                        )}
                                    </td>
                                    <td className="p-4 align-middle">
                                        {item.isActivePromo ? (
                                            <span className="py-1 px-2.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Đang chạy</span>
                                        ) : item.promotionEnd ? (
                                            <span className="py-1 px-2.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Hết hạn</span>
                                        ) : (
                                            <span className="py-1 px-2.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">Chưa có</span>
                                        )}
                                    </td>
                                    <td className="p-4 align-middle">
                                        {item.promotionEnd ? (
                                            <span className="text-xs text-slate-500 font-medium">{new Date(item.promotionEnd).toLocaleString("vi-VN")}</span>
                                        ) : <span className="text-slate-400">—</span>}
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                className="flex items-center gap-1 bg-blue-500 text-white border-none py-1.5 px-3 rounded-md cursor-pointer text-xs font-semibold transition-colors hover:bg-blue-600 shadow-sm"
                                                onClick={() => handleOpenModal(item)}
                                            >
                                                <Edit2 size={14} /> Thiết lập
                                            </button>
                                            {item.isActivePromo && (
                                                <button
                                                    className="bg-white text-slate-600 border border-slate-300 py-1.5 px-3 rounded-md cursor-pointer text-xs font-semibold transition-colors hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                                                    onClick={() => handleResetDiscount(item)}
                                                >
                                                    Hủy
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {showModal && selectedProduct && (
                <div className="fixed inset-0 w-full h-full bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center z-[1000] p-4">
                    <div className="bg-white w-full max-w-[500px] rounded-xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] flex flex-col max-h-[90vh] animate-[fadeIn_0.2s_ease-out]">
                        <div className="p-5 border-b border-slate-200 flex justify-between items-center shrink-0">
                            <h3 className="m-0 text-lg font-bold text-slate-800">Thiết lập Khuyến mãi</h3>
                            <button className="bg-transparent border-none text-slate-400 hover:text-red-500 cursor-pointer transition-colors p-1" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSaveDiscount} className="p-5 overflow-y-auto">
                            <div className="bg-slate-50 p-3.5 rounded-lg mb-5 text-sm border border-slate-200">
                                <strong className="text-slate-800 text-[15px]">{selectedProduct.productName}</strong>
                                <div className="text-slate-500 text-[13px] mt-1 mb-2">
                                    {selectedProduct.variantCount} phiên bản · Giảm giá sẽ áp dụng cho TẤT CẢ phiên bản
                                </div>
                                <div className="text-sm text-slate-600">
                                    Giá gốc thấp nhất: <span className="text-blue-600 font-semibold">{selectedProduct.lowestPrice?.toLocaleString()}đ</span> |
                                    WAC TB: <span className="text-amber-500 font-semibold ml-1">{selectedProduct.avgImportPrice?.toLocaleString()}đ</span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Loại Giảm giá</label>
                                <select
                                    value={discountType}
                                    onChange={e => setDiscountType(e.target.value)}
                                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none text-sm text-slate-700 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center] bg-[length:16px_16px]"
                                >
                                    <option value="none">Không giảm giá</option>
                                    <option value="fixed">Giảm số tiền cụ thể (VNĐ)</option>
                                    <option value="percentage">Giảm theo % (áp dụng đều cho mọi phiên bản)</option>
                                </select>
                            </div>

                            {discountType !== "none" && (
                                <div className="space-y-4 animate-[fadeIn_0.3s_ease-in-out]">
                                    <div>
                                        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Giá trị giảm {discountType === "percentage" ? "(%)" : "(VNĐ)"}</label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={discountValue}
                                            onChange={e => setDiscountValue(e.target.value)}
                                            placeholder={discountType === "percentage" ? "VD: 10 (nghĩa là giảm 10%)" : "VD: 500000"}
                                            className="w-full p-2.5 border border-slate-300 rounded-lg outline-none text-sm text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Thời gian kết thúc</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={promotionEnd}
                                            onChange={e => setPromotionEnd(e.target.value)}
                                            className="w-full p-2.5 border border-slate-300 rounded-lg outline-none text-sm text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={isShockDeal}
                                                onChange={e => setIsShockDeal(e.target.checked)}
                                                className="w-4 h-4 cursor-pointer accent-red-500 rounded"
                                            />
                                            <span className="text-sm font-medium text-slate-700">Đánh dấu là Flash Sale / Shock Deal</span>
                                        </label>
                                    </div>

                                    {isShockDeal && (
                                        <div className="animate-[fadeIn_0.3s_ease-in-out]">
                                            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Số lượng giới hạn <span className="font-normal text-slate-500">(Bỏ trống hoặc 0 nếu không giới hạn)</span></label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={quantityLimit}
                                                onChange={e => setQuantityLimit(e.target.value)}
                                                placeholder="VD: 50"
                                                className="w-full p-2.5 border border-slate-300 rounded-lg outline-none text-sm text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                            />
                                        </div>
                                    )}

                                    <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl mt-5">
                                        <p className="m-0 mb-2 text-sm text-slate-700">Giá thấp nhất sau KM dự tính: <strong className="text-blue-700 text-base">{projectedPrice?.toLocaleString()}đ</strong></p>
                                        {projectedProfit !== null && (
                                            <p className={`m-0 flex items-center gap-1.5 font-semibold text-[13px] ${projectedProfit < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                {projectedProfit < 0 ? <AlertTriangle size={15} /> : null}
                                                {projectedProfit < 0 ? 'CẢNH BÁO BÁN LỖ: ' : 'Lợi nhuận dự tính: '}
                                                {projectedProfit.toLocaleString()}đ / sản phẩm
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6 pt-2">
                                <button type="button" className="py-2 px-5 bg-white border border-slate-300 text-slate-600 rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-slate-50" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="py-2 px-6 bg-blue-600 text-white border-none rounded-lg text-sm font-semibold cursor-pointer shadow-sm transition-colors hover:bg-blue-700">Lưu & Áp dụng</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagePromotions;
