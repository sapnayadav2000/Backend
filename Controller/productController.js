const Product = require("../model/product");
const Category = require("../model/category");
const SubCategory = require("../model/subCategory");
const Brand = require("../model/brand");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
exports.CreateProduct = async (req, res) => {
  try {
    if (req.files.images && req.files.images.length > 0) {
      req.body.images = req.files.images.map(
        (file) => `Uploads/${file.filename}`
      );
    }
    if (req.body.productkey) {
      req.body.productkey = JSON.parse(req.body.productkey);
    }

    if (req.body.refundPolicies) {
      req.body.refundPolicies = JSON.parse(req.body.refundPolicies);
    }

    // Fetch Category, SubCategory, and Brand Names
    const categoryDocs = await Category.find({
      _id: { $in: req.body.category },
    });
    const subCategoryDocs = await SubCategory.find({
      _id: { $in: req.body.subCategory },
    });
    const brandDoc = await Brand.find({ _id: { $in: req.body.brand } });
    // const brandDoc = await Brand.findById(req.body.brand);

    // Extract names from fetched documents
    req.body.categoryname = categoryDocs.map((cat) => cat.name);
    req.body.subCategoryname = subCategoryDocs.map((sub) => sub.name);
    req.body.brandname = brandDoc.map((brand) => brand.name);
    // req.body.brandName = brandDoc ? brandDoc.name : "";
    console.log(req.body.categoryname);
    console.log(req.body.subCategoryname);
    console.log(req.body.brandName);

    // Create Product
    const product = await Product.create(req.body);

    res
      .status(201)
      .json({ status: true, message: "Product created", data: product });
  } catch (err) {
    res.status(400).json({ status: false, error: err.message });
  }
};

exports.GetAllProduct = async (req, res) => {
  try {
    
    const product = await Product.find()
      .populate("category") // Populate category field, only returning 'name'
      .populate("subCategory") // Populate subcategory field, only returning 'name'

      .sort({ createdAt: -1 });

    if (product.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "Product Not Found" });
    }

    res.status(200).json({
      status: true,
      message: "Product Fetch Successfully",
      data: product,
    });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
};

exports.DeleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product Not Found" });
    }

    // Delete images if they exist
    if (product.images && product.images.length > 0) {
      product.images.forEach((images) => {
        const imagePath = path.join(
          __dirname,
          "../Uploads",
          path.basename(images)
        );
        if (fs.existsSync(imagePath)) {
          fs.unlink(imagePath, (err) => {
            if (err) {
              console.error("Failed to delete images:", err);
            }
          });
        }
      });
    }

    // Delete the product
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(500).json({ message: "Failed to delete product" });
    }

    res.status(200).json({
      status: true,
      message: "Product Deleted Successfully",
      data: deletedProduct,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ status: false, error: err.message });
  }
};
exports.UpdateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the existing product
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });
    }

    // Ensure refundPolicies is a valid object
    let refundPolicies = req.body.refundPolicies;

    // Handle case where refundPolicies is sent as a string
    if (typeof refundPolicies === "string") {
      try {
        refundPolicies = JSON.parse(refundPolicies); // Attempt to parse string as JSON
      } catch (err) {
        refundPolicies = { returnable: false, returnWindow: 30 }; // Default fallback
      }
    }

    // Validate refundPolicies object
    if (typeof refundPolicies === "object" && refundPolicies !== null) {
      refundPolicies.returnable =
        refundPolicies.returnable === "true" ||
        refundPolicies.returnable === true; // Ensure "true" is treated as true
      refundPolicies.returnWindow =
        typeof refundPolicies.returnWindow === "number"
          ? refundPolicies.returnWindow
          : parseInt(refundPolicies.returnWindow) || 30; // Default to 30 if invalid
    } else {
      refundPolicies = { returnable: false, returnWindow: 30 }; // Default
    }
    // Fetch Category, SubCategory, and Brand Names
    const categoryDocs = await Category.find({
      _id: { $in: req.body.category || [] },
    });
    const subCategoryDocs = await SubCategory.find({
      _id: { $in: req.body.subCategory || [] },
    });
    const brandDoc = req.body.brand
      ? await Brand.findById(req.body.brand)
      : null;

    // Extract names safely
    req.body.categoryname = categoryDocs.map((cat) => cat.name);
    req.body.subCategoryname = subCategoryDocs.map((sub) => sub.name);
    req.body.brandname = brandDoc ? brandDoc.name : "";

    // Separate images and refund policies from the request body
    const { images, refundpolicies, ...updateFields } = req.body;
    updateFields.refundPolicies = refundPolicies; // Add parsed refundPolicies to updateFields

    // Ensure productkey is properly parsed if sent as a JSON string
    if (typeof updateFields.productkey === "string") {
      try {
        updateFields.productkey = JSON.parse(updateFields.productkey);
      } catch (error) {
        return res
          .status(400)
          .json({ status: false, message: "Invalid productkey format" });
      }
    }

    // Update non-image fields
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    // Handle new image uploads (if any)
    if (req.files && req.files["images"]) {
      const newImages = req.files["images"].map(
        (file) => `Uploads/${file.filename}`
      );

      // Append new images without removing existing ones
      await Product.findByIdAndUpdate(
        id,
        { $push: { images: { $each: newImages } } },
        { new: true }
      );
    }

    // Fetch and return the updated product
    const finalProduct = await Product.findById(id);
    res
      .status(200)
      .json({
        status: true,
        message: "Product Updated Successfully",
        data: finalProduct,
      });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ status: false, error: err.message });
  }
};

