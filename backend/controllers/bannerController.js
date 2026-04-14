const Banner = require("../models/Banner");
const cloudinary = require("cloudinary").v2; 
const fs = require("fs");

const bannerController = {
  // 1. TẠO BANNER MỚI
  createBanner: async (req, res) => {
    try {
      const { title, subtitle, link, newsLink, buttonText, isActive, order, theme, startDate, endDate, position } = req.body;

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
        newsLink,
        buttonText,
        isActive: isActive === 'true' || isActive === true,
        order: parseInt(order) || 0,
        theme: theme || "blue",
        position: position || "main",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
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
      const { title, subtitle, link, newsLink, buttonText, isActive, order, theme, startDate, endDate, position } = req.body;

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
      if (newsLink !== undefined) banner.newsLink = newsLink;
      banner.buttonText = buttonText;
      banner.isActive = isActive === 'true' || isActive === true;
      banner.order = parseInt(order) || 0;
      banner.theme = theme || "blue";
      banner.position = position || "main";
      banner.startDate = startDate ? new Date(startDate) : null;
      banner.endDate = endDate ? new Date(endDate) : null;
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
      const now = new Date();
      const query = {
        isActive: true,
        $and: [
          { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
          { $or: [{ endDate: null }, { endDate: { $gte: now } }] }
        ]
      };
      const banners = await Banner.find(query).sort({ order: 1, createdAt: -1 });
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