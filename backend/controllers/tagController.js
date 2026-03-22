const Tag = require("../models/Tag");

// @desc    Get all tags
// @route   GET /api/tags
// @access  Public/Private (depending on requirements, usually public for frontend viewing)
exports.getTags = async (req, res) => {
  try {
    const tags = await Tag.find({}).populate('applicableCategories', 'name');
    res.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ message: "Server Error: Có lỗi khi lấy danh sách tag" });
  }
};

// @desc    Get tags by type
// @route   GET /api/tags/type/:type
// @access  Public
exports.getTagsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const tags = await Tag.find({ type, isActive: true }).populate('applicableCategories', 'name');
    res.json(tags);
  } catch (error) {
    console.error("Error fetching tags by type:", error);
    res.status(500).json({ message: "Server Error: Có lỗi khi lấy danh sách tag theo loại" });
  }
};

// @desc    Create a tag
// @route   POST /api/tags
// @access  Private/Admin
exports.createTag = async (req, res) => {
  try {
    const { name, type, isActive, applicableCategories } = req.body;

    const tagExists = await Tag.findOne({ name, type });
    if (tagExists) {
      return res.status(400).json({ message: "Tag với tên và loại này đã tồn tại" });
    }

    const tag = await Tag.create({
      name,
      type,
      isActive: isActive !== undefined ? isActive : true,
      applicableCategories: applicableCategories || [],
    });

    res.status(201).json(tag);
  } catch (error) {
    console.error("Error creating tag:", error);
    res.status(500).json({ message: "Server Error: Có lỗi khi tạo tag" });
  }
};

// @desc    Update a tag
// @route   PUT /api/tags/:id
// @access  Private/Admin
exports.updateTag = async (req, res) => {
  try {
    const { name, type, isActive, applicableCategories } = req.body;
    const tag = await Tag.findById(req.params.id);

    if (tag) {
      tag.name = name || tag.name;
      tag.type = type || tag.type;
      
      if (isActive !== undefined) {
          tag.isActive = isActive;
      }
      
      if (applicableCategories !== undefined) {
          tag.applicableCategories = applicableCategories;
      }

      const updatedTag = await tag.save();
      res.json(updatedTag);
    } else {
      res.status(404).json({ message: "Không tìm thấy tag" });
    }
  } catch (error) {
    console.error("Error updating tag:", error);
    res.status(500).json({ message: "Server Error: Có lỗi khi cập nhật tag" });
  }
};

// @desc    Delete a tag
// @route   DELETE /api/tags/:id
// @access  Private/Admin
exports.deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (tag) {
      await Tag.findByIdAndDelete(tag._id);
      res.json({ message: "Đã xóa tag thành công" });
    } else {
      res.status(404).json({ message: "Không tìm thấy tag" });
    }
  } catch (error) {
    console.error("Error deleting tag:", error);
    res.status(500).json({ message: "Server Error: Có lỗi khi xóa tag" });
  }
};
