const User = require("../models/User");

// 1. Lấy thông tin chi tiết User hiện tại
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
  }
};

// 2. Cập nhật thông tin cơ bản (Tên, Số điện thoại)
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    // TỐI ƯU: Kiểm tra số điện thoại có bị trùng với người khác không
    if (phone) {
      const phoneExists = await User.findOne({ phone, _id: { $ne: req.user.id } });
      if (phoneExists) {
        return res.status(400).json({ message: "Số điện thoại này đã được sử dụng bởi tài khoản khác!" });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { name, phone } },
      { new: true, runValidators: true }
    ).select("-password");
    
    res.status(200).json({ message: "Cập nhật thành công", user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật: " + error.message });
  }
};

/* ===============================
   QUẢN LÝ ĐỊA CHỈ (ADDRESS)
   =============================== */

// 3. Thêm địa chỉ mới
exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

    if (req.body.isDefault || user.addresses.length === 0) {
      user.addresses.forEach(addr => addr.isDefault = false);
      req.body.isDefault = true; 
    }

    user.addresses.push(req.body);
    await user.save();
    res.status(201).json({ message: "Thêm địa chỉ thành công", addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: "Lỗi thêm địa chỉ" });
  }
};

// 4. Xóa địa chỉ
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

    const addressToRemove = user.addresses.id(req.params.addressId);
    if (!addressToRemove) return res.status(404).json({ message: "Không tìm thấy địa chỉ" });

    const wasDefault = addressToRemove.isDefault;
    
    // TỐI ƯU: Dùng pull của mongoose để xóa subdocument
    user.addresses.pull(req.params.addressId);

    // TỐI ƯU: Nếu xóa mất cái mặc định, gán lại cái đầu tiên làm mặc định
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.status(200).json({ message: "Xóa địa chỉ thành công", addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa địa chỉ" });
  }
};

// Cập nhật địa chỉ
exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { fullName, phone, province, district, ward, detail, isDefault } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

    const address = user.addresses.id(addressId);
    if (!address) return res.status(404).json({ message: "Không tìm thấy địa chỉ" });

    if (fullName) address.fullName = fullName;
    if (phone) address.phone = phone;
    if (province) address.province = province;
    if (district) address.district = district;
    if (ward) address.ward = ward;
    if (detail) address.detail = detail;

    if (isDefault === true) {
      user.addresses.forEach(addr => addr.isDefault = false);
      address.isDefault = true;
    }

    await user.save();

    res.status(200).json({ 
      message: "Cập nhật địa chỉ thành công", 
      addresses: user.addresses 
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật địa chỉ: " + error.message });
  }
};

/* ===============================
   QUẢN LÝ THANH TOÁN (PAYMENT)
   =============================== */

// 5. Thêm phương thức thanh toán
exports.addPaymentMethod = async (req, res) => {
  try {
    const { type, provider, accountNumber, isDefault } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

    if (isDefault || user.paymentMethods.length === 0) {
      user.paymentMethods.forEach(pm => pm.isDefault = false);
      req.body.isDefault = true;
    }

    user.paymentMethods.push({
      type,
      provider,
      accountNumber,
      isDefault: req.body.isDefault || false
    });

    await user.save();
    res.status(201).json({ message: "Thêm phương thức thanh toán thành công", user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi thêm phương thức thanh toán" });
  }
};

// 6. Xóa phương thức thanh toán
exports.deletePaymentMethod = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

    const paymentToRemove = user.paymentMethods.id(req.params.paymentId);
    if (!paymentToRemove) return res.status(404).json({ message: "Không tìm thấy phương thức" });

    const wasDefault = paymentToRemove.isDefault;

    // TỐI ƯU: Xóa bằng pull
    user.paymentMethods.pull(req.params.paymentId);

    // TỐI ƯU: Cấp lại mặc định nếu cần
    if (wasDefault && user.paymentMethods.length > 0) {
      user.paymentMethods[0].isDefault = true;
    }

    await user.save();
    res.status(200).json({ message: "Xóa phương thức thanh toán thành công", user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa phương thức thanh toán" });
  }
};

// 7. Cập nhật phương thức thanh toán
exports.updatePaymentMethod = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { type, provider, accountNumber, isDefault } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

    const payment = user.paymentMethods.id(paymentId);
    if (!payment) return res.status(404).json({ message: "Không tìm thấy phương thức thanh toán" });

    if (type) payment.type = type;
    if (provider) payment.provider = provider;
    if (accountNumber) payment.accountNumber = accountNumber;

    if (isDefault === true) {
      user.paymentMethods.forEach(pm => pm.isDefault = false);
      payment.isDefault = true;
    }

    await user.save();
    res.status(200).json({ message: "Cập nhật phương thức thanh toán thành công", user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật phương thức thanh toán" });
  }
};