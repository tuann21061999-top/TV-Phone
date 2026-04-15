const Product = require("../models/Product");
const Category = require("../models/Category");
const Review = require("../models/Review");
const mongoose = require("mongoose");

/* =====================================
   CREATE PRODUCT
===================================== */
exports.createProduct = async (req, res) => {
  try {
    const fs = require('fs');
    fs.appendFileSync('debug_logs.txt', 'Create Product Payload: ' + JSON.stringify(req.body, null, 2) + '\n');
    console.log("Create Product Request Body:", JSON.stringify(req.body, null, 2));
    const product = await Product.create(req.body);

    // Tự động đồng bộ compatibleWith 2 chiều
    if (req.body.compatibleWith && req.body.compatibleWith.length > 0) {
      await Product.updateMany(
        { _id: { $in: req.body.compatibleWith } },
        { $addToSet: { compatibleWith: product._id } }
      );
    }

    res.status(201).json(product);
  } catch (error) {
    console.error("Create Product Error:", error.message);
    res.status(400).json({ message: error.message });
  }
};

/* =====================================
   GET ALL PRODUCTS (FILTER + SEARCH)
===================================== */
exports.getAllProducts = async (req, res) => {
  try {
    const { type, productType, brand, search, condition, admin } = req.query;
    const resolvedType = type || productType;

    let filter = {};

    // ✅ FIX LỖI 1: Phải so sánh chuỗi chính xác. Chỉ khi admin đích thị là 'true' thì mới lấy cả hàng ẩn.
    if (admin !== 'true') {
      filter.isActive = true;
    }

    if (resolvedType === 'hot') {
      filter.isFeatured = true;
    } else if (resolvedType) {
      filter.productType = resolvedType;
      // Đã xóa dòng filter.isFeatured = { $ne: true } để trả về ĐẦY ĐỦ sản phẩm
    }
    if (brand) filter.brand = brand;
    if (condition) filter.condition = condition;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { highlights: { $elemMatch: { $regex: search, $options: "i" } } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter)
      .populate("categoryId", "name")
      .sort({ createdAt: -1 });

    // Không cần aggregate nữa, vì averageRating và reviewsCount đã được cache sẵn trong Product Model
    const enriched = products.map(p => {
      const obj = p.toObject();
      // Đảm bảo không undefined
      obj.averageRating = obj.averageRating || 0;
      obj.reviewsCount = obj.reviewsCount || 0;
      return obj;
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================
   GET PRODUCT BY ID OR SLUG
===================================== */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    let product;

    // Nếu là ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id)
        .populate("categoryId")
        .populate({
          path: "compatibleWith",
          select: "-description -specs -detailImages -createdAt -updatedAt"
        });
    }

    // Nếu không tìm thấy → tìm theo slug
    if (!product) {
      product = await Product.findOne({ slug: id })
        .populate("categoryId")
        .populate({
          path: "compatibleWith",
          select: "-description -specs -detailImages -createdAt -updatedAt"
        });
    }

    // Nếu không có sp, HOẶC sp đã bị ẩn (isActive = false)
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Chỉ trả về variant đang active
    if (product.variants) {
      product.variants = product.variants.filter(v => v.isActive !== false);
    }

    // Lấy các sản phẩm anh em cùng productGroup
    let siblings = [];
    if (product.productGroup) {
      siblings = await Product.find({
        productGroup: product.productGroup,
        _id: { $ne: product._id },
        isActive: true,
      }).select("name slug colorImages productGroup productType variants");
    }

    // MỤC 1: SẢN PHẨM LIÊN QUAN (Cùng Brand)
    let relatedProducts = await Product.find({
      categoryId: product.categoryId,
      brand: product.brand,
      _id: { $ne: product._id },
      isActive: true,
    })
      .sort({ totalSold: -1 })
      .limit(5)
      .select("-description -specs -detailImages -createdAt -updatedAt");

    if (relatedProducts.length < 5) {
      const genericProducts = await Product.find({
        categoryId: product.categoryId,
        _id: { $ne: product._id, $nin: relatedProducts.map(p => p._id) },
        isActive: true,
      })
        .sort({ totalSold: -1 })
        .limit(5 - relatedProducts.length)
        .select("-description -specs -detailImages -createdAt -updatedAt");
      relatedProducts = [...relatedProducts, ...genericProducts];
    }

    // MỤC 2: CÓ THỂ BẠN SẼ THÍCH (Ưu tiên trùng nhiều Tag nhất)
    let recommendedProducts = [];
    if (product.tags && product.tags.length > 0) {
      const targetTags = product.tags.map(t => t.toString());

      let candidateProducts = await Product.find({
        isActive: true,
        _id: { $ne: product._id },
        tags: { $in: product.tags }
      }).select("-description -specs -detailImages -createdAt -updatedAt");

      // Tính điểm trùng khớp Tag
      const scoredProducts = candidateProducts.map(p => {
        let score = 0;
        if (p.tags) {
          p.tags.forEach(t => {
            if (targetTags.includes(t.toString())) score++;
          });
        }
        return { product: p, score };
      });

      // Sắp xếp: Ưu tiên trùng nhiều tag nhất -> Bằng nhau mới so totalSold
      scoredProducts.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (b.product.totalSold || 0) - (a.product.totalSold || 0);
      });

      recommendedProducts = scoredProducts.slice(0, 5).map(item => item.product);
    }

    const productObj = product.toObject();
    productObj.siblings = siblings;
    productObj.relatedProducts = relatedProducts;
    productObj.recommendedProducts = recommendedProducts;

    res.json(productObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================
   UPDATE PRODUCT
===================================== */
exports.updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };
    const imagesToDelete = req.body.imagesToDelete || [];

    // Xóa khỏi updateData để database không bị lạ
    delete updateData.imagesToDelete;

    if (req.body.detailImages) {
      updateData.detailImages = req.body.detailImages;
    }

    console.log("Update Product Payload:", updateData);

    // Lấy product cũ để kiểm tra thay đổi compatibleWith
    const oldProduct = await Product.findById(req.params.id);
    if (!oldProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      {
        returnDocument: 'after',
        runValidators: true,
      }
    );

    // Tự động đồng bộ 2 chiều khi cập nhật compatibleWith
    if ('compatibleWith' in updateData) {
      const oldComp = (oldProduct.compatibleWith || []).map(id => id.toString());
      const newComp = (updateData.compatibleWith || []).map(id => id.toString());

      const addedIds = newComp.filter(id => !oldComp.includes(id));
      const removedIds = oldComp.filter(id => !newComp.includes(id));

      if (addedIds.length > 0) {
        await Product.updateMany(
          { _id: { $in: addedIds } },
          { $addToSet: { compatibleWith: product._id } }
        );
      }

      if (removedIds.length > 0) {
        await Product.updateMany(
          { _id: { $in: removedIds } },
          { $pull: { compatibleWith: product._id } }
        );
      }
    }

    // Tiến hành xoá ảnh cũ trên Cloudinary
    if (imagesToDelete.length > 0) {
      const cloudinary = require("../config/cloudinary");
      for (const url of imagesToDelete) {
        try {
          if (url && url.includes("tv-phone-test/")) {
            const parts = url.split("tv-phone-test/");
            if (parts.length === 2) {
              const publicId = parts[1].split(".")[0];
              await cloudinary.uploader.destroy(`tv-phone-test/${publicId}`);
              console.log("Deleted old image from Cloudinary:", `tv-phone-test/${publicId}`);
            }
          }
        } catch (e) {
          console.error("Lỗi xóa ảnh Cloudinary:", e.message);
        }
      }
    }

    res.json(product);
  } catch (error) {
    console.error("Update Product Error:", error.message);
    res.status(400).json({ message: error.message });
  }
};

