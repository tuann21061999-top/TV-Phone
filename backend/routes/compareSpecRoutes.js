const express = require("express");
const router = express.Router();
const {
  getCompareSpecs,
  getActiveCompareSpecs,
  createCompareSpec,
  updateCompareSpec,
  deleteCompareSpec,
} = require("../controllers/compareSpecController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.route("/").get(getCompareSpecs);
router.route("/active").get(getActiveCompareSpecs);

// Admin routes
router.route("/").post(protect, admin, createCompareSpec);
router.route("/:id").put(protect, admin, updateCompareSpec).delete(protect, admin, deleteCompareSpec);

module.exports = router;
