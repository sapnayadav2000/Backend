const mongoose = require("mongoose");

// Product Schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // Remove leading and trailing spaces
    },
    description: {
      type: String,
      trim: true, // Remove extra spaces
    },
    Sortdescription: {
      type: String,
      trim: true, // Remove extra spaces
    },
    productkey: [
      {
        Size: {
          type: String,
          required: true,
        },
        Quantity: {
          type: Number,
          required: true,
          min: 0,
        },
       
        OfferPrice: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    Originalprice: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    brand: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
      },
    ],
    brandname: [
      {
        type: String,
      },
    ],
    subCategory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "SubCategory",
      },
    ],
    subCategoryname: [
      {
        type: String,
      },
    ]
     
    ,
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Category",
      },
    ],
    categoryname: [
      {
        type: String,
      },
    ],
    images: [
      {
        type: String, // URL to the product image
        required: true,
      },
    ],
    refundPolicies: {
      returnable: {
        type: Boolean,
        default: false,
      },
      returnWindow: {
        type: Number, // number of days allowed for return
        default: 30,
      },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

// Create Product model
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;
