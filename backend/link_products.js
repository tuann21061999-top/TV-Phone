const mongoose = require("mongoose");
const Product = require("./models/Product");

mongoose.connect("mongodb://localhost:27017/phone_store");

async function run() {
  try {
    const products = await Product.find({}).limit(2);
    if (products.length < 2) {
      console.log("Not enough products found.");
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
