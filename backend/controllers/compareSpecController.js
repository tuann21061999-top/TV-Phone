const CompareSpec = require("../models/CompareSpec");

// @desc    Get all compare specs
// @route   GET /api/compare-specs
exports.getCompareSpecs = async (req, res) => {
  try {
    const specs = await CompareSpec.find({}).sort({ order: 1 });
    res.json(specs);
  } catch (error) {
    console.error("Error fetching compare specs:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách nhóm so sánh" });
  }
};

// @desc    Get active compare specs
// @route   GET /api/compare-specs/active
exports.getActiveCompareSpecs = async (req, res) => {
  try {
    const specs = await CompareSpec.find({ isActive: true }).sort({ order: 1 });
    res.json(specs);
  } catch (error) {
    console.error("Error fetching active compare specs:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách nhóm so sánh" });
  }
};

// @desc    Create a compare spec group
// @route   POST /api/compare-specs
exports.createCompareSpec = async (req, res) => {
  try {
    const { name, order, tiers, isActive } = req.body;

    const exists = await CompareSpec.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Nhóm so sánh với tên này đã tồn tại" });
    }

    // Validate: ranks must be unique within tiers
    if (tiers && tiers.length > 0) {
      const ranks = tiers.map(t => t.rank);
      const uniqueRanks = new Set(ranks);
      if (ranks.length !== uniqueRanks.size) {
        return res.status(400).json({ message: "Thứ tự (rank) trong các bậc không được trùng nhau!" });
      }
    }

    const spec = await CompareSpec.create({
      name,
      order: order || 1,
      tiers: (tiers || []).sort((a, b) => a.rank - b.rank),
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json(spec);
  } catch (error) {
    console.error("Error creating compare spec:", error);
    res.status(500).json({ message: "Lỗi khi tạo nhóm so sánh: " + error.message, error: error.stack });
  }
};

// @desc    Update a compare spec group
// @route   PUT /api/compare-specs/:id
exports.updateCompareSpec = async (req, res) => {
  try {
    const { name, order, tiers, isActive } = req.body;
    const spec = await CompareSpec.findById(req.params.id);

    if (!spec) {
      return res.status(404).json({ message: "Không tìm thấy nhóm so sánh" });
    }

    // Validate unique ranks
    if (tiers && tiers.length > 0) {
      const ranks = tiers.map(t => t.rank);
      const uniqueRanks = new Set(ranks);
      if (ranks.length !== uniqueRanks.size) {
        return res.status(400).json({ message: "Thứ tự (rank) trong các bậc không được trùng nhau!" });
      }
    }

    if (name !== undefined) spec.name = name;
    if (order !== undefined) spec.order = order;
    if (isActive !== undefined) spec.isActive = isActive;
    if (tiers !== undefined) {
      spec.tiers = tiers.sort((a, b) => a.rank - b.rank);
    }

    const updated = await spec.save();
    res.json(updated);
  } catch (error) {
    console.error("Error updating compare spec:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật nhóm so sánh" });
  }
};

// @desc    Delete a compare spec group
// @route   DELETE /api/compare-specs/:id
exports.deleteCompareSpec = async (req, res) => {
  try {
    const spec = await CompareSpec.findById(req.params.id);
    if (!spec) {
      return res.status(404).json({ message: "Không tìm thấy nhóm so sánh" });
    }

    await CompareSpec.findByIdAndDelete(spec._id);
    res.json({ message: "Đã xóa nhóm so sánh thành công" });
  } catch (error) {
    console.error("Error deleting compare spec:", error);
    res.status(500).json({ message: "Lỗi khi xóa nhóm so sánh" });
  }
};