/* =====================================
   DELETE PRODUCT
===================================== */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Thu thập tất cả ảnh cần xoá
    const imagesToDelete = [];
    if (product.images) imagesToDelete.push(...product.images);
    if (product.detailImages) imagesToDelete.push(...product.detailImages);
    if (product.colorImages) {
      product.colorImages.forEach(c => c.imageUrl && imagesToDelete.push(c.imageUrl));
    }

    await Product.findByIdAndDelete(req.params.id);

    // Gỡ liên kết compatibleWith đồng bộ ở tất cả các Product liên quan
    await Product.updateMany(
      { compatibleWith: req.params.id },
      { $pull: { compatibleWith: req.params.id } }
    );

    // Tiến hành xoá ảnh trên Cloudinary
    if (imagesToDelete.length > 0) {
      const cloudinary = require("../config/cloudinary");
      for (const url of imagesToDelete) {
        try {
          if (url && url.includes("tv-phone-test/")) {
            const parts = url.split("tv-phone-test/");
            if (parts.length === 2) {
              const publicId = parts[1].split(".")[0];
              await cloudinary.uploader.destroy(`tv-phone-test/${publicId}`);
              console.log("Deleted product image from Cloudinary:", `tv-phone-test/${publicId}`);
            }
          }
        } catch (e) {
          console.error("Lỗi xóa ảnh Cloudinary:", e.message);
        }
      }
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.toggleProductStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    // Dùng findByIdAndUpdate nhưng KHÔNG dùng runValidators: true
    // và chỉ update đúng trường isActive
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: isActive } },
      { returnDocument: 'after' } // Trả về doc sau khi update
    );

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json({ message: "Cập nhật trạng thái thành công", isActive: product.isActive });
  } catch (error) {
    console.error("Toggle Status Error:", error.message);
    res.status(500).json({ message: "Lỗi server khi cập nhật trạng thái" });
  }
};

