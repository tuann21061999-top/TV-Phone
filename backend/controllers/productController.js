const Product = require("../models/Product");
const mongoose = require("mongoose");

/* =====================================
   CREATE PRODUCT
===================================== */

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* =====================================
   GET ALL PRODUCTS (FILTER + SEARCH)
===================================== */

exports.getAllProducts = async (req, res) => {
  try {
    const { type, brand, search, condition } = req.query;

    let filter = { isActive: true };

    if (type) filter.productType = type;
    if (brand) filter.brand = brand;
    if (condition) filter.condition = condition;

    // SEARCH name, brand, highlights
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { highlights: { $elemMatch: { $regex: search, $options: "i" } } },
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

    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 🔥 Chỉ trả về variant đang active
    product.variants = product.variants.filter(v => v.isActive);

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
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
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