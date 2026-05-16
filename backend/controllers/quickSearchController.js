const Product = require("../models/Product");
const CompareSpec = require("../models/CompareSpec");

// @desc    Smart Search products based on compare ratings
// @route   POST /api/products/smart-search
// @access  Public
exports.smartSearch = async (req, res) => {
  try {
    // req.body.ratings = { groupId1: tierId1, groupId2: tierId2, ... }
    const { ratings } = req.body;

    if (!ratings || Object.keys(ratings).length === 0) {
      return res.status(400).json({ message: "Vui lòng chọn ít nhất 1 thông số" });
    }

    // Load active compare specs to know ranks
    const specs = await CompareSpec.find({ isActive: true });
    
    // Map group id to an object mapping tier id to its rank
    // For quick lookup: ranksMap[groupId][tierId] = rankNumber
    const ranksMap = {};
    specs.forEach(spec => {
      ranksMap[spec._id.toString()] = {};
      spec.tiers.forEach(tier => {
        ranksMap[spec._id.toString()][tier._id.toString()] = tier.rank;
      });
    });

    // We only search for devices that are active
    const products = await Product.find({ productType: "device", isActive: true })
                                  .populate("colorImages")
                                  .populate("categoryId", "name");

    const requestedGroups = Object.keys(ratings);

    // Calculate penalty for each product
    const scoredProducts = products.map(product => {
      let penalty = 0;
      let matchCount = 0;

      // Build a quick lookup for product's current ratings
      const prodRatings = {};
      if (product.compareRatings && product.compareRatings.length > 0) {
        product.compareRatings.forEach(r => {
          if (r.groupId && r.tierId) {
            prodRatings[r.groupId.toString()] = r.tierId.toString();
          }
        });
      }

      let diffSum = 0; // Dương = Tốt hơn tổng thể, Âm = Kém hơn tổng thể

      requestedGroups.forEach(groupId => {
        const reqTierId = ratings[groupId];
        const reqRank = ranksMap[groupId] ? ranksMap[groupId][reqTierId] : null;

        if (reqRank == null) return; // Invalid request data

        const prodTierId = prodRatings[groupId];
        if (!prodTierId) {
          // Product doesn't have rating for this group => severe penalty
          penalty += 1000; 
          return;
        }

        const prodRank = ranksMap[groupId][prodTierId];
        if (prodRank == null) {
          penalty += 1000;
          return;
        }

        const diff = Math.abs(prodRank - reqRank);
        if (diff > 1) {
          penalty += 1000; // Only allow +/- 1 rank difference
        } else if (prodRank === reqRank) {
          // Exact match! No penalty
          penalty += 0;
          matchCount++;
        } else if (prodRank < reqRank) {
          // Better than requested (lower rank number is better)
          penalty += (reqRank - prodRank) * 2; // Slight penalty but prioritizes it over worse products
          diffSum += (reqRank - prodRank);
        } else {
          // Worse than requested
          penalty += (prodRank - reqRank) * 10; // High penalty
          diffSum -= (prodRank - reqRank);
        }
      });

      let minPrice = 0;
      if (product.variants && product.variants.length > 0) {
        minPrice = Math.min(...product.variants.map(v => v.price));
      }

      return {
        product,
        penalty,
        matchCount,
        diffSum,
        minPrice
      };
    });

    // Filter out products with penalty >= 1000
    const validProducts = scoredProducts.filter(item => item.penalty < 1000);

    // Sort products by lowest penalty. If penalty is same, prioritize highest matchCount.
    validProducts.sort((a, b) => {
      if (a.penalty !== b.penalty) return a.penalty - b.penalty;
      return b.matchCount - a.matchCount; // tie-breaker: more exact matches
    });

    const exactMatches = validProducts
      .filter(item => item.penalty === 0)
      .map(item => ({ ...item.product.toObject(), _isExact: true }));

    const suggestionCandidates = validProducts.filter(item => item.penalty > 0);
    
    // Sort suggestions by price ASCENDING so we recommend the cheapest options first
    suggestionCandidates.sort((a, b) => a.minPrice - b.minPrice);

    // Lấy 3 sản phẩm tốt hơn và 3 sản phẩm kém hơn dựa trên giá rẻ nhất
    const betterSuggestions = suggestionCandidates.filter(item => item.diffSum > 0).slice(0, 3);
    const worseSuggestions = suggestionCandidates.filter(item => item.diffSum <= 0).slice(0, 3);

    const suggestions = [...betterSuggestions, ...worseSuggestions]
      .map(item => ({ 
        ...item.product.toObject(), 
        _isExact: false,
        _isBetter: item.diffSum > 0
      }));

    res.json({
      exactMatches,
      suggestions
    });
  } catch (error) {
    console.error("Smart Search Error:", error);
    res.status(500).json({ message: "Lỗi tìm kiếm thông minh" });
  }
};
