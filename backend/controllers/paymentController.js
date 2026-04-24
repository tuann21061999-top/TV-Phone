const Order = require("../models/Order");
const Product = require("../models/Product");
const { VNPay, ProductCode, VnpLocale, dateFormat } = require("vnpay");
const crypto = require("crypto");
const https = require("https");
const qs = require("qs");

const vnpay = new VNPay({
  tmnCode: "64DFOLZV",
  secureSecret: "O6J4Z89F24EL7WDPFXJEJBX47AGBLQVO",
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: true,
});

class PaymentController {
  // ==========================================
  // TẠO GIAO DỊCH (CREATE PAYMENT)
  // ==========================================
  async createPayment(req, res) {
    try {
      const { orderId, paymentMethod } = req.body;
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      }

      const amount = Math.round(order.total);

      // --- XỬ LÝ VNPAY ---
      if (paymentMethod === "VNPAY") {
        // Thêm timestamp để tránh trùng TxnRef khi user thanh toán lại
        const txnRef = `${order._id}_${Date.now()}`;
        const vnpUrl = vnpay.buildPaymentUrl({
          vnp_Amount: amount,
          vnp_IpAddr: req.headers["x-forwarded-for"] || req.connection.remoteAddress || "127.0.0.1",
          vnp_TxnRef: txnRef, 
          vnp_OrderInfo: `Thanh toan don hang ${order._id}`,
          vnp_OrderType: ProductCode.Other,
          // SỬ DỤNG BIẾN MÔI TRƯỜNG BACKEND
          vnp_ReturnUrl: `${process.env.BACKEND_URL}/api/payments/vnpay-callback`, 
          vnp_Locale: VnpLocale.VN,
          vnp_CreateDate: dateFormat(new Date()),
        });

        return res.status(200).json({ checkoutUrl: vnpUrl });
      }

      // --- XỬ LÝ MOMO ---
      if (paymentMethod === "MOMO") {
        const accessKey = "F8BBA842ECF85";
        const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
        const partnerCode = "MOMO";
        const amountStr = amount.toString();
        
        // SỬ DỤNG BIẾN MÔI TRƯỜNG BACKEND
        const redirectUrl = `${process.env.BACKEND_URL}/api/payments/momo-return`; 
        
        const ipnUrl = `https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b`; 
        
        const orderId_momo = partnerCode + new Date().getTime() + "_" + order._id.toString();
        const requestId = orderId_momo;
        const orderInfo = `Thanh toan đơn hàng V&T Nexis ${order._id}`;
        const requestType = "payWithMethod"; 
        const extraData = ""; 
        const orderGroupId = "";
        const autoCapture = true;
        const lang = "vi";

        const rawSignature = "accessKey=" + accessKey + "&amount=" + amountStr + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId_momo + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType;
        
        const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

        const requestBody = JSON.stringify({
          partnerCode: partnerCode,
          partnerName: "V&T Nexis",
          storeId: "MomoTestStore",
          requestId: requestId,
          amount: amountStr,
          orderId: orderId_momo,
          orderInfo: orderInfo,
          redirectUrl: redirectUrl,
          ipnUrl: ipnUrl,
          lang: lang,
          requestType: requestType,
          autoCapture: autoCapture,
          extraData: extraData,
          orderGroupId: orderGroupId,
          signature: signature
        });

        const options = {
          hostname: "test-payment.momo.vn",
          port: 443,
          path: "/v2/gateway/api/create",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(requestBody),
          },
        };

        const momoReq = https.request(options, (momoRes) => {
          let data = "";
          momoRes.on("data", (chunk) => (data += chunk));
          momoRes.on("end", () => {
            const result = JSON.parse(data);
            return res.status(200).json({ checkoutUrl: result.payUrl });
          });
        });

        momoReq.on("error", (e) => res.status(500).json({ message: e.message }));
        momoReq.write(requestBody);
        momoReq.end();
      }
    } catch (error) {
      console.error("Payment Error:", error);
      res.status(500).json({ message: "Lỗi xử lý thanh toán" });
    }
  }

  // ==========================================
  // XỬ LÝ CALLBACK VNPAY
  // ==========================================
  async vnpayCallback(req, res) {
    try {
      // Sử dụng verifyReturnUrl của thư viện vnpay thay vì verify thủ công
      const verify = vnpay.verifyReturnUrl(req.query);

      // Trích xuất orderId thực từ TxnRef (format: orderId_timestamp)
      const txnRef = verify.vnp_TxnRef || req.query['vnp_TxnRef'] || '';
      const orderId = txnRef.includes('_') ? txnRef.split('_')[0] : txnRef;

      if (!verify.isVerified) {
        console.error('VNPay signature verification failed');
        return res.redirect(`${process.env.FRONTEND_URL}/payment-result?status=invalid_signature`);
      }

      if (verify.isSuccess) {
        const order = await Order.findById(orderId);
        if (order && order.status === "pending") {
          order.status = "paid";
          order.isPaid = true;
          order.paidAt = new Date();
          await order.save();

          for (const item of order.items) {
            await Product.updateOne(
              { _id: item.productId, "variants._id": item.variantId },
              { $inc: { "variants.$.quantity": -item.quantity, totalSold: item.quantity } }
            );
          }
        }
        // SỬ DỤNG BIẾN MÔI TRƯỜNG FRONTEND
        return res.redirect(`${process.env.FRONTEND_URL}/payment-result?status=success&orderId=${orderId}`);
      } else {
        await Order.findByIdAndUpdate(orderId, { status: "unsuccessful" });
        return res.redirect(`${process.env.FRONTEND_URL}/payment-result?status=error`);
      }
    } catch (error) {
      console.error('VNPay callback error:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/payment-result?status=error`);
    }
  }

  // ==========================================
  // XỬ LÝ CALLBACK MOMO (IPN)
  // ==========================================
  async momoCallback(req, res) {
    try {
      const { partnerCode, orderId, requestId, amount, orderInfo, orderType, transId, resultCode, message, payType, responseTime, extraData, signature } = req.body;
      
      const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
      const accessKey = "F8BBA842ECF85";

      const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
      const expectedSignature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

      if (signature !== expectedSignature) {
        return res.status(400).json({ message: "Invalid signature from MoMo" });
      }

      const orderIdParts = orderId.split("_");
      const realOrderId = orderIdParts.length > 1 ? orderIdParts[1] : orderIdParts[0]; 
      const order = await Order.findById(realOrderId);

      if (resultCode == 0) { 
        if (order && order.status === "pending") {
          order.status = "paid";
          order.isPaid = true;
          order.paidAt = new Date();
          await order.save();

          for (const item of order.items) {
            await Product.updateOne(
              { _id: item.productId, "variants._id": item.variantId },
              { $inc: { "variants.$.quantity": -item.quantity, totalSold: item.quantity } }
            );
          }
        }
        return res.status(204).send(); 
      } else {
        await Order.findByIdAndUpdate(realOrderId, { status: "unsuccessful" });
        return res.status(204).send();
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  // ==========================================
  // XỬ LÝ RETURN (REDIRECT MÀN HÌNH TỪ MOMO)
  // ==========================================
  async momoReturn(req, res) {
    try {
      const { partnerCode, orderId, requestId, amount, orderInfo, orderType, transId, resultCode, message, payType, responseTime, extraData, signature } = req.query;
      
      const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
      const accessKey = "F8BBA842ECF85";

      const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
      const expectedSignature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

      if (signature !== expectedSignature && req.hostname !== 'localhost' && req.hostname !== '127.0.0.1') {
        // SỬ DỤNG BIẾN MÔI TRƯỜNG FRONTEND
        return res.redirect(`${process.env.FRONTEND_URL}/payment-result?status=invalid_signature`);
      }

      const orderIdParts = orderId ? orderId.split("_") : [];
      if (orderIdParts.length === 0) return res.redirect(`${process.env.FRONTEND_URL}/payment-result?status=error`);
      
      const realOrderId = orderIdParts.length > 1 ? orderIdParts[1] : orderIdParts[0];
      const order = await Order.findById(realOrderId);

      if (resultCode == 0) { 
        if (order && order.status === "pending") {
          order.status = "paid";
          order.isPaid = true;
          order.paidAt = new Date();
          await order.save();

          for (const item of order.items) {
            await Product.updateOne(
              { _id: item.productId, "variants._id": item.variantId },
              { $inc: { "variants.$.quantity": -item.quantity, totalSold: item.quantity } }
            );
          }
        }
        return res.redirect(`${process.env.FRONTEND_URL}/payment-result?status=success&orderId=${realOrderId}`);
      } else {
        if(order && order.status === "pending") {
            await Order.findByIdAndUpdate(realOrderId, { status: "unsuccessful" });
        }
        return res.redirect(`${process.env.FRONTEND_URL}/payment-result?status=error`);
      }
    } catch (error) {
      console.error(error);
      return res.redirect(`${process.env.FRONTEND_URL}/payment-result?status=error`);
    }
  }
}

module.exports = new PaymentController();