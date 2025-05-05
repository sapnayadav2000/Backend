const mongoose = require("mongoose");

const BrandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "plese provide "],
    },
    image: {
      type: String, // Stores image URL or file path
      required: [true, "plese provide "],
    },
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Inactive"],
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const Brand = mongoose.models.Brand || mongoose.model("Brand", BrandSchema);

module.exports = Brand;
