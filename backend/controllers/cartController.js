const Cart = require("../models/Cart");
const Product = require("../models/Product");

const cartController = {
  // 1. Lấy giỏ hàng của người dùng
  getCart: async (req, res) => {
    try {
      const userId = req.user.id; // Lấy từ Middleware Auth (JWT)
      let cart = await Cart.findOne({ userId });

      if (!cart) {
        // Nếu chưa có giỏ hàng, tạo mới một giỏ trống
        cart = await Cart.create({ userId, items: [], total: 0 });
      }

      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy giỏ hàng", error: error.message });
    }
  },

  // 2. Thêm sản phẩm vào giỏ hàng
  addToCart: async (req, res) => {
    try {
      const userId = req.user.id;
      const { 
        productId, 
        variantId, 
        quantity, 
        condition, 
        conditionLevel 
      } = req.body;

      // Tìm sản phẩm trong DB để lấy thông tin chính xác (giá, tên, ảnh)
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

      // Tìm Variant cụ thể
      const variant = product.variants.id(variantId);
      if (!variant) return res.status(404).json({ message: "Phiên bản không tồn tại" });

      // Kiểm tra kho hàng
      if (variant.quantity < (quantity || 1)) {
        return res.status(400).json({ message: "Số lượng trong kho không đủ" });
      }

      // Lấy ảnh tương ứng với màu sắc của variant
      const colorData = product.colorImages.find(c => c.colorName === variant.colorName);
      const image = colorData ? colorData.imageUrl : product.colorImages[0].imageUrl;

      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({ userId, items: [] });
      }

      // Kiểm tra xem item này đã có trong giỏ chưa (cùng variant và cùng condition)
      const itemIndex = cart.items.findIndex(
        (item) => 
          item.variantId.toString() === variantId && 
          item.condition === (condition || "new") &&
          item.conditionLevel === conditionLevel
      );

      if (itemIndex > -1) {
        // Nếu đã có, tăng số lượng
        cart.items[itemIndex].quantity += (quantity || 1);
      } else {
        // Nếu chưa có, thêm mới item vào mảng
        cart.items.push({
          productId,
          variantId,
          sku: variant.sku,
          name: product.name,
          image: image,
          color: variant.colorName,
          storage: variant.storage,
          condition: condition || "new",
          conditionLevel: conditionLevel || null,
          price: variant.price,
          quantity: quantity || 1
        });
      }

      // Lưu giỏ hàng (Middleware .pre("save") trong Schema sẽ tự tính lại total)
      await cart.save();
      res.status(200).json(cart);
    } catch (error) {
  console.error("ADD TO CART ERROR >>>", error);
  res.status(500).json({ 
    message: "Lỗi khi thêm vào giỏ", 
    error: error.message 
  });
}
  },

  // 3. Cập nhật số lượng (Tăng/Giảm)
  updateQuantity: async (req, res) => {
    try {
      const userId = req.user.id;
      const { itemId, quantity } = req.body; // itemId là _id của phần tử trong mảng items

      if (quantity < 1) return res.status(400).json({ message: "Số lượng tối thiểu là 1" });

      const cart = await Cart.findOne({ userId });
      if (!cart) return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

      const item = cart.items.id(itemId);
      if (!item) return res.status(404).json({ message: "Không tìm thấy sản phẩm trong giỏ" });

      // Logic kiểm tra kho hàng (Optional: Bạn có thể fetch lại Product để check tồn kho thực tế)
      item.quantity = quantity;

      await cart.save();
      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({ message: "Lỗi cập nhật số lượng", error: error.message });
    }
  },

  // 4. Xóa một sản phẩm khỏi giỏ
  removeItem: async (req, res) => {
    try {
      const userId = req.user.id;
      const { itemId } = req.params;

      const cart = await Cart.findOne({ userId });
      if (!cart) return res.status(404).json({ message: "Giỏ hàng không tồn tại" });

      // Sử dụng filter hoặc pull để xóa
      cart.items = cart.items.filter(item => item._id.toString() !== itemId);

      await cart.save();
      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi xóa sản phẩm", error: error.message });
    }
  },

  // 5. Làm trống giỏ hàng (Sau khi thanh toán xong)
  clearCart: async (req, res) => {
    try {
      const userId = req.user.id;
      const cart = await Cart.findOne({ userId });
      
      if (cart) {
        cart.items = [];
        cart.total = 0;
        await cart.save();
      }
      
      res.status(200).json({ message: "Đã làm trống giỏ hàng" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi dọn giỏ hàng", error: error.message });
    }
  }
};

module.exports = cartController;