exports.GetByIdProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid Product ID" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ status: false, message: "Product Detail Not Found" });
    }

    res.json({ status: true, data: product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ status: false, message: "Server Error" });
  }
};

exports.getSubCategoryByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params; // Get categoryId from request parameters

    if (!categoryId) {
      return res.status(400).json({ message: "Category ID is required" });
    }

    // Find subcategories matching the given category ID
    const subcategories = await SubCategory.find({ Category: categoryId });

    res.status(200).json(subcategories);
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    res.status(500).json({ message: "Failed to fetch subcategories" });
  }
};

exports.deletedProductimage = async (req, res) => {
  try {
    const { imagePath, productId } = req.body;

    console.log("Received data for deletion:", { imagePath, productId });

    if (!imagePath || !productId) {
      return res.status(400).json({ message: "Missing required data" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Remove image from product array
    product.images = product.images.filter((img) => img !== imagePath);
    await product.save();

    // Fix file path issue
    const filePath = path.join(__dirname, "../", imagePath);
    console.log("Attempting to delete file:", filePath);

    // Check and delete file
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log("File deleted successfully:", filePath);
        }
      });
    } else {
      console.log("File not found:", filePath);
    }

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProductByCategory = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log('id------------',id);
    if (!id) {
      return res.status(400).json({
        status: 400,
        message: "Category ID is required",
        success: false,
      });
    }
    let productsArray = await Product.find({ category: id }).populate(
      "category"
    ).sort({ createdAt: -1 });
    if (productsArray.length > 0) {
      const modifiedArray = productsArray.map((element) => {
        const productObj = element.toObject();
        if (productObj.image) {
          productObj.image = `${process.env.SERVER_LOCALHOST}:${process.env.SERVER_PORT}/uploads/${productObj.image}`;
        }
        return productObj;
      });
      return res.json({
        status: 200,
        message: "Products retrieved successfully",
        success: true,
        data: modifiedArray,
      });
    } else {
      return res.json({
        status: 404,
        message: "No products found for this category",
        success: true,
        data: [],
      });
    }
  } catch (error) {
    console.error("Error in getProductByCategory:", error);
    return res.status(500).json({
      status: 500,
      message: error.message || "Internal server error",
      success: false,
    });
  }
};
exports.getProductBySubCategory = async (req, res) => {
  try {
    let SITE_URL = `${process.env.HOST}${process.env.PORT}`;
    const { id } = req.body;
    // console.log(req.query);
    // return
    let productsArray = await Product.find({ id }).sort({ createdAt: -1 });
    if (productsArray.length > 0) {
      const modifiedArray = productsArray.map((element, index) => {
        if (element.image) {
          return {
            ...element.toObject(),
            image: `${process.env.SERVER_LOCALHOST}:${process.env.SERVER_PORT}/uploads/${element.image}`,
          };
        } else {
          return element;
        }
      });
      //             console.log("element.image",modifiedArray);
      // return
      return res.json({
        status: 200,
        message: "productlist_sucessfully",
        success: true,
        data: modifiedArray,
      });
    } else {
      throw "...";
    }
  } catch (error) {
    return res.json({
      status: 400,
      message: error.message || "Bad request",
      success: false,
    });
  }
};



exports.searchProduct = async (req, res) => {
  try {
    const { category_name } = req.body;
    console.log("category", category_name);
    if (!category_name) {
      return res.status(400).send({
        success: false,
        message: "Provide the category name to search",
      });
    }

    // Find the category by name
    const category = await Category.findOne({
      name: { $regex: category_name, $options: "i" },
    });

    if (!category) {
      return res.status(404).send({
        success: false,
        message: "No matching category found",
      });
    }

    // Return only the category name
    return res.status(200).send({
      success: true,
      message: "Category found",
      category: {
        _id: category._id,
        name: category.name,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};
