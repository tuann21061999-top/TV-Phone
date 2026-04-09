const express = require("express");
const router = express.Router();
const {
  getTags,
  getTagsByType,
  createTag,
  updateTag,
  deleteTag,
} = require("../controllers/tagController");
const { protect, admin } = require("../middleware/authMiddleware");

// Lấy danh sách tags public
router.route("/").get(getTags);
router.route("/type/:type").get(getTagsByType);

// Các route cần quyền admin
router.route("/").post(protect, admin, createTag);
router.route("/:id").put(protect, admin, updateTag).delete(protect, admin, deleteTag);

module.exports = router;
