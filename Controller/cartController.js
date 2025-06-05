const Cart = require("../Model/cart");
const User = require("../Model/user");
const Product = require("../model/product");
exports.addToCart = async (req, res) => {
  try {
    const { sessionId, userId, productId, quantity, selectedSize, price } = req.body;

    if (!sessionId || !productId || !quantity || quantity < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request data" });
    }

    console.log("Incoming Request Body:", req.body);

    const userDoc = userId ? await User.findById(userId) : null;
    const productDoc = await Product.findById(productId);
    if (!productDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const productname = productDoc.name;
    const originalPrice = productDoc.price;
    const offerPrice =
      productDoc.offerPrice &&
      productDoc.offerPrice > 0 &&
      productDoc.offerPrice < originalPrice
        ? productDoc.offerPrice
        : originalPrice;
    const finalPrice = price || offerPrice;

    // 🛒 Try finding a cart by sessionId or userId
    let cart = await Cart.findOne(userId ? { userId } : { sessionId });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        userId: userId || null,
        sessionId,
       username: userDoc ? `${userDoc.firstName || ''} ${userDoc.lastName || ''}`.trim() : null,
        items: [
          {
            productId,
            productname,
            quantity,
            price: finalPrice,
            offerPrice,
            selectedSize,
          },
        ],
        totalItems: 1,
        totalPrice: quantity * finalPrice,
      });
    } else {
      const existingItem = cart.items.find(
        (item) =>
          item.productId.toString() === productId &&
          item.selectedSize === selectedSize
      );
      if (existingItem) {
        return res
          .status(409)
          .json({ success: false, message: "Product already in cart" });
      }

      cart.items.push({
        productId,
        productname,
        quantity,
        price: finalPrice,
        offerPrice,
        selectedSize,
      });

      cart.totalItems = cart.items.length;
      cart.totalPrice = cart.items.reduce(
        (total, item) => total + item.quantity * item.price,
        0
      );
    }

    await cart.save();
    res
      .status(200)
      .json({ success: true, message: "Cart added successfully", cart });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const id = req.params.id;

    const cart = await Cart.findById(id)
      .populate("userId")
      .populate("items.productId"); // ✅ populate product details

    if (!cart) {
      return res.status(404).json({
        status: false,
        message: "Cart not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "cart Fetch Successfully",
      data: cart,
    });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ status: false, error: err.message });
  }
};
exports.cartCount = async (req, res) => {
  try {
    const { userId, sessionId } = req.query;

    if (!userId && !sessionId) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide either userId or sessionId" });
    }

    const cart = await Cart.findOne(userId ? { userId } : { sessionId });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: "Cart is empty", data: 0 });
    }

    const totalCount = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    return res.status(200).json({
      success: true,
      message: "Cart count retrieved",
      data: totalCount,
    });
  } catch (error) {
    console.error("Error in cartCount:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};


exports.removeCartItem = async (req, res) => {
  const { cartId, itemId } = req.params;

  try {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ status: false, message: "Cart not found" });
    }

    // Filter out the item
    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

    // Update totalPrice and totalItems
    cart.totalItems = cart.items.length;
    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({
      status: true,
      message: "Item removed from cart successfully",
      data: cart,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: err.message });
  }
};
exports.getAllCart = async (req, res) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.query.sessionId || req.headers["x-session-id"]; // optional ways to send sessionId

    let cart;

    if (userId) {
      cart = await Cart.findOne({ userId }).populate(
        "items.productId",
        "images name price"
      );
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId }).populate(
        "items.productId",
        "images name price"
      );
    } else {
      return res
        .status(400)
        .json({
          status: false,
          message: "No user or session identifier provided",
        });
    }

    res.status(200).json({
      status: true,
      message: "Cart retrieved successfully",
      data: cart,
    });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
};

