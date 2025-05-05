const multer = require("multer");
const path = require("path");
const fs = require("fs");
// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Uploads/"); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Initialize multer with the storage configuration
const upload = multer({ storage });

// Single file upload middleware
exports.singleFileUpload = upload.single("image");

exports.uploadHandler = (req, res, next) => {
  let uploadFields = [
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "images", maxCount: 20 },
    { name: "beforeImage", maxCount: 1 },
    { name: "afterImage", maxCount: 1 },
    { name: "logo", maxCount: 1 },
    { name: "idImage", maxCount: 1 },
    { name: "document", maxCount: 1 },
    { name: "existingImages", maxCount: 20 },
  ];
  upload.fields(uploadFields)(req, res, next);
};
