const Category = require("../model/category");

const path = require("path");
const fs = require("fs");
exports.CreateCategory = async (req, res) => {
  try {
    req.body.image = `Uploads/${req.file?.filename}`;
    const category = await Category.create(req.body);
    res
      .status(201)
      .json({ status: true, message: "Category Create", data: category });
  } catch (err) {
    res.status(400).json({ status: false, error: err.message });
  }
};
exports.UpdateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ status: false, message: "Category Not Found" });
    }

    // Handle image update
    if (req.file) {
      const newImagePath = `Uploads/${req.file.filename}`;

      // Remove old image if it exists
      if (category.image) {
        const oldFilePath = path.join(__dirname, "../", category.image);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath); // Deletes the old image
        }
      }

      // Assign new image path
      category.image = newImagePath;
    }

    // Update other fields
    Object.assign(category, req.body);
    await category.save();

    res.status(200).json({
      status: true,
      message: "Category Updated Successfully",
      data: category,
    });
  } catch (err) {
    res.status(400).json({ status: false, error: err.message });
  }
};

exports.DeleteCategory = async (req, res) => {
 
  try {
    const categoryId = req.params.id;
    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ status: false, message: "Category Not Found" });
    }
    if (category.image) {
      const imagepath = path.join(
        __dirname,
        "../Uploads",
        path.basename(category.image)
      );
      if (fs.existsSync(imagepath)) {
        fs.unlink(imagepath, (err) => {
          if (err) {
            console.err("Failed to delete image", err);
          }
        });
      }
    }
    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: true, message: "Category  Deleted " });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
};

exports.GetAllCategory = async (req, res) => {
 
  try {
    const category = await Category.find().sort({ createdAt: -1 });
    if (category.length == 0) {
      return res
        .status(404)
        .json({ status: false, message: "Category Not Found" });
    }
    res
      .status(200)
      .json({
        status: true,
        message: "Category Fetch Successfully ",
        data: category,
      });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
};

exports.GetByIdCategory = async (req, res) => {
 
  try {
    const id = req.params.id;
    const category = await Category.findById(id);
    if (category.length == 0) {
      return res
        .status(404)
        .json({ status: false, message: "Category Not Found" });
    }
    res
      .status(200)
      .json({
        status: true,
        message: "category Fetch Successfully",
        data: category,
      });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
};