exports.UpdatedQunatity = async (req, res) => {
  const { cartId, itemId } = req.params;
  const { quantity } = req.query;

  try {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Update item quantity (ensure it's a valid number)
    const newQty = parseInt(quantity, 10);
    if (isNaN(newQty) || newQty < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    cart.items[itemIndex].quantity = newQty;

    // Recalculate total price
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );

    await cart.save();

    res.status(200).json({ success: true, message: "Quantity updated", cart });
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    res.status(500).json({ message: "Failed to update cart item" });
  }
};

exports.mergeCartToUser = async (req, res) => {
  const { sessionId, userId } = req.body;

  if (!sessionId || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Missing sessionId or userId" });
  }

  try {
    const sessionCart = await Cart.findOne({ sessionId });
    if (!sessionCart || sessionCart.items.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: "No session cart to merge" });
    }

    let userCart = await Cart.findOne({ userId });

    if (!userCart) {
      // No cart for user: reassign session cart
      sessionCart.userId = userId;
      // sessionCart.sessionId = null;
     sessionCart.username = req.user
  ? `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim()
  : null;


      // Clean duplicates in session cart before saving
      const uniqueMap = new Map();
      sessionCart.items.forEach((item) => {
        const key = `${item.productId.toString()}_${item.selectedSize}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, { ...item.toObject() });
        } else {
          uniqueMap.get(key).quantity += item.quantity;
        }
      });
      sessionCart.items = Array.from(uniqueMap.values());

      sessionCart.totalItems = sessionCart.items.length;
      sessionCart.totalPrice = sessionCart.items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );

      await sessionCart.save();
    } else {
      // Merge into existing user cart
      const itemMap = new Map();

      // Add existing user cart items
      userCart.items.forEach((item) => {
        const key = `${item.productId.toString()}_${item.selectedSize}`;
        itemMap.set(key, { ...item.toObject() });
      });

      // Merge with session cart items
      sessionCart.items.forEach((item) => {
        const key = `${item.productId.toString()}_${item.selectedSize}`;
        if (itemMap.has(key)) {
          itemMap.get(key).quantity += item.quantity;
        } else {
          itemMap.set(key, { ...item.toObject() });
        }
      });

      // Update cart
      userCart.items = Array.from(itemMap.values());
      userCart.totalItems = userCart.items.length;
      userCart.totalPrice = userCart.items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );

      await userCart.save();

      // Delete session cart after merging
      // await Cart.deleteOne({ _id: sessionCart._id });
    }

    res
      .status(200)
      .json({ success: true, message: "Cart merged successfully" });
  } catch (err) {
    console.error("Error merging carts:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// exports.mergeCartToUser = async (req, res) => {
//   const { sessionId, userId } = req.body;

//   if (!sessionId || !userId) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Missing sessionId or userId" });
//   }

//   try {
//     const sessionCart = await Cart.findOne({ sessionId });
//     if (!sessionCart || sessionCart.items.length === 0) {
//       return res
//         .status(200)
//         .json({ success: true, message: "No session cart to merge" });
//     }

//     let userCart = await Cart.findOne({ userId });

//     if (!userCart) {
//       // Reassign session cart to user
//       sessionCart.userId = userId;
//       sessionCart.username = req.user
//         ? `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim()
//         : null;

//       // De-duplicate session cart
//       const uniqueMap = new Map();
//       for (const item of sessionCart.items) {
//         const key = `${item.productId}_${item.selectedSize}`;
//         if (!uniqueMap.has(key)) {
//           uniqueMap.set(key, item);
//         } else {
//           uniqueMap.get(key).quantity += item.quantity;
//         }
//       }

//       sessionCart.items = [...uniqueMap.values()];
//       sessionCart.totalItems = sessionCart.items.length;
//       sessionCart.totalPrice = sessionCart.items.reduce(
//         (sum, item) => sum + item.quantity * item.price,
//         0
//       );

//       await sessionCart.save({ validateBeforeSave: false }); // ✅ avoid version conflict
//     } else {
//       // Merge items
//       const itemMap = new Map();
//       for (const item of userCart.items) {
//         const key = `${item.productId}_${item.selectedSize}`;
//         itemMap.set(key, item);
//       }

//       for (const item of sessionCart.items) {
//         const key = `${item.productId}_${item.selectedSize}`;
//         if (itemMap.has(key)) {
//           itemMap.get(key).quantity += item.quantity;
//         } else {
//           itemMap.set(key, item);
//         }
//       }

//       userCart.items = Array.from(itemMap.values());
//       userCart.totalItems = userCart.items.length;
//       userCart.totalPrice = userCart.items.reduce(
//         (sum, item) => sum + item.quantity * item.price,
//         0
//       );

//       await userCart.save({ validateBeforeSave: false }); // ✅ prevent __v conflict
//     }

//     return res.status(200).json({ success: true, message: "Cart merged successfully" });
//   } catch (err) {
//     console.error("Error merging carts:", err);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };
