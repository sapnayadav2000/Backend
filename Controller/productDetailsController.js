const ProductDetails = require("../Model/productDetails");
const Product=require("../model/product")
const mongoose = require("mongoose"); 
exports.create = async (req, res) => {
  try {
    const product = await ProductDetails.create(req.body);
    res
      .status(201)
      .json({ status: true, message: "Product Detail create ", data: product });
  } catch (err) {
    res.status(400).json({ status: false, error: err.message });
  }
};
exports.update = async (req, res) => {
  const id = req.params.id;
  try {
    const product = await ProductDetails.findById(id);
    if (!product) {
      res
        .status(404)
        .json({ status: false, message: "Product Detail  Not Found" });
    }
    Object.keys(req.body).forEach((key) => {
      product[key] = req.body[key];
    });
    await product.save();
    res
      .status(400)
      .json({
        status: true,
        message: "Product Detail  Updated ",
        data: product,
      });
  } catch (err) {
    res.status(400).json({ status: false, error: err.message });
  }
};
exports.delete = async (req, res) => {
  
  try {
    const id = req.params.id;
  const product = await ProductDetails.findById(id);
    if (!product) {
      res
        .status(404)
        .json({ status: false, message: "Product Detail  Not Found" });
    }
    await ProductDetails.findByIdAndDelete(product);
    res.status(200).json({ status: true, message: "Product Detail  Deleted " });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
};
exports.getAll = async (req, res) => {
 
    try {
      const productDetails = await ProductDetails.find()
        .populate("product") // Fetch full product details
        .exec();
  
      res.status(200).json({
        status: true,
        message: "Product details fetched successfully",
        data: productDetails
      });
    } catch (err) {
      res.status(400).json({ status: false, error: err.message });
    }

};
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: "Invalid Product ID" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ status: false, message: "Product Detail Not Found" });
    }

    res.json({ status: true, data: product });
  } catch (error) {
    res.status(500).json({ status: false, message: "Server Error" });
  }
};