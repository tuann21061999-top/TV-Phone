// controllers/adminController.js

const Product = require("../models/Product");

/* =====================================================
   ================= PRODUCT MANAGEMENT =================
===================================================== */

// @desc    Tạo sản phẩm mới
// @route   POST /api/admin/products
// @access  Admin
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      brand,
      description,
      condition,
      conditionLevel,
      colorImages,
      productType,
      highlights,
      categoryId,
      specs,
      variants,
      compatibleWith,
      isFeatured,
      promotion,
    } = req.body;

    if (!name || !productType || !categoryId || !variants || !colorImages) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc!" });
    }

    const product = await Product.create({
      name,
      brand,
      description,
      condition,
      conditionLevel,
      colorImages,
      productType,
      highlights,
      categoryId,
      specs,
      variants,
      compatibleWith,
      isFeatured,
      promotion,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ----------------------------------------------------- */

// @desc    Cập nhật sản phẩm
// @route   PUT /api/admin/products/:id
// @access  Admin
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });
    }

    Object.assign(product, req.body);

    const updated = await product.save(); // trigger validate + slug
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ----------------------------------------------------- */

// @desc    Soft delete sản phẩm (ẩn khỏi website)
// @route   DELETE /api/admin/products/:id
// @access  Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });
    }

    product.isActive = false;
    await product.save();

    res.json({ message: "Đã ẩn sản phẩm khỏi website!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ----------------------------------------------------- */

// @desc    Lấy tất cả sản phẩm (kể cả inactive)
// @route   GET /api/admin/products
// @access  Admin
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("categoryId")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ----------------------------------------------------- */

// @desc    Toggle trạng thái nổi bật
// @route   PATCH /api/admin/products/:id/feature
// @access  Admin
exports.toggleFeatured = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });
    }

    product.isFeatured = !product.isFeatured;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ----------------------------------------------------- */

// @desc    Toggle trạng thái hiển thị sản phẩm
// @route   PATCH /api/admin/products/:id/active
// @access  Admin
exports.toggleProductActive = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ----------------------------------------------------- */

// @desc    Cập nhật khuyến mãi
// @route   PATCH /api/admin/products/:id/promotion
// @access  Admin
exports.updatePromotion = async (req, res) => {
  try {
    const { discountPercent, startDate, endDate } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });
    }

    product.promotion = {
      discountPercent,
      startDate,
      endDate,
    };

    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ----------------------------------------------------- */

// @desc    Cập nhật tồn kho / giá variant
// @route   PATCH /api/admin/products/:productId/variants/:variantId
// @access  Admin
exports.updateVariantStock = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { quantity, price, importPrice, isActive } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });
    }

    const variant = product.variants.id(variantId);

    if (!variant) {
      return res.status(404).json({ message: "Không tìm thấy biến thể!" });
    }

    if (quantity !== undefined) variant.quantity = quantity;
    if (price !== undefined) variant.price = price;
    if (importPrice !== undefined) variant.importPrice = importPrice;
    if (isActive !== undefined) variant.isActive = isActive;

    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};