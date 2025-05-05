const mongoose = require("mongoose");

// Category Schema
const subcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true, // Remove leading and trailing spaces
      required: [true, "plese provide "],
    },
    description: {
      type: String,
      trim: true, // Remove extra spaces
    },
    Category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Reference to another category for parent-child relationship
      required: true
    },
    Categoryname: {
      type: String,
    },
    image: {
      type: String, // URL of the category image (optional)
      required: true
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const SubCategory = mongoose.models.SubCategory || mongoose.model("SubCategory", subcategorySchema);
module.exports = SubCategory;

