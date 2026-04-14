const mongoose = require("mongoose");

// Tạo slug thủ công (hỗ trợ tiếng Việt) — không cần cài thêm package
function makeSlug(str) {
    const from = "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ";
    const to = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyyd";
    let slug = str.toLowerCase().trim();
    for (let i = 0; i < from.length; i++) {
        slug = slug.replace(new RegExp(from[i], "g"), to[i]);
    }
    slug = slug
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    return slug;
}

const contentBlockSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["text", "image", "heading"],
            required: true,
        },
        value: {
            type: String,
            required: true,
        },
    },
    { _id: false }
);

const newsSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Vui lòng nhập tiêu đề bài viết"],
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
        },
        shortDescription: {
            type: String,
            required: [true, "Vui lòng nhập mô tả ngắn"],
        },
        thumbnail: {
            type: String,
            required: [true, "Vui lòng cung cấp ảnh bìa"],
        },
        contentBlocks: {
            type: [contentBlockSchema],
            default: [], // Added default and removed validator as per instruction
        },
        author: {
            type: String,
            default: "Admin",
        },
        category: {
            type: String,
            enum: [
                "Đánh giá",
                "Mẹo hay",
                "Thị trường",
                "Khuyến mãi",
                "Thủ thuật",
                "Custom ROM",
                "Khác",
            ],
            default: "Khác",
        },
        relatedProduct: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            default: null,
        },
        views: {
            type: Number,
            default: 0,
        },
        displayLocations: {
            type: [String],
            enum: ["home", "phones", "electronics", "accessories", "promotions", "contact"],
            default: [],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Tạo slug tự động trước khi lưu
newsSchema.pre("save", function () {
    if (this.isModified("title")) {
        this.slug = makeSlug(this.title) + "-" + Date.now().toString(36);
    }
});

const News = mongoose.model("News", newsSchema);

module.exports = News;
