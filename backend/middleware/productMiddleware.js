exports.validateProduct = (req, res, next) => {
  const { name, slug, productType, categoryId, variants } = req.body;

  if (!name || !slug || !productType || !categoryId) {
    return res.status(400).json({
      message: "Missing required fields",
    });
  }

  if (!Array.isArray(variants) || variants.length === 0) {
    return res.status(400).json({
      message: "At least one variant is required",
    });
  }

  for (const variant of variants) {
    if (!variant.sku || variant.price == null) {
      return res.status(400).json({
        message: "Each variant must have sku and price",
      });
    }
  }

  next();
};