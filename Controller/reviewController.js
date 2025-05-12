const Review = require("../Model/review");
const path = require("path");
const fs = require("fs");
// const fsPromises = fs.promises;
exports.CreateReview = async (req, res) => {
  try {
    // const { productId, userId, rating, comment, username } = req.body;

    if (req.files.images && req.files.images.length > 0) {
      req.body.images = req.files.images.map(
        (file) => `Uploads/${file.filename}`
      );
    }
    const product = await Review.create(req.body);

    res.status(201).json({ success: true, review: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.GetReviewProduct = async (req, res) => {
  try {
    let { productId } = req.params;
    productId = productId.trim(); // Now no error.

    const reviews = await Review.find({ productId });

    if (reviews.length === 0) {
      return res
        .status(404)
        .json({ message: "No reviews found for this product" });
    }

    res.status(200).json({ data: reviews });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch reviews", error: error.message });
  }
};

exports.GetAllReview = async (req, res) => {
  try {
    const review = await Review.find().sort({ createdAt: -1 });

    if (review.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "review Not Found" });
    }

    res.status(200).json({
      status: true,
      message: "review Fetch Successfully",
      data: review,
    });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
};

exports.DeleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res
        .status(404)
        .json({ status: false, message: "review Not Found" });
    }
    if (review.image) {
      const imagepath = path.join(
        __dirname,
        "../Uploads",
        path.basename(review.image)
      );
      if (fs.existsSync(imagepath)) {
        fs.unlink(imagepath, (err) => {
          if (err) {
            console.err("Failed to delete image", err);
          }
        });
      }
    }
    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: true,
      message: "review  Delete Successfuly  ",
      data: review,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: false, error: err.message });
  }
};

exports.UpdateReview = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the existing product
    const review = await Review.findById(id);
    if (!review) {
      return res
        .status(404)
        .json({ status: false, message: "Review not found" });
    }
    const { images, ...updateFields } = req.body;
    const updatedReview = await Review.findByIdAndUpdate(
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
      await Review.findByIdAndUpdate(
        id,
        { $push: { images: { $each: newImages } } },
        { new: true }
      );
    }

    // Fetch and return the updated product
    const finalReview = await Review.findById(id);
    res
      .status(200)
      .json({
        status: true,
        message: "Review Updated Successfully",
        data: finalReview,
      });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ status: false, error: err.message });
  }
};

exports.deletedReviewimage = async (req, res) => {
  try {
    const { imagePath, reviewId } = req.body;

    console.log("Received data for deletion:", { imagePath, reviewId });

    if (!imagePath || !reviewId) {
      return res.status(400).json({ message: "Missing required data" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Remove image from review.images array
    review.images = review.images.filter((img) => img !== imagePath);
    await review.save();

    // Construct the full file path
    const filePath = path.join(__dirname, "..", imagePath);

    // Delete the file from the filesystem
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log("File deleted successfully:", filePath);
        }
      });
    } else {
      console.warn("Image file not found on disk:", filePath);
    }

    return res.status(200).json({
      message: "Image removed from review and deleted from server",
    });
  } catch (error) {
    console.error("Error deleting review image:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
