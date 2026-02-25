const Product = require("../models/Product");
const slugify = require("slugify");

// ================= GET ALL PRODUCTS =================
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      brand,
      category,
      sort
    } = req.query;

    const query = {};

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Filter brand
    if (brand) {
      query.brand = brand;
    }

    // Filter category
    if (category) {
      query.categoryId = category;
    }

    let sortOption = {};
    if (sort === "price_asc") sortOption.basePrice = 1;
    if (sort === "price_desc") sortOption.basePrice = -1;
    if (sort === "newest") sortOption.createdAt = -1;

    const products = await Product.find(query)
      .populate("categoryId", "name")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET BY SLUG =================
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug
    }).populate("categoryId", "name");

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= CREATE PRODUCT (ADMIN) =================
exports.createProduct = async (req, res) => {
  try {
    const data = req.body;

    data.slug = slugify(data.name, { lower: true });

    const product = await Product.create(data);

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE PRODUCT =================
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    Object.assign(product, req.body);

    if (req.body.name) {
      product.slug = slugify(req.body.name, { lower: true });
    }

    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE PRODUCT =================
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    await product.deleteOne();

    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};