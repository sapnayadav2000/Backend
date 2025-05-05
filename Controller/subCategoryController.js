const SubCategory = require("../model/subCategory");
const Category = require("../model/category");

const path = require("path");
const fs = require("fs");
exports.CreateSubCategory = async (req, res) => {
  try {
    // Check if category ID is provided
    if (!req.body.Category) {
      return res
        .status(400)
        .json({ status: false, message: "Category ID is required" });
    }

    // Find the category by ID
    const categoryDoc = await Category.findById(req.body.Category);

    if (!categoryDoc) {
      return res
        .status(404)
        .json({ status: false, message: "Category not found" });
    }

    // Assign category name
    req.body.Categoryname = categoryDoc.name;

    // Assign image path if uploaded
    if (req.file) {
      req.body.image = `Uploads/${req.file.filename}`;
    }

    // Create the subcategory
    const subCat = await SubCategory.create(req.body);

    res
      .status(201)
      .json({ status: true, message: "SubCategory created", data: subCat });
  } catch (err) {
    res.status(400).json({ status: false, error: err.message });
  }
};
exports.UpdateSubCategory = async (req, res) => {
  try {
    const subCat = await SubCategory.findById(req.params.id);
    if (!subCat) {
      return res
        .status(404)
        .json({ status: false, message: "Subcategory Not Found" });
    }

    // Handle image update
    if (req.file) {
      const newImagePath = `Uploads/${req.file.filename}`;

      // Remove old image if it exists
      if (subCat.image) {
        const oldFilePath = path.join(__dirname, "../", subCat.image);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath); // Deletes the old image
        }
      }

      // Assign new image path
      subCat.image = newImagePath;
    }

    // Update other fields
    Object.assign(subCat, req.body);
    await subCat.save();

    res.status(200).json({
      status: true,
      message: "SubCategory Updated Successfully",
      data: subCat,
    });
  } catch (err) {
    res.status(400).json({ status: false, error: err.message });
  }
};
exports.DeleteSubCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const SubCat = await SubCategory.findById(id);
    if (!SubCat) {
      return res
        .status(404)
        .json({ status: false, message: "SubCategory Not  Found" });
    }
    if (SubCat.image) {
      const imagepath = path.join(
        __dirname,
        "../Uploads",
        path.basename(SubCat.image)
      );
      if (fs.existsSync(imagepath)) {
        fs.unlink(imagepath, (err) => {
          if (err) {
            console.err("Failed to delete image", err);
          }
        });
      }
    }
    await SubCategory.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: true, message: " SubCategory deleted " });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
};

exports.GetAllSubCategory = async (req, res) => {
  try {
    const SubCat = await SubCategory.find().sort({ created: -1 });

    if (SubCat.length == 0) {
      return res
        .status(404)
        .json({ status: false, message: "Subcategory Not Found" });
    }
    res
      .status(200)
      .json({
        status: true,
        messaage: "Subcategory Fetch Successfully",
        data: SubCat,
      });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
};

exports.GetByIdSubCategory = async (req, res) => {

  try {
    const id = req.params.id;
    const SubCat = await SubCategory.findById(id);
    if (SubCat.length == 0) {
      return res
        .status(404)
        .json({ status: false, message: "Subcategory Not Found" });
    }
    res
      .status(200)
      .json({
        status: true,
        messaage: "Subcategory Fetch Successfully",
        data: SubCat,
      });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
};




