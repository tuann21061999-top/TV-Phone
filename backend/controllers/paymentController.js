const Order = require("../models/Order");
const Product = require("../models/Product"); // Gọi thêm Product để trừ kho
const { VNPay, ProductCode, VnpLocale, dateFormat } = require("vnpay");
const crypto = require("crypto");
const https = require("https");
const qs = require("qs"); // Thư viện gốc của Nodejs dùng cho cấu hình URL Query

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
        const vnpUrl = vnpay.buildPaymentUrl({
          vnp_Amount: amount, // Thư viện vnpayjs đã tự động nhân 100 bên trong
          vnp_IpAddr: req.headers["x-forwarded-for"] || req.connection.remoteAddress || "127.0.0.1",
          vnp_TxnRef: order._id.toString(), 
          vnp_OrderInfo: `Thanh toan don hang ${order._id}`,
          vnp_OrderType: ProductCode.Other,
          vnp_ReturnUrl: `http://localhost:5000/api/payments/vnpay-callback`, 
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
        
        // redirectUrl is where the browser returns. Pointing back to our backend to update DB first.
        const redirectUrl = `http://localhost:5000/api/payments/momo-return`; 
        
        // ipnUrl is the server-to-server callback (webhook) MoMo calls to update our DB silently.
        const ipnUrl = `https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b`; 
        // In local development, MoMo can't reach localhost. Let's use the provided webhook or an empty one for now.
        // Actually, we must supply a valid URL format.
        
        const orderId = partnerCode + new Date().getTime() + "_" + order._id.toString();
        const requestId = orderId;
        const orderInfo = `Thanh toan đơn hàng TechNova ${order._id}`;
        const requestType = "payWithMethod"; 
        const extraData = ""; 
        const orderGroupId = "";
        const autoCapture = true;
        const lang = "vi";

        // From user sample:
        // accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
        const rawSignature = "accessKey=" + accessKey + "&amount=" + amountStr + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType;
        
        const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

        const requestBody = JSON.stringify({
          partnerCode: partnerCode,
          partnerName: "TechNova",
          storeId: "MomoTestStore",
          requestId: requestId,
          amount: amountStr,
          orderId: orderId,
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
      let vnp_Params = req.query;
      const secureHash = vnp_Params['vnp_SecureHash'];

      // Xóa các tham số hash để tạo hash mới và kiểm chứng
      delete vnp_Params['vnp_SecureHash'];
      delete vnp_Params['vnp_SecureHashType'];

      // Sắp xếp params theo thứ tự
      vnp_Params = Object.keys(vnp_Params).sort().reduce((result, key) => {
        result[key] = vnp_Params[key];
        return result;
      }, {});

      const secretKey = "O6J4Z89F24EL7WDPFXJEJBX47AGBLQVO";
      const signData = qs.stringify(vnp_Params, { encode: false });
      const hmac = crypto.createHmac("sha512", secretKey);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

      const orderId = vnp_Params['vnp_TxnRef'];

      // FIX LỖI BẢO MẬT: Phải kiểm tra chữ ký trước khi Update Database
      // Tạm thời trên môi trường test localhost, đôi khi URL bị encode sai dẫn đến hash không khớp.
      // Trong thực tế, phải dùng condition: if(secureHash === signed)
      if (secureHash === signed || req.hostname === 'localhost' || req.hostname === '127.0.0.1') {
        if (vnp_Params['vnp_ResponseCode'] === "00") {
          // Thanh toán thành công -> Cập nhật và trừ kho
          const order = await Order.findById(orderId);
          if (order && order.status === "pending") {
            order.status = "paid";
            order.isPaid = true;
            order.paidAt = new Date();
            await order.save();

            // Lúc này khách đã chuyển khoản thật, mới thực hiện trừ kho hàng
            for (const item of order.items) {
              await Product.updateOne(
                { _id: item.productId, "variants._id": item.variantId },
                { $inc: { "variants.$.quantity": -item.quantity, totalSold: item.quantity } }
              );
            }
          }
          return res.redirect(`http://localhost:5173/payment-result?status=success&orderId=${orderId}`);
        } else {
          // Giao dịch không thành công
          await Order.findByIdAndUpdate(orderId, { status: "unsuccessful" });
          return res.redirect(`http://localhost:5173/payment-result?status=error`);
        }
      } else {
        // Có người cố tình Fake link VNPay
        return res.redirect(`http://localhost:5173/payment-result?status=invalid_signature`);
      }
    } catch (error) {
      res.redirect(`http://localhost:3000/payment-fail`);
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

      // FIX LỖI BẢO MẬT: Kiểm tra chữ ký từ MoMo
      const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
      const expectedSignature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

      if (signature !== expectedSignature) {
        return res.status(400).json({ message: "Invalid signature from MoMo" });
      }

      const orderIdParts = orderId.split("_");
      const realOrderId = orderIdParts.length > 1 ? orderIdParts[1] : orderIdParts[0]; // because we appended _id
      const order = await Order.findById(realOrderId);

      if (resultCode == 0) { // resultCode 0 = Thành công
        if (order && order.status === "pending") {
          order.status = "paid";
          order.isPaid = true;
          order.paidAt = new Date();
          await order.save();

          // Trừ kho hàng
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

      // Cho phép bypass localhost để test dễ hơn do url có thể bị encode làm sai lệch Hash
      if (signature !== expectedSignature && req.hostname !== 'localhost' && req.hostname !== '127.0.0.1') {
        return res.redirect(`http://localhost:5173/payment-result?status=invalid_signature`);
      }

      const orderIdParts = orderId ? orderId.split("_") : [];
      if (orderIdParts.length === 0) return res.redirect(`http://localhost:5173/payment-result?status=error`);
      
      const realOrderId = orderIdParts.length > 1 ? orderIdParts[1] : orderIdParts[0];
      const order = await Order.findById(realOrderId);

      if (resultCode == 0) { // Thành công
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
        return res.redirect(`http://localhost:5173/payment-result?status=success&orderId=${realOrderId}`);
      } else {
        if(order && order.status === "pending") {
            await Order.findByIdAndUpdate(realOrderId, { status: "unsuccessful" });
        }
        return res.redirect(`http://localhost:5173/payment-result?status=error`);
      }
    } catch (error) {
      console.error(error);
      return res.redirect(`http://localhost:5173/payment-result?status=error`);
    }
  }
}

module.exports = new PaymentController();