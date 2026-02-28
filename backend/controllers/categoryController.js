const Category = require("../models/Category");

exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Danh mục đã tồn tại" });
    }

    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

exports.getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let category;

    // Kiểm tra xem người dùng truyền ID hay Slug
    if (mongoose.Types.ObjectId.isValid(id)) {
      category = await Category.findById(id);
    } else {
      category = await Category.findOne({ slug: id }); // Tìm theo trường slug
    }

    if (!category) {
      res.status(404); // Thiết lập status để errorHandler bắt được
      throw new Error("Không tìm thấy danh mục");
    }

    res.json(category);
  } catch (error) {
    next(error); // Đẩy lỗi về errorHandler.js
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) return res.status(404).json({ message: "Không tìm thấy danh mục" });

    category.name = name || category.name;
    category.description = description || category.description;

    const updated = await category.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Không tìm thấy danh mục" });

    await category.deleteOne();
    res.json({ message: "Xoá danh mục thành công" });
  } catch (error) {
    next(error);
  }
};