const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const orderController = {
  createOrder: async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Lấy dữ liệu chuẩn xác từ Frontend gửi lên
      const { 
        shippingInfo, 
        paymentMethod, 
        shippingFee = 0, 
        discountAmount = 0,
        warrantyFee = 0, 
        warrantyType,    
        items, 
        isBuyNow,
        isSimulatedPaymentSuccess 
      } = req.body;

      let orderItems = [];
      let itemsTotal = 0;

      // TRƯỜNG HỢP 1: Mua ngay
      if (isBuyNow && items && items.length > 0) {
        orderItems = items;
        itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      } 
      // TRƯỜNG HỢP 2: Thanh toán từ Giỏ hàng
      else {
        const cart = await Cart.findOne({ userId });
        if (!cart || cart.items.length === 0) {
          return res.status(400).json({ message: "Giỏ hàng trống" });
        }
        orderItems = cart.items;
        itemsTotal = cart.total;
      }

      // TÍNH TOÁN TỔNG TIỀN MỚI (Bỏ regionFee, methodFee)
      const finalTotal = itemsTotal + shippingFee + warrantyFee - discountAmount;

      // Xác định trạng thái ban đầu của đơn hàng
      let initialStatus = "waiting_approval";
      let isOrderPaid = false;
      let orderPaidAt = null;

      // Nếu thanh toán mô phỏng thành công
      if (isSimulatedPaymentSuccess) {
          initialStatus = "paid"; // Online đã trả tiền -> Chờ duyệt
          isOrderPaid = true;
          orderPaidAt = new Date();
      } else if (paymentMethod === "VNPAY" || paymentMethod === "MOMO") {
          // Luồng thật: Vừa bấm đặt hàng, đang mở mã QR -> pending
          initialStatus = "pending";
      }

      // Lưu đơn hàng
      const newOrder = new Order({
        userId,
        email: req.user.email,
        items: orderItems,
        total: finalTotal,
        shippingInfo,
        shippingFee,
        discountAmount,
        warrantyFee,
        warrantyType,
        paymentMethod,
        status: initialStatus,
        isPaid: isOrderPaid,
        paidAt: orderPaidAt
      });

      const savedOrder = await newOrder.save();

      // TRỪ KHO: Nếu COD hoặc thanh toán mô phỏng thành công
      if (paymentMethod === "COD" || isSimulatedPaymentSuccess) {
        for (const item of orderItems) {
          await Product.updateOne(
            { _id: item.productId, "variants._id": item.variantId },
            { $inc: { "variants.$.quantity": -item.quantity, totalSold: item.quantity } }
          );
        }
      }

      // Xóa Giỏ hàng nếu không phải là mua ngay
      if (!isBuyNow) {
        await Cart.findOneAndUpdate({ userId }, { items: [], total: 0 });
      }

      res.status(201).json({ message: "Đặt hàng thành công", order: savedOrder });
    } catch (error) {
      res.status(500).json({ message: "Lỗi tạo đơn hàng", error: error.message });
    }
  },

  getMyOrders: async (req, res) => {
    try {
      const userId = req.user.id;
      const orders = await Order.find({ userId }).sort({ createdAt: -1 });
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

  // Lấy tất cả đơn hàng cho Admin
  getAllOrdersAdmin: async (req, res) => {
    try {
      const orders = await Order.find().sort({ createdAt: -1 });
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },
  // ADMIN: Gửi thông báo yêu cầu khách nhận hàng
  notifyDelivery: async (req, res) => {
    try {
      const order = await Order.findByIdAndUpdate(
        req.params.id, 
        { isDeliveryConfirming: true }, 
        { new: true }
      );
      res.status(200).json({ message: "Đã gửi thông báo cho khách", order });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  // KHÁCH HÀNG: Trả lời thông báo (Nhận hoặc Từ chối)
  confirmDelivery: async (req, res) => {
    try {
      const { isAccepted } = req.body; // true = nhận, false = từ chối
      const newStatus = isAccepted ? "done" : "returned";
      
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status: newStatus, isDeliveryConfirming: false }, // Tắt cờ thông báo đi
        { new: true }
      );
      res.status(200).json({ message: "Đã xác nhận", order });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  // KHÁCH HÀNG: Lấy các đơn hàng đang chờ xác nhận nhận hàng
  getPendingConfirmations: async (req, res) => {
    try {
      // Tìm các đơn của user này đang ở trạng thái shipping và có cờ chờ xác nhận
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
  // Cập nhật trạng thái đơn hàng (Admin)
  updateOrderStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const order = await Order.findByIdAndUpdate(
        req.params.id, 
        { status: status }, 
        { new: true }
      );
      
      if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      res.status(200).json({ message: "Cập nhật thành công", order });
    } catch (error) {
      res.status(500).json({ message: "Lỗi cập nhật", error: error.message });
    }
  }
  
};


module.exports = orderController;