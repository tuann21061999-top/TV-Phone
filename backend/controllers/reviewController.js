const Review = require("../models/Review");
const Order = require("../models/Order"); // Bắt buộc import model Order

const reviewController = {
  // 1. KIỂM TRA ĐIỀU KIỆN ĐÁNH GIÁ (API MỚI)
  checkEligibility: async (req, res) => {
    try {
      const userId = req.user.id;
      const { productId } = req.params;

      // Tìm xem user có đơn hàng nào chứa productId này và đã giao thành công (done) chưa
      // LƯU Ý: Chữ "items._id" có thể khác tùy thuộc vào cách bạn lưu ID sản phẩm trong mảng items của Order (có thể là items.productId hoặc items.product)
      const hasPurchased = await Order.findOne({
        userId: userId,
        status: "done",
        "items._id": productId 
      });

      // Tìm xem user đã từng review sản phẩm này chưa
      const existingReview = await Review.findOne({ userId, productId });

      res.status(200).json({
        canReview: !!hasPurchased, // true nếu đã mua và nhận hàng
        existingReview: existingReview || null // Trả về review cũ nếu có
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi kiểm tra quyền đánh giá" });
    }
  },

  // 2. TẠO MỚI HOẶC CẬP NHẬT ĐÁNH GIÁ
  createOrUpdateReview: async (req, res) => {
    try {
      const { productId, rating, comment } = req.body;
      const userId = req.user.id;
      const username = req.user.name;

      // Bảo mật lớp 2: Kiểm tra lại xem đã mua hàng chưa (phòng hờ hacker gọi API trực tiếp)
      const hasPurchased = await Order.findOne({
        userId: userId,
        status: "done",
        "items._id": productId
      });

      if (!hasPurchased) {
        return res.status(403).json({ message: "Bạn phải mua và nhận hàng thành công mới được đánh giá!" });
      }

      // Tìm xem đã có đánh giá cũ chưa
      let review = await Review.findOne({ userId, productId });

      if (review) {
        // NẾU ĐÃ CÓ -> CẬP NHẬT LẠI
        review.rating = rating;
        review.comment = comment;
        review.status = "active"; // Chuyển thành active nếu admin từng ẩn
        await review.save();
        return res.status(200).json({ message: "Cập nhật đánh giá thành công!", review });
      } else {
        // NẾU CHƯA CÓ -> TẠO MỚI
        const newReview = new Review({ userId, productId, username, rating, comment });
        await newReview.save();
        return res.status(201).json({ message: "Cảm ơn bạn đã đánh giá!", review: newReview });
      }
    } catch (error) {
      res.status(500).json({ message: "Lỗi lưu đánh giá", error: error.message });
    }
  },

  // 3. Lấy danh sách đánh giá của sản phẩm (Giữ nguyên như cũ)
  getProductReviews: async (req, res) => {
    try {
      const reviews = await Review.find({ productId: req.params.productId, status: "active" })
                                  .sort({ createdAt: -1 });
      res.status(200).json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Lỗi lấy đánh giá", error });
    }
  },
  getAllReviewsAdmin: async (req, res) => {
    try {
      const reviews = await Review.find().populate("productId", "name image").sort({ createdAt: -1 });
      res.status(200).json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Lỗi lấy danh sách đánh giá", error });
    }
  },

  // 5. Hàm ẩn/hiện review (Có thể bạn đang thiếu hàm này)
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
  // Admin xóa đánh giá
  deleteReview: async (req, res) => {
    try {
      await Review.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Đã xóa đánh giá thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi xóa đánh giá", error });
    }
  },

  // Admin trả lời đánh giá
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