const Product = require("../models/Product");
const mongoose = require("mongoose");

/* =====================================
   CREATE PRODUCT
===================================== */
exports.createProduct = async (req, res) => {
  try {
    const fs = require('fs');
    fs.appendFileSync('debug_logs.txt', 'Create Product Payload: ' + JSON.stringify(req.body, null, 2) + '\n');
    console.log("Create Product Request Body:", JSON.stringify(req.body, null, 2));
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error("Create Product Error:", error.message);
    res.status(400).json({ message: error.message });
  }
};

/* =====================================
   GET ALL PRODUCTS (FILTER + SEARCH)
===================================== */
exports.getAllProducts = async (req, res) => {
  try {
    const { type, brand, search, condition, admin } = req.query;

    let filter = {};

    // ✅ FIX LỖI 1: Phải so sánh chuỗi chính xác. Chỉ khi admin đích thị là 'true' thì mới lấy cả hàng ẩn.
    if (admin !== 'true') {
      filter.isActive = true;
    }

    if (type === 'hot') {
      filter.isFeatured = true;
    } else if (type) {
      filter.productType = type;
      filter.isFeatured = { $ne: true }; // Loại trừ sản phẩm hot khỏi danh sách thường
    }
    if (brand) filter.brand = brand;
    if (condition) filter.condition = condition;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { highlights: { $elemMatch: { $regex: search, $options: "i" } } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter)
      .populate("categoryId", "name")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================
   GET PRODUCT BY ID OR SLUG
===================================== */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    let product;

    // Nếu là ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id)
        .populate("categoryId")
        .populate("compatibleWith", "name slug colorImages");
    }

    // Nếu không tìm thấy → tìm theo slug
    if (!product) {
      product = await Product.findOne({ slug: id })
        .populate("categoryId")
        .populate("compatibleWith", "name slug colorImages");
    }

    // Nếu không có sp, HOẶC sp đã bị ẩn (isActive = false)
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Chỉ trả về variant đang active
    if (product.variants) {
      product.variants = product.variants.filter(v => v.isActive !== false);
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================
   UPDATE PRODUCT
===================================== */
exports.updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.body.detailImages) {
      updateData.detailImages = req.body.detailImages;
    }

    console.log("Update Product Payload:", updateData);

    // ✅ FIX LỖI 2: Thêm $set để đảm bảo Mongoose chỉ cập nhật đúng trường gửi lên (vd: isActive: false)
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Update Product Error:", error.message);
    res.status(400).json({ message: error.message });
  }
};

/* =====================================
   DELETE PRODUCT
===================================== */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.toggleProductStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    // Dùng findByIdAndUpdate nhưng KHÔNG dùng runValidators: true
    // và chỉ update đúng trường isActive
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: isActive } },
      { new: true } // Trả về doc sau khi update
    );

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json({ message: "Cập nhật trạng thái thành công", isActive: product.isActive });
  } catch (error) {
    console.error("Toggle Status Error:", error.message);
    res.status(500).json({ message: "Lỗi server khi cập nhật trạng thái" });
  }
};