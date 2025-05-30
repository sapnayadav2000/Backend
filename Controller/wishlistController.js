const Wishlist = require("../Model/wishlist");

exports.addToWishlist = async (req, res) => {
  try {
    console.log("User:", req.user);
    const { userId } = req.params; // ✅ Ensure userId is obtained from URL
    const { productId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, products: [] });
    }

    // Check if product already exists
    const exists = wishlist.products.some(
      (item) => item.productId.toString() === productId
    );
    if (!exists) {
      wishlist.products.push({ productId });
      await wishlist.save();
    }

    res.json({ success: true, data: wishlist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.params.userId })
      .populate("products.productId", "name price images productkey Sortdescription")
      .exec();

    if (!wishlist) {
      return res.json({ userId: req.params.userId, products: [] });
    }

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.updateWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId } = req.body;

    if (!productId) {
      return res
        .status(400)
        .json({ status: false, message: "Product ID is required" });
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, products: [{ productId }] });
    } else {
      // Ensure the productId is stored correctly in products array
      const productExists = wishlist.products.some(
        (item) => item.productId.toString() === productId
      );

      if (productExists) {
        wishlist.products = wishlist.products.filter(
          (item) => item.productId.toString() !== productId
        ); // Remove product
      } else {
        wishlist.products.push({ productId });
      }
    }

    await wishlist.save();

    // Fetch updated wishlist with product details
    const updatedWishlist = await Wishlist.findOne({ userId }).populate({
      path: "products.productId",
      select: "name price images",
    });

    console.log("Updated Wishlist:", updatedWishlist);

    res.status(200).json({
      status: true,
      message: "Wishlist updated successfully",
      data: updatedWishlist,
    });
  } catch (error) {
    console.error("Error updating wishlist:", error);
    res.status(500).json({ status: false, error: error.message });
  }
};

exports.deleteWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.params.userId });
    if (!wishlist)
      return res.status(404).json({ message: "Wishlist not found" });

    wishlist.products = wishlist.products.filter(
      (item) => item.productId.toString() !== req.params.productId
    );
    await wishlist.save();

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getAllWishlist = async (req, res) => {
  try {
    const wishlists = await Wishlist.find({})
      .populate({
        path: "userId",
        select: "name email", // ✅ Ensuring userId is fully populated
      })
      .populate({
        path: "products.productId",
        select: "name price images productkey Sortdescription",
      })
      .exec(); // ✅ Ensure execution of query

    res.status(200).json({ success: true, data: wishlists });
  } catch (error) {
    console.error("Error fetching wishlists:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching wishlists",
        error: error.message,
      });
  }
};
exports.getWishlistCount = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const wishlist = await Wishlist.findOne({ userId });

    const count = wishlist ? wishlist.products.length : 0;

    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.MyWhislist = async (req, res) => {
  const userId = req.user._id;

  try {
    // Find user's wishlist and populate the packages
    let wishlist = await Wishlist.findOne({ userId: userId })
      .populate({
        path: "userId",
        select: "name email", // ✅ Ensuring userId is fully populated
      })
      .populate({
        path: "products.productId",
        select: "name  Originalprice price images productkey Sortdescription",
      });

    if (!wishlist) {
      return res
        .status(404)
        .json({ success: false, message: "Wishlist not found" });
    }

    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
