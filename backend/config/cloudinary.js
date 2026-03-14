const cloudinary = require("cloudinary").v2;
const https = require('https');

console.log(process.env.CLOUDINARY_CLOUD_NAME)

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create an HTTPS agent that forces IPv4
const agent = new https.Agent({ family: 4 });

// Override the default API network request to use this agent
const originalUpload = cloudinary.uploader.upload;
cloudinary.uploader.upload = function (file, options, callback) {
  const mergedOptions = { ...options, agent };
  return originalUpload.call(this, file, mergedOptions, callback);
};

module.exports = cloudinary;