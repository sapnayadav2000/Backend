
const Cart = require('../Model/cart');
const User=require('../Model/user');
const Product=require('../model/product');
// exports. addToCart = async (req, res) => {
//     try {
//         console.log("Incoming Request Body:", req.body); // Debugging

//         // Validate user ID
//         if (!req.body.userId) {
//             return res.status(400).json({ success: false, message: "User ID is required" });
//         }

//         // Fetch user details
//         const userDoc = await User.findById(req.body.userId);
//         if (!userDoc) {
//             return res.status(404).json({ success: false, message: "User not found" });
//         }
//         const username = userDoc.name; // Assign user's name

//         // Validate product ID
//         if (!req.body.productId) {
//             return res.status(400).json({ success: false, message: "Product ID is required" });
//         }

//         // Fetch product details
//         const productDoc = await Product.findById(req.body.productId);
//         if (!productDoc) {
//             return res.status(404).json({ success: false, message: "Product not found" });
//         }

//         // Assign product details
//         const productname = productDoc.name; // Default if missing
//         const price = productDoc.price;

//         console.log("Fetched Product Name:", productname); // Debugging

//         // Ensure quantity is provided and valid
//         const quantity = req.body.quantity;
//         if (!quantity || quantity < 1) {
//             return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
//         }

//         let cart = await Cart.findOne({ userId: req.body.userId });

//         if (!cart) {
//             // Create a new cart if it doesn't exist
//             cart = new Cart({
//                 userId: req.body.userId,
//                 username: username,
//                 items: [{
//                     productId: req.body.productId,
//                     productname: productname, // Ensure product name is stored
//                     quantity: quantity,
//                     price,
//                     selectedSize,
//                 }],
//                 totalItems: 1,
//                 totalPrice: quantity * price,
//             });
//         } else {
//             // If cart exists, check if the item is already in the cart
//             const existingItem = cart.items.find(item => item.productId.toString() === req.body.productId);

//             if (existingItem) {
//                 // Update quantity if item already exists
//                 existingItem.quantity += quantity;
//             } else {
//                 // Add new item to cart
//                 cart.items.push({
//                     productId: req.body.productId,
//                     productname: productname, // Ensure product name is stored
//                     quantity: quantity,
//                     price: price,
//                 });
//             }

//             // Recalculate total items and total price
//             cart.totalItems = cart.items.length;
//             cart.totalPrice = cart.items.reduce((total, item) => total + item.quantity * item.price, 0);
//         }

//         await cart.save();
//         console.log("Cart Saved:", cart); // Debugging
//         res.status(200).json({ success: true, message: "Cart updated successfully", cart });

//     } catch (err) {
//         console.error("Error:", err); // Debugging
//         res.status(500).json({ success: false, message: err.message });
//     }
// };

exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, selectedSize, price } = req.body;

    console.log("Incoming Request Body:", req.body);

    if (!userId || !productId || !quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: "Invalid request data" });
    }

    const userDoc = await User.findById(userId);
    if (!userDoc) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const productDoc = await Product.findById(productId);
    if (!productDoc) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const productname = productDoc.name;
    const originalPrice = productDoc.price;
    const offerPrice = productDoc.offerPrice && productDoc.offerPrice > 0 && productDoc.offerPrice < originalPrice
      ? productDoc.offerPrice
      : originalPrice;

    const finalPrice = price || offerPrice;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        userId,
        username: userDoc.name,
        items: [{
          productId,
          productname,
          quantity,
          price: finalPrice,
          offerPrice,
          selectedSize,
        }],
        totalItems: 1,
        totalPrice: quantity * finalPrice,
      });
    } else {
      // Step 1: Check if product already exists in the cart
      const existingItem = cart.items.find(
        item => item.productId.toString() === productId && item.selectedSize === selectedSize
      );

      if (existingItem) {
        // If found, return an error message (409 Conflict)
        return res.status(409).json({ success: false, message: "Product already in cart" });
      }

      // Step 2: If not found, update the cart
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
    console.log("Cart Saved:", cart);
    res.status(200).json({ success: true, message: "Cart updated successfully", cart });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};




  
  

exports.getCart = async (req, res) => {
  try {
    const id = req.params.id;

    const cart = await Cart.findById(id)
      .populate('userId')
      .populate('items.productId'); // ✅ populate product details

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
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ success: false, message: "Please provide the userId" });
      }
  
      const cart = await Cart.findOne({ userId });
  
      if (!cart || !cart.items || cart.items.length === 0) {
        return res.status(200).json({ success: true, message: "Cart is empty", data: 0 });
      }
  
      const totalCount = cart.items.reduce((total, item) => total + item.quantity, 0);
      return res.status(200).json({ success: true, message: "Cart count retrieved", data: totalCount });
  
    } catch (error) {
      console.error("Error in cartCount:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
  

// exports. cartRemove = async (req, res) => {
//     try {
//         const cart= await Cart.findById(req.params.id);
//         if (!cart) {
//           return res
//             .status(404)
//             .json({ status: false, message: "cart Not Found" });
//         }
        
//         await Cart.findByIdAndDelete(req.params.id);
    
//         res
//           .status(200)
//           .json({
//             status: true,
//             message: "cart  Delete Successfuly  ",
//             data: cart,
//           });
//       } catch (err) {
//         console.log(err);
//         res.status(500).json({ status: false, error: err.message });
//       }
// };
exports.removeCartItem = async (req, res) => {
    const { cartId, itemId } = req.params;

    try {
        const cart = await Cart.findById(cartId);
        if (!cart) {
            return res.status(404).json({ status: false, message: "Cart not found" });
        }

        // Filter out the item
        cart.items = cart.items.filter(item => item._id.toString() !== itemId);

        // Update totalPrice and totalItems
        cart.totalItems = cart.items.length;
        cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        await cart.save();

        res.status(200).json({
            status: true,
            message: "Item removed from cart successfully",
            data: cart
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: err.message });
    }
};
exports. getAllCart = async (req, res) => {
    try {
      const cart = await Cart.find({ userId: req.user._id })
            .populate("items.productId", "images name price"); // ✅ Correct path
        
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

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
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
      (total, item) => total + (item.quantity * item.price),
      0
    );

    await cart.save();

    res.status(200).json({ success: true, message: "Quantity updated", cart });

  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    res.status(500).json({ message: 'Failed to update cart item' });
  }
};

