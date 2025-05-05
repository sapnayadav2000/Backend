const Notification = require("../Model/notification");
const path = require("path");
const fs = require("fs");

exports.createNotification = async (req, res) => {
  try {
    req.body.image = `Uploads/${req.file?.filename}`;
    const notification = await Notification.create(req.body);
    res
      .status(201)
      .json({
        status: true,
        message: "Notification Created ",
        data: notification,
      });
  } catch (err) {
    res.status(400).json({ status: false, error: err.message });
  }
};

exports.getAllNotification = async (req, res) => {
  try {
    let filter = {};

    if (req.user && req.user.userType !== "Admin") {
      filter.status = "Active";
    }

    const notification = await Notification.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      status: true,
      message: "Notification Fetch Successfully",
      data: notification,
    });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res
        .status(404)
        .json({ status: false, message: "Notification Not Found" });
    }
    if (notification.image) {
      const imagepath = path.join(
        __dirname,
        "../Uploads",
        path.basename(notification.image)
      );
      if (fs.existsSync(imagepath)) {
        fs.unlink(imagepath, (err) => {
          if (err) {
            console.err("Failed to delete image", err);
          }
        });
      }
    }
    await Notification.findByIdAndDelete(req.params.id);

    res
      .status(200)
      .json({
        status: true,
        message: "Notification  Delete Successfuly  ",
        data: notification,
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: false, error: err.message });
  }
};

exports.updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res
        .status(404)
        .json({ status: false, message: "Notification Not Found" });
    }

    // Handle image update
    if (req.file) {
      const newImagePath = `Uploads/${req.file.filename}`;

      // Remove old image if it exists
      if (notification.image) {
        const oldFilePath = path.join(__dirname, "../", notification.image);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath); // Deletes the old image
        }
      }

      // Assign new image path
      notification.image = newImagePath;
    }

    // Update other fields
    Object.assign(notification, req.body);
    await notification.save();

    res.status(200).json({
      status: true,
      message: "Notification Updated Successfully",
      data: notification,
    });
  } catch (err) {
    res.status(400).json({ status: false, error: err.message });
  }
};

exports.getNotification = async (req, res) => {
 

  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return res
        .status(404)
        .json({ status: false, message: "Notification Not Found" });
    }
    res
      .status(200)
      .json({
        status: true,
        message: "Notification Fetch successfully ",
        data: notification,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, error: err.message });
  }
};
