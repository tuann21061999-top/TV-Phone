const mongoose = require("mongoose");

exports.validateProduct = (req, res, next) => {
  const {
    name,
    productType,
    categoryId,
    variants,
    highlights,
    colorImages,
    condition,
    conditionLevel
  } = req.body;

  /* ===============================
     1. REQUIRED FIELDS
  =============================== */

  if (!name || !productType || !categoryId) {
    return res.status(400).json({
      message: "Missing required fields: name, productType, or categoryId",
    });
  }

  /* ===============================
     2. VALIDATE CATEGORY ID
  =============================== */

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({
      message: "Invalid Category ID format",
    });
  }

  /* ===============================
     3. VALIDATE PRODUCT TYPE
  =============================== */

  const validTypes = ["device", "electronic", "accessory"];

  if (!validTypes.includes(productType)) {
    return res.status(400).json({
      message: "Invalid productType",
    });
  }

  /* ===============================
     4. VALIDATE CONDITION
  =============================== */

  if (condition) {
    const validConditions = ["new", "used"];
    if (!validConditions.includes(condition)) {
      return res.status(400).json({
        message: "Invalid condition (must be new or used)",
      });
    }

    if (condition === "used") {
      const validLevels = ["99%", "98%", "97%"];
      if (
  !Array.isArray(conditionLevel) ||
  conditionLevel.length === 0 ||
  !conditionLevel.every(lv => validLevels.includes(lv))
) {
  return res.status(400).json({
    message:
      "Used products must have conditionLevel (99%, 98%, 97%)",
  });
}
    }
  }

  /* ===============================
     5. VALIDATE HIGHLIGHTS
  =============================== */

  if (highlights && !Array.isArray(highlights)) {
    return res.status(400).json({
      message: "Highlights must be an array of strings",
    });
  }

  /* ===============================
     6. VALIDATE COLOR IMAGES
  =============================== */

  if (!Array.isArray(colorImages) || colorImages.length === 0) {
    return res.status(400).json({
      message: "At least one colorImage is required",
    });
  }

  const colorNames = [];

  for (const color of colorImages) {
    if (!color.colorName || !color.imageUrl) {
      return res.status(400).json({
        message: "Each colorImage must have colorName and imageUrl",
      });
    }

    colorNames.push(color.colorName);
  }

  /* ===============================
     7. VALIDATE VARIANTS
  =============================== */

  if (!Array.isArray(variants) || variants.length === 0) {
    return res.status(400).json({
      message: "At least one variant is required",
    });
  }

  for (const variant of variants) {
    if (!variant.sku || variant.price == null || !variant.storage || !variant.colorName) {
      return res.status(400).json({
        message:
          "Each variant must have sku, price, storage and colorName",
      });
    }

    if (!colorNames.includes(variant.colorName)) {
      return res.status(400).json({
        message: `Variant color "${variant.colorName}" does not exist in colorImages`,
      });
    }

    if (variant.price < 0) {
      return res.status(400).json({
        message: "Variant price must be >= 0",
      });
    }

    if (variant.quantity && variant.quantity < 0) {
      return res.status(400).json({
        message: "Variant quantity must be >= 0",
      });
    }
  }

  next();
};