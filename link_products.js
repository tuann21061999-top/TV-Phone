const mongoose = require("mongoose");
const Product = require("./backend/models/Product");

mongoose.connect("mongodb://127.0.0.1:27017/tv_phone", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    const products = await Product.find({ productType: "electronic" }).limit(2);
    if (products.length < 2) {
      console.log("Not enough electronic products found.");
      process.exit(1);
    }

    products[0].productGroup = "TEST-GRP-1";
    // Ensure they have options to test the UI
    products[0].variants[0].storage = "Bản Tiêu Chuẩn";
    
    products[1].productGroup = "TEST-GRP-1";
    products[1].variants[0].storage = "Bản Cao Cấp";

    await products[0].save();
    await products[1].save();

    console.log("Updated products:", products[0].slug, "and", products[1].slug);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
