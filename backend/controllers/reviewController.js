const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");
const mongoose = require("mongoose");

const updateProductReviewStats = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId), status: "active" } },
    {
      $group: {
        _id: "$productId",
        averageRating: { $avg: "$rating" },
        reviewsCount: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      reviewsCount: stats[0].reviewsCount
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      averageRating: 0,
      reviewsCount: 0
    });
  }
};

const reviewController = {
  // 1. KIỂM TRA ĐIỀU KIỆN ĐÁNH GIÁ (API MỚI)
  checkEligibility: async (req, res) => {
    try {
      const userId = req.user.id;
      const { productId } = req.params;

      const hasPurchased = await Order.findOne({
        userId: userId,
        status: "done",
        $or: [
          { "items._id": productId },
          { "items.productId": productId },
          { "items.product": productId }
        ]
      });

      const existingReview = await Review.findOne({ userId, productId });

      res.status(200).json({
        canReview: !!hasPurchased,
        existingReview: existingReview || null
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi kiểm tra quyền đánh giá" });
    }
  },

  // 2. TẠO MỚI HOẶC CẬP NHẬT ĐÁNH GIÁ (ĐÃ THÊM LOGIC XỬ LÝ ẢNH)
  createOrUpdateReview: async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;
    const username = req.user.name;

    // Kiểm tra quyền mua hàng
    const hasPurchased = await Order.findOne({
      userId: userId,
      status: "done",
      $or: [
        { "items._id": productId },
        { "items.productId": productId },
        { "items.product": productId }
      ]
    });

    if (!hasPurchased) {
      return res.status(403).json({ message: "Bạn phải mua và nhận hàng thành công mới được đánh giá!" });
    }

    let review = await Review.findOne({ userId, productId });

    if (review) {
      // CẬP NHẬT ĐÁNH GIÁ CŨ
      review.rating = rating;
      review.comment = comment;
      review.status = "active"; 
      await review.save();
      await updateProductReviewStats(productId);
      return res.status(200).json({ message: "Cập nhật đánh giá thành công!", review });
    } else {
      // TẠO ĐÁNH GIÁ MỚI
      const newReview = new Review({ 
        userId, 
        productId, 
        username, 
        rating, 
        comment,
        images: [] // Để mảng trống vì không up ảnh nữa
      });
      await newReview.save();
      await updateProductReviewStats(productId);
      return res.status(201).json({ message: "Cảm ơn bạn đã đánh giá!", review: newReview });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi lưu đánh giá", error: error.message });
  }
},

  // 3. Lấy danh sách đánh giá cho Khách hàng
  getProductReviews: async (req, res) => {
    try {
      const reviews = await Review.find({ productId: req.params.productId, status: "active" })
                                  .sort({ createdAt: -1 });
      res.status(200).json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Lỗi lấy đánh giá", error });
    }
  },

  // 4. Lấy danh sách đánh giá cho Admin
  getAllReviewsAdmin: async (req, res) => {
    try {
      const reviews = await Review.find().populate("productId", "name image").sort({ createdAt: -1 });
      res.status(200).json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Lỗi lấy danh sách đánh giá", error });
    }
  },

  // 5. Ẩn/hiện review
  toggleReviewStatus: async (req, res) => {
    try {
      const review = await Review.findById(req.params.id);
      review.status = review.status === "active" ? "hidden" : "active";
      await review.save();
      await updateProductReviewStats(review.productId);
      res.status(200).json({ message: "Cập nhật thành công", review });
    } catch (error) {
      res.status(500).json({ message: "Lỗi cập nhật", error });
    }
  },

  // 6. Admin xóa đánh giá
  deleteReview: async (req, res) => {
    try {
      const review = await Review.findById(req.params.id);
      if (!review) return res.status(404).json({ message: "Không tìm thấy đánh giá" });
      const productId = review.productId;
      await Review.findByIdAndDelete(req.params.id);
      await updateProductReviewStats(productId);
      res.status(200).json({ message: "Đã xóa đánh giá thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi xóa đánh giá", error });
    }
  },

  // 7. Admin trả lời đánh giá
  replyReview: async (req, res) => {
    try {
      const { reply } = req.body;
      const review = await Review.findByIdAndUpdate(
        req.params.id,
        { 
          adminReply: reply, 
          adminReplyDate: new Date() 
        },
        { returnDocument: 'after' }
      );
      res.status(200).json({ message: "Đã trả lời đánh giá", review });
    } catch (error) {
      res.status(500).json({ message: "Lỗi gửi câu trả lời", error });
    }
  },

  // 8. ADMIN: Đồng bộ lại averageRating & reviewsCount cho TOÀN BỘ sản phẩm
  //    Dùng khi dữ liệu bị lệch (có sao nhưng reviewsCount = 0)
  // PUBLIC: Lấy top reviews cho trang chủ (không cần đăng nhập)
  getTopReviews: async (req, res) => {
    try {
      const reviews = await Review.find({ status: "active", rating: { $gte: 4 } })
        .sort({ rating: -1, createdAt: -1 })
        .limit(8)
        .populate("productId", "name slug colorImages images");

      const result = reviews
        .filter(r => r.comment && r.comment.length > 15 && r.productId)
        .map(r => ({
          _id: r._id,
          username: r.username,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          productName: r.productId?.name || "Sản phẩm",
          productSlug: r.productId?.slug || "",
          productImage: r.productId?.colorImages?.[0]?.imageUrl || r.productId?.images?.[0] || "/no-image.png",
        }));

      res.status(200).json(result);
    } catch (error) {
      console.error("Lỗi lấy top reviews:", error);
      res.status(500).json({ message: "Lỗi lấy đánh giá nổi bật", error: error.message });
    }
  },

  syncAllReviewStats: async (req, res) => {
    try {
      const allProducts = await Product.find({}).select("_id name averageRating reviewsCount");
      let fixedCount = 0;
      const mismatchList = [];

      for (const product of allProducts) {
        const stats = await Review.aggregate([
          { $match: { productId: product._id, status: "active" } },
          {
            $group: {
              _id: "$productId",
              averageRating: { $avg: "$rating" },
              reviewsCount: { $sum: 1 }
            }
          }
        ]);

        const correctAvg = stats.length > 0 ? Math.round(stats[0].averageRating * 10) / 10 : 0;
        const correctCount = stats.length > 0 ? stats[0].reviewsCount : 0;
        const currentAvg = product.averageRating || 0;
        const currentCount = product.reviewsCount || 0;

        if (currentAvg !== correctAvg || currentCount !== correctCount) {
          mismatchList.push({
            name: product.name,
            old: { averageRating: currentAvg, reviewsCount: currentCount },
            fixed: { averageRating: correctAvg, reviewsCount: correctCount }
          });

          await Product.findByIdAndUpdate(product._id, {
            averageRating: correctAvg,
            reviewsCount: correctCount
          });
          fixedCount++;
        }
      }

      res.status(200).json({
        message: `Đồng bộ hoàn tất. Đã sửa ${fixedCount}/${allProducts.length} sản phẩm.`,
        fixedCount,
        totalProducts: allProducts.length,
        details: mismatchList
      });
    } catch (error) {
      console.error("Lỗi sync review stats:", error);
      res.status(500).json({ message: "Lỗi đồng bộ", error: error.message });
    }
  }
};

module.exports = reviewController;