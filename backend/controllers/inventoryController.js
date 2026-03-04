const Product = require("../models/Product");

/* =====================================================
   NHẬP HÀNG VỚI CẬP NHẬT GIÁ NHẬP TRUNG BÌNH (WAC)
   =====================================================
   Công thức:
   Giá_nhập_mới = (Số_tồn_cũ × Giá_nhập_cũ + Số_lượng_mới × Giá_lô_mới)
                  / (Số_tồn_cũ + Số_lượng_mới)
===================================================== */

exports.importStock = async (req, res) => {
    try {
        const { productId, variantId, importQuantity, importUnitPrice } = req.body;

        // ── Validate input ──────────────────────────────────────
        if (!productId || !variantId) {
            return res.status(400).json({ message: "Thiếu productId hoặc variantId!" });
        }

        if (!importQuantity || importQuantity <= 0) {
            return res.status(400).json({ message: "Số lượng nhập phải lớn hơn 0!" });
        }

        if (importUnitPrice === undefined || importUnitPrice < 0) {
            return res.status(400).json({ message: "Giá nhập lô hàng không hợp lệ!" });
        }

        // ── Tìm sản phẩm & variant ─────────────────────────────
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });
        }

        const variant = product.variants.id(variantId);
        if (!variant) {
            return res.status(404).json({ message: "Không tìm thấy biến thể!" });
        }

        // ── Lấy giá trị cũ ─────────────────────────────────────
        const oldQuantity = variant.quantity || 0;
        const oldImportPrice = variant.importPrice || 0;

        // ── Tính toán WAC ───────────────────────────────────────
        const totalQuantity = oldQuantity + importQuantity;

        let newImportPrice;

        if (totalQuantity === 0) {
            // Edge case: cả tồn cũ lẫn nhập mới đều = 0 → giữ nguyên giá cũ
            newImportPrice = oldImportPrice;
        } else {
            // Áp dụng công thức Weighted Average Cost
            newImportPrice = Math.round(
                (oldQuantity * oldImportPrice + importQuantity * importUnitPrice) / totalQuantity
            );
        }

        // ── Cập nhật variant ────────────────────────────────────
        variant.importPrice = newImportPrice;
        variant.quantity = totalQuantity;

        await product.save();

        // ── Phản hồi kết quả chi tiết ──────────────────────────
        res.status(200).json({
            message: "Nhập hàng thành công!",
            data: {
                productName: product.name,
                variantSku: variant.sku,
                colorName: variant.colorName,
                storage: variant.storage,
                oldQuantity,
                importQuantity,
                newQuantity: totalQuantity,
                oldImportPrice,
                importUnitPrice,
                newImportPrice,
            },
        });
    } catch (error) {
        console.error("Lỗi nhập hàng:", error);
        res.status(500).json({ message: "Lỗi server khi nhập hàng", error: error.message });
    }
};
