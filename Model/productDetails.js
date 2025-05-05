const mongoose = require("mongoose");

// Product Details Schema
const productDetailsSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      
    },
    quantity: {
      type: Number,
    
    },
    offerprice: {
      type: Number,
    },
    price: {
      type: Number,
     
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product", // References the Product model
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

// Create Productdetails model
const Productdetails = mongoose.model("Productdetails", productDetailsSchema);

module.exports = Productdetails;