/* =====================================
   BULK ACTION CHUNG (UPDATE)
===================================== */
exports.bulkUpdateProducts = async (req, res) => {
  try {
    const { productIds, updateData } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: "Không có sản phẩm nào được chọn" });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Không có dữ liệu cập nhật" });
    }

    let updateQuery = {};

    // Nếu UI muốn append thay vì replace tag, có thể dùng $addToSet với $each.
    // Ở đây ta theo đúng thiết kế, sẽ merge/thay thế các field.
    if ('tags' in updateData) {
      if (!updateQuery.$set) updateQuery.$set = {};
      // Nối mảng (addToSet) thay vì đè lên mảng cũ để an toàn theo yêu cầu UI
      updateQuery.$addToSet = { tags: { $each: updateData.tags || [] } };
    }

    if ('isActive' in updateData) {
      if (!updateQuery.$set) updateQuery.$set = {};
      updateQuery.$set.isActive = updateData.isActive;
    }

    if ('compatibleWith' in updateData) {
      if (!updateQuery.$addToSet) updateQuery.$addToSet = {};
      updateQuery.$addToSet.compatibleWith = { $each: updateData.compatibleWith || [] };

      // Chạy đồng bộ 2 chiều (gắn hàng loạt productIds vào mảng compatibleWith ở các SP đích)
      if (updateData.compatibleWith && updateData.compatibleWith.length > 0) {
        await Product.updateMany(
          { _id: { $in: updateData.compatibleWith } },
          { $addToSet: { compatibleWith: { $each: productIds } } }
        );
      }
    }

    if (Object.keys(updateQuery).length === 0) {
      return res.status(400).json({ message: "Lỗi tạo updateQuery" });
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      updateQuery
    );

    res.json({
      message: `Đã cập nhật hàng loạt thành công. Số SP ảnh hưởng: ${result.modifiedCount}`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error("Bulk Update Products Error:", error.message);
    res.status(500).json({ message: "Lỗi server khi cập nhật hàng loạt" });
  }
};

/* =====================================
   BULK DELETE PRODUCTS
===================================== */
exports.bulkDeleteProducts = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: "Không có sản phẩm nào được chọn để xóa" });
    }

    const result = await Product.deleteMany({ _id: { $in: productIds } });

    // Gỡ toàn bộ productIds ở những Product liên quan
    await Product.updateMany(
      { compatibleWith: { $in: productIds } },
      { $pull: { compatibleWith: { $in: productIds } } }
    );

    res.json({
      message: `Đã xóa hàng loạt thành công. Số SP đã xóa: ${result.deletedCount}`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error("Bulk Delete Products Error:", error.message);
    res.status(500).json({ message: "Lỗi server khi xóa hàng loạt" });
  }
};
