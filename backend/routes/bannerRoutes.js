const express = require("express");
const router = express.Router();
const bannerController = require("../controllers/bannerController");
const { protect, admin } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// ==========================================
// PUBLIC ROUTES (Frontend - Cho người dùng xem)
// ==========================================

// GET /api/banners -> Lấy danh sách banner đang active hiển thị ở Hero
router.get("/", bannerController.getPublicBanners);


// ==========================================
// ADMIN ROUTES (Chỉ Admin có quyền thao tác)
// ==========================================

// GET /api/banners/admin/all -> Lấy toàn bộ banner để quản lý
router.get("/admin/all", protect, admin, bannerController.getAdminBanners);

// POST /api/banners/admin -> Thêm banner mới (ĐÃ GỘP BẢO MẬT & UPLOAD)
router.post(
  "/admin", 
  protect, 
  admin, 
  upload.single("image"), 
  bannerController.createBanner
);

// PUT /api/banners/admin/:id -> Cập nhật banner (ĐÃ GỘP BẢO MẬT & UPLOAD)
router.put(
  "/admin/:id", 
  protect, 
  admin, 
  upload.single("image"), 
  bannerController.updateBanner
);

// PUT /api/banners/admin/:id/toggle-status -> Bật/tắt hiển thị banner
router.put(
  "/admin/:id/toggle-status", 
  protect, 
  admin, 
  bannerController.toggleBannerStatus
);

// DELETE /api/banners/admin/:id -> Xóa vĩnh viễn banner
router.delete(
  "/admin/:id", 
  protect, 
  admin, 
  bannerController.deleteBanner
);

module.exports = router;