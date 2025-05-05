const Brand = require("../model/brand");

const path = require("path");
const fs = require("fs");
exports.CreateBrand = async (req, res) => {
  try {
    req.body.image = `Uploads/${req.file?.filename}`;

    const brand = await Brand.create(req.body);

    res
      .status(201)
      .json({ status: true, message: "Brand Created ", data: brand });
  } catch (err) {
    res.status(400).json({ status: false, error: err.message });
  }
};

exports.UpdateBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ status: false, message: "Brand Not Found" });
    }

    // Handle image update
    if (req.file) {
      const newImagePath = `Uploads/${req.file.filename}`;

      // Remove old image if it exists
      if (brand.image) {
        const oldFilePath = path.join(__dirname, "../", brand.image);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath); // Deletes the old image
        }
      }

      // Assign new image path
      brand.image = newImagePath;
    }

    // Update other fields
    Object.assign(brand, req.body);
    await brand.save();

    res.status(200).json({
      status: true,
      message: "Brand Updated Successfully",
      data: brand,
    });
  } catch (err) {
    res.status(400).json({ status: false, error: err.message });
  }
};


exports.GetAllBrand = async (req, res) => {
  try {
    const brand = await Brand.find().sort({ createdAt: -1 });

    if (brand.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "Brand Not Found" });
    }

    res
      .status(200)
      .json({
        status: true,
        message: "Brand Fetch Successfully ",
        data: brand,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, error: err.message });
  }
};

exports.DeleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res
        .status(404)
        .json({ status: false, message: "brand Not Found" });
    }
    if (brand.image) {
      const imagepath = path.join(
        __dirname,
        "../Uploads",
        path.basename(brand.image)
      );
      if (fs.existsSync(imagepath)) {
        fs.unlink(imagepath, (err) => {
          if (err) {
            console.err("Failed to delete image", err);
          }
        });
      }
    }
    await Brand.findByIdAndDelete(req.params.id);

    res
      .status(200)
      .json({
        status: true,
        message: "brand  Delete Successfuly  ",
        data: brand,
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: false, error: err.message });
  }
};

exports.GetByIdBrand = async (req, res) => {


  try {
    const { id } = req.params;
    const brand = await Brand.findById(id);

    if (!brand) {
      return res
        .status(404)
        .json({ status: false, message: "Brand  Not Found" });
    }
    res
      .status(200)
      .json({
        status: true,
        message: " Brand Fetch Successfully ",
        data: brand,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, error: err.message });
  }
};
