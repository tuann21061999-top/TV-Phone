const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
    uploadNewsImage,
    getAllNews,
    getAdminNews,
    getNewsBySlug,
    createNews,
    updateNews,
    deleteNews,
    toggleNewsStatus,
} = require("../controllers/newsController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getAllNews);

// Admin routes (phải đặt TRƯỚC /:slug để tránh bị match nhầm)
router.get("/admin/all", protect, admin, getAdminNews);
router.post("/upload-image", protect, admin, upload.single("image"), uploadNewsImage);
router.post("/", protect, admin, createNews);
router.put("/:id", protect, admin, updateNews);
router.delete("/:id", protect, admin, deleteNews);
router.patch("/:id/toggle", protect, admin, toggleNewsStatus);

// Public detail (đặt SAU admin routes)
router.get("/:slug", getNewsBySlug);

module.exports = router;
