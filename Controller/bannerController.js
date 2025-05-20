const Banner = require("../Model/banner");
const fs = require("fs");
const path = require("path");
exports.create = async (req, res) => {
  try {
    req.body.image = `Uploads/${req.file?.filename}`;

    const banner = await Banner.create(req.body);

    res
      .status(201)
      .json({ status: true, message: "Banner Created ", data: banner });
  } catch (err) {
    res.status(400).json({ status: false, error: err.message });
  }
};



exports.getAll = async (req, res) => {
  try {
    const currentDate = new Date();

    // Auto-deactivate expired banners
    await Banner.updateMany(
      { endDate: { $lt: currentDate }, status: "Active" },
      { $set: { status: "Inactive" } }
    );

    // Build filter
    let filter = {};
    if (req.user && req.user.userType !== "Admin") {
      filter = {
        status: "Active",
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
      };
    }

    const banner = await Banner.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      status: true,
      message: "Banner Fetch Successfully",
      data: banner,
    });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
};



exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);

    if (!banner) {
      return res
        .status(404)
        .json({ status: false, message: "Banner Not Found" });
    }
    res.status(200).json({
      status: true,
      message: "Banner Fetch Successfully",
      data: banner,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res
        .status(404)
        .json({ status: false, message: "Banner Not Found" });
    }
    if (banner.image) {
      const imagepath = path.join(
        __dirname,
        "../Uploads",
        path.basename(banner.image)
      );
      if (fs.existsSync(imagepath)) {
        fs.unlink(imagepath, (err) => {
          if (err) {
            console.err("Failed to delete image", err);
          }
        });
      }
    }
    await Banner.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: true,
      message: "Banner Delete Successfuly",
      data: banner,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: false, error: err.message });
  }
};
exports.update = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res
        .status(404)
        .json({ status: false, message: "Banner Not Found" });
    }

    // Handle image update
    if (req.file) {
      const newImagePath = `Uploads/${req.file.filename}`;

      // Check if an old image exists, then delete it
      if (banner.image) {
        const oldFilePath = path.join(__dirname, "../", banner.image);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath); // Deletes the old image
        }
      }

      // Update banner image with the new image path
      banner.image = newImagePath;
    }

    // Update other fields
    Object.assign(banner, req.body);
    await banner.save();

    res.status(200).json({
      status: true,
      message: "Banner Updated Successfully",
      data: banner,
    });
  } catch (err) {
    res.status(400).json({ status: false, error: err.message });
  }
};
