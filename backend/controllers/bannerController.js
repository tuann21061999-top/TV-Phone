const Banner = require("../models/Banner");
const cloudinary = require("cloudinary").v2; 
const fs = require("fs");

const bannerController = {
  // 1. TẠO BANNER MỚI
  createBanner: async (req, res) => {
    try {
      const { title, subtitle, link, buttonText, isActive, order } = req.body;

      // Kiểm tra xem multer có bắt được file ảnh gửi lên không
      if (!req.file) {
        return res.status(400).json({ message: "Vui lòng chọn file ảnh cho Banner từ máy tính" });
      }

      // Upload file từ thư mục tạm ('uploads/') lên Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "banners", // Sẽ tạo 1 folder tên là 'banners' trên Cloudinary của bạn
      });

      // Xóa file tạm trong thư mục uploads/ của server sau khi up xong
      fs.unlinkSync(req.file.path);

      // Lưu thông tin vào MongoDB
      const newBanner = new Banner({
        title,
        subtitle,
        image: result.secure_url, // Lấy URL xịn từ Cloudinary trả về
        link,
        buttonText,
        isActive: isActive === 'true' || isActive === true,
        order: parseInt(order) || 0
      });

      const savedBanner = await newBanner.save();
      res.status(201).json({ message: "Tạo banner thành công", banner: savedBanner });
    } catch (error) {
      // Nhớ dọn rác (xóa file tạm) nếu quá trình lỗi
      if (req && req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      console.error("LỖI TẠO BANNER:", error);
      res.status(500).json({ message: "Lỗi server khi tạo banner", error: error.message });
    }
  },

  // 2. CẬP NHẬT BANNER
  updateBanner: async (req, res) => {
    try {
      const bannerId = req.params.id;
      const { title, subtitle, link, buttonText, isActive, order } = req.body;

      let banner = await Banner.findById(bannerId);
      if (!banner) return res.status(404).json({ message: "Không tìm thấy Banner" });

      let imageUrl = banner.image; // Mặc định giữ lại ảnh cũ

      // Nếu Admin có chọn file ảnh mới thì up lên Cloudinary đè vào
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, { folder: "banners" });
        imageUrl = result.secure_url;
        fs.unlinkSync(req.file.path); // Xóa file tạm
      }

      banner.title = title;
      banner.subtitle = subtitle;
      banner.link = link;
      banner.buttonText = buttonText;
      banner.isActive = isActive === 'true' || isActive === true;
      banner.order = parseInt(order) || 0;
      banner.image = imageUrl;

      const updatedBanner = await banner.save();
      res.status(200).json({ message: "Cập nhật thành công", banner: updatedBanner });
    } catch (error) {
      if (req && req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      console.error("LỖI UPDATE BANNER:", error);
      res.status(500).json({ message: "Lỗi khi cập nhật banner", error: error.message });
    }
  },

  // 3. LẤY TẤT CẢ BANNER CHO ADMIN
  getAdminBanners: async (req, res) => {
    try {
      const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
      res.status(200).json(banners);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách banner", error: error.message });
    }
  },

  // 4. LẤY BANNER ĐANG ACTIVE CHO TRANG CHỦ
  getPublicBanners: async (req, res) => {
    try {
      const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
      res.status(200).json(banners);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  // 5. ẨN / HIỆN BANNER
  toggleBannerStatus: async (req, res) => {
    try {
      const bannerId = req.params.id;
      const banner = await Banner.findById(bannerId);
      if (!banner) return res.status(404).json({ message: "Không tìm thấy Banner" });

      banner.isActive = !banner.isActive;
      await banner.save();
      res.status(200).json({ message: "Thành công", isActive: banner.isActive });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi cập nhật trạng thái", error: error.message });
    }
  },

  // 6. XÓA BANNER
  deleteBanner: async (req, res) => {
    try {
      const bannerId = req.params.id;
      const deletedBanner = await Banner.findByIdAndDelete(bannerId);
      if (!deletedBanner) return res.status(404).json({ message: "Không tìm thấy Banner để xóa" });
      res.status(200).json({ message: "Đã xóa banner thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi xóa banner", error: error.message });
    }
  }
};

module.exports = bannerController;