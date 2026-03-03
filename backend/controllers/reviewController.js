const Review = require("../models/Review");
const Order = require("../models/Order");

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
      res.status(200).json({ message: "Cập nhật thành công", review });
    } catch (error) {
      res.status(500).json({ message: "Lỗi cập nhật", error });
    }
  },

  // 6. Admin xóa đánh giá
  deleteReview: async (req, res) => {
    try {
      await Review.findByIdAndDelete(req.params.id);
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
        { new: true }
      );
      res.status(200).json({ message: "Đã trả lời đánh giá", review });
    } catch (error) {
      res.status(500).json({ message: "Lỗi gửi câu trả lời", error });
    }
  }
};

module.exports = reviewController;