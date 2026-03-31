const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Voucher = require("../models/Voucher");
const PromotionModel = require("../models/Promotion");
const Notification = require("../models/Notification");
const { validateVoucher, calculateDiscount } = require("./voucherController");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// Hàm bổ trợ cập nhật kho báu
const updateInventory = async (items, type) => {
  // type: "decrease" (giảm kho khi bán) hoặc "increase" (tăng kho khi trả hàng/hủy)
  const multiplier = type === "decrease" ? -1 : 1;
  const soldMultiplier = type === "decrease" ? 1 : -1;

  for (const item of items) {
    await Product.updateOne(
      { _id: item.productId, "variants._id": item.variantId },
      {
        $inc: {
          "variants.$.quantity": multiplier * item.quantity,
          totalSold: soldMultiplier * item.quantity
        }
      }
    );

    await PromotionModel.updateOne(
      { productId: item.productId, isActive: true },
      { $inc: { soldQuantity: soldMultiplier * item.quantity } }
    );
  }
};

const orderController = {
  createOrder: async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        shippingInfo, paymentMethod, shippingFee = 0,
        discountAmount = 0, warrantyFee = 0, warrantyType,
        items, isBuyNow, isSimulatedPaymentSuccess,
        voucherCode
      } = req.body;

      let orderItems = [];
      let itemsTotal = 0;

      if (isBuyNow && items && items.length > 0) {
        // Lấy importPrice và giá (đã có khuyến mãi) thực tế từ DB để bảo mật
        for (const item of items) {
          const product = await Product.findById(item.productId);
          const variant = product ? product.variants.id(item.variantId) : null;

          let activePrice = item.price; // fallback fallback
          let variantImportPrice = 0;

          if (variant) {
            activePrice = (variant.discountPrice != null && variant.promotionEnd && variant.promotionEnd > new Date())
              ? variant.discountPrice
              : variant.price;
            variantImportPrice = variant.importPrice || 0;
          }

          orderItems.push({
            ...item,
            price: activePrice, // Ghi đè lại giá để bảo mật
            importPrice: variantImportPrice
          });
          itemsTotal += activePrice * item.quantity;
        }
      } else {
        const cart = await Cart.findOne({ userId });
        if (!cart || cart.items.length === 0) return res.status(400).json({ message: "Giỏ hàng trống" });

        // Cần map importPrice lại từ DB cho các item trong giỏ hàng để tránh importPrice = 0
        for (const item of cart.items) {
          const product = await Product.findById(item.productId);
          const variant = product ? product.variants.id(item.variantId) : null;
          let variantImportPrice = variant ? (variant.importPrice || 0) : 0;

          orderItems.push({
            ...item.toObject(),
            importPrice: variantImportPrice
          });
        }
        itemsTotal = cart.total;
      }

      // ── Validate voucher server-side nếu có ─────────────
      let validatedDiscount = discountAmount;
      let appliedVoucherCode = null;

      if (voucherCode) {
        const voucher = await Voucher.findOne({ code: voucherCode.toUpperCase() });
        if (!voucher) {
          return res.status(400).json({ message: "Mã giảm giá không tồn tại!" });
        }

        const validation = validateVoucher(voucher, userId, itemsTotal);
        if (!validation.valid) {
          return res.status(400).json({ message: validation.message });
        }

        // Tính lại discount server-side (không tin tưởng frontend)
        validatedDiscount = calculateDiscount(voucher, itemsTotal);
        appliedVoucherCode = voucher.code;
      }

      const finalTotal = itemsTotal + shippingFee + warrantyFee - validatedDiscount;

      let initialStatus = "waiting_approval";
      let isOrderPaid = false;
      let orderPaidAt = null;

      if (isSimulatedPaymentSuccess) {
        initialStatus = "paid";
        isOrderPaid = true;
        orderPaidAt = new Date();
      } else if (paymentMethod === "VNPAY" || paymentMethod === "MOMO") {
        initialStatus = "pending";
      }

      const newOrder = new Order({
        userId, email: req.user.email, items: orderItems,
        total: finalTotal, shippingInfo, shippingFee,
        discountAmount: validatedDiscount, warrantyFee, warrantyType,
        paymentMethod, status: initialStatus,
        isPaid: isOrderPaid, paidAt: orderPaidAt,
        voucherCode: appliedVoucherCode
      });

      const savedOrder = await newOrder.save();

      // ── Cập nhật voucher usage sau khi đơn hàng được tạo thành công ──
      if (appliedVoucherCode) {
        await Voucher.findOneAndUpdate(
          { code: appliedVoucherCode },
          { $inc: { usedCount: 1 }, $addToSet: { usedBy: userId } }
        );
      }

      // Giảm kho ngay khi đặt COD hoặc thanh toán online thành công (giữ hàng)
      if (paymentMethod === "COD" || isSimulatedPaymentSuccess) {
        await updateInventory(orderItems, "decrease");
      }

      if (!isBuyNow) await Cart.findOneAndUpdate({ userId }, { items: [], total: 0 });

      res.status(201).json({ message: "Đặt hàng thành công", order: savedOrder });
    } catch (error) {
      res.status(500).json({ message: "Lỗi tạo đơn hàng", error: error.message });
    }
  },

  updateOrderStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

      const oldStatus = order.status;

      // Logic hoàn kho nếu Hủy đơn
      if (status === "cancelled" && oldStatus !== "cancelled" && oldStatus !== "returned") {
        await updateInventory(order.items, "increase");
      }

      order.status = status;
      await order.save();

      // Emit Notification
      const statusMap = {
        pending: "Chờ lấy hàng",
        shipping: "Đang giao hàng",
        done: "Giao thành công",
        cancelled: "Đã bị hủy",
        returned: "Đã hoàn trả"
      };
      
      const viStatus = statusMap[status] || status;
      await Notification.create({
        userId: order.userId,
        title: "Cập nhật đơn hàng",
        message: `Đơn hàng #${order._id.toString().substring(0, 6).toUpperCase()} của bạn đã chuyển trạng thái: ${viStatus}.`,
        type: "order",
        link: `/order/${order._id}`
      });

      res.status(200).json({ message: "Cập nhật thành công", order });
    } catch (error) {
      res.status(500).json({ message: "Lỗi cập nhật", error: error.message });
    }
  },

  // Khách hàng tự hủy đơn
  cancelOrder: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

      // Bảo mật: Đơn hàng phải thuộc về user đang đăng nhập
      if (order.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Bạn không có quyền thực hiện việc này" });
      }

      // Chỉ được thao tác Hủy khi hàng chưa giao / đóng gói
      const canCancel = ["waiting_approval", "pending", "paid"].includes(order.status);
      if (!canCancel) {
        return res.status(400).json({ message: "Không thể hủy khi đơn hàng đang được xử lý hoặc giao hàng." });
      }

      const oldStatus = order.status;
      order.status = "cancelled";
      
      // Nếu trạng thái trước đó chưa bị trừ kho thì tùy thuộc logic của bạn. 
      // Nhưng theo logic createOrder của bạn, khi "waiting_approval" (COD) hoặc "paid" thì kho đã bị trừ.
      // Dù trạng thái cũ là gì, miễn là nó chưa phải "cancelled" hoặc "returned" thì ta cứ hoàn kho:
      if (oldStatus !== "cancelled" && oldStatus !== "returned") {
        await updateInventory(order.items, "increase");
      }

      await order.save();
      res.status(200).json({ message: "Hủy đơn hàng thành công", order });
    } catch (error) {
      res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
  },

  confirmDelivery: async (req, res) => {
    try {
      const { isAccepted } = req.body;
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

      if (isAccepted) {
        order.status = "done";
      } else {
        // Khách từ chối nhận hàng -> Hoàn kho
        order.status = "returned";
        await updateInventory(order.items, "increase");
      }

      order.isDeliveryConfirming = false;
      await order.save();
      res.status(200).json({ message: "Xác nhận thành công", order });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  // THAY THẾ HÀM getAdminStats CŨ BẰNG HÀM NÀY
  getAdminStats: async (req, res) => {
    try {
      const User = require("../models/User"); // Import thêm User model để đếm

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      // 1. TỔNG QUAN (Doanh thu, Lợi nhuận, Đơn hàng, Thành viên)
      const allDoneOrders = await Order.find({ status: "done" });
      let totalRevenue = 0;
      let totalImportCost = 0;

      allDoneOrders.forEach(order => {
        totalRevenue += (order.total - (order.shippingFee || 0));
        order.items.forEach(item => {
          totalImportCost += (item.importPrice || 0) * item.quantity;
        });
      });

      const totalProfit = totalRevenue - totalImportCost;
      const totalUsers = await User.countDocuments({ role: "user" });
      const newOrdersCount = await Order.countDocuments({
        createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) } // Đơn mới trong tháng
      });

      // 2. DỮ LIỆU BIỂU ĐỒ (6 tháng gần nhất)
      const chartData = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = d.getMonth() + 1;
        const year = d.getFullYear();

        const monthlyOrders = await Order.find({
          status: "done",
          createdAt: {
            $gte: new Date(year, month - 1, 1),
            $lt: new Date(year, month, 1)
          }
        });

        const monthRev = monthlyOrders.reduce((sum, o) => sum + (o.total - (o.shippingFee || 0)), 0);
        chartData.push({ name: `THG ${month}`, revenue: monthRev });
      }

      // 3. SẢN PHẨM BÁN CHẠY (Dùng MongoDB Aggregation)
      const topProducts = await Order.aggregate([
        { $match: { status: "done" } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            name: { $first: "$items.name" },
            image: { $first: "$items.image" },
            sales: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
          }
        },
        { $sort: { sales: -1 } },
        { $limit: 4 } // Lấy top 4
      ]);

      // 4. THỐNG KÊ GÓI BẢO HÀNH ĐÃ BÁN
      const warrantyStats = await Order.aggregate([
        { $match: { status: "done", warrantyType: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: "$warrantyType",
            count: { $sum: 1 },
            revenue: { $sum: "$warrantyFee" }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // 5. ĐƠN HÀNG MỚI NHẤT LÊN BẢNG (5 đơn)
      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("_id shippingInfo items createdAt total status paymentMethod");

      res.status(200).json({
        overview: { totalRevenue, totalProfit, totalOrders: newOrdersCount, totalUsers },
        chartData,
        topProducts,
        warrantyStats,
        recentOrders
      });

    } catch (error) {
      console.error("Lỗi Dashboard API:", error);
      res.status(500).json({ message: "Lỗi tính toán thống kê", error: error.message });
    }
  },

  getMyOrders: async (req, res) => {
    try {
      const userId = req.user.id;
      const orders = await Order.find({ userId }).sort({ createdAt: -1 }).populate("items.productId", "slug");
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy lịch sử đơn hàng", error: error.message });
    }
  },

  getOrderDetail: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

      if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Bạn không có quyền xem đơn hàng này" });
      }

      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  getAllOrdersAdmin: async (req, res) => {
    try {
      const orders = await Order.find().sort({ createdAt: -1 });
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  notifyDelivery: async (req, res) => {
    try {
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { isDeliveryConfirming: true },
        { returnDocument: 'after' }
      );
      res.status(200).json({ message: "Đã gửi thông báo cho khách", order });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  getPendingConfirmations: async (req, res) => {
    try {
      const orders = await Order.find({
        userId: req.user.id,
        status: "shipping",
        isDeliveryConfirming: true
      });
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server" });
    }
  },

  markOrderAsPaid: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ message: "Không tìm thấy" });

      order.status = "paid";
      order.isPaid = true;
      order.paidAt = new Date();
      await order.save();

      // Sau khi thanh toán online thật thành công -> Trừ kho
      await updateInventory(order.items, "decrease");

      res.status(200).json({ message: "Thành công", order });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  requestReturn: async (req, res) => {
    try {
      const orderId = req.params.id;
      const { reason } = req.body;
      const order = await Order.findById(orderId);

      if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      if (order.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Không có quyền thực hiện" });
      }
      if (order.status !== "done") {
        return res.status(400).json({ message: "Chỉ đơn hàng đã giao thành công mới được yêu cầu trả" });
      }

      if (order.returnRequest && order.returnRequest.isRequested) {
        return res.status(400).json({ message: "Yêu cầu trả hàng đã được gửi trước đó" });
      }

      let uploadedImages = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const result = await cloudinary.uploader.upload(file.path, { folder: "returns" });
          uploadedImages.push(result.secure_url);
          fs.unlinkSync(file.path);
        }
      }

      if (uploadedImages.length === 0) {
        return res.status(400).json({ message: "Vui lòng đính kèm hình ảnh minh chứng" });
      }

      order.returnRequest = {
        isRequested: true,
        reason: reason || "Không có lý do",
        images: uploadedImages,
        status: "pending",
        requestedAt: new Date()
      };

      await order.save();
      res.status(200).json({ message: "Yêu cầu hoàn trả đã được gửi thành công", order });
    } catch (error) {
      if (req.files) {
         req.files.forEach(f => {
           if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
         });
      }
      res.status(500).json({ message: "Lỗi tạo yêu cầu hoàn trả", error: error.message });
    }
  },

  handleReturnAction: async (req, res) => {
    try {
      const orderId = req.params.id;
      const { action, rejectReason } = req.body; // action: 'approve' or 'reject'

      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

      if (!order.returnRequest || !order.returnRequest.isRequested) {
        return res.status(400).json({ message: "Đơn hàng này chưa có yêu cầu hoàn trả nào" });
      }
      
      if (order.returnRequest.status !== "pending") {
        return res.status(400).json({ message: "Yêu cầu hoàn trả đã được xử lý" });
      }

      if (action === "approve") {
        order.returnRequest.status = "approved";
        order.status = "returned";
        
        // Hoàn kho
        await updateInventory(order.items, "increase");

        // Gui thong bao
        await Notification.create({
          userId: order.userId,
          title: "Hoàn trả đơn hàng được chấp nhận",
          message: `Yêu cầu trả hàng cho đơn #${order._id.toString().substring(0, 6).toUpperCase()} đã được duyệt và chuyển sang trạng thái chờ thu hồi hàng.`,
          type: "order",
          link: `/order/${order._id}`
        });

      } else if (action === "reject") {
        order.returnRequest.status = "rejected";
        if (rejectReason) {
            order.returnRequest.rejectedReason = rejectReason;
        }

        // Gui thong bao
        await Notification.create({
          userId: order.userId,
          title: "Yêu cầu trả hàng bị từ chối",
          message: `Yêu cầu trả hàng cho đơn #${order._id.toString().substring(0, 6).toUpperCase()} không được chấp nhận. Lý do: ${rejectReason || "Không hợp lệ"}.`,
          type: "order",
          link: `/order/${order._id}`
        });
      } else {
        return res.status(400).json({ message: "Hành động không hợp lệ" });
      }

      await order.save();
      res.status(200).json({ message: "Xử lý yêu cầu trả hàng thành công", order });
    } catch (error) {
       res.status(500).json({ message: "Lỗi xử lý yêu cầu", error: error.message });
    }
  }
};

module.exports = orderController;