
// const Order = require('../Model/orders');
// const Product = require("../model/product");
// const User=require('../Model/user')
// const UserAddress=require('../Model/userAddress')
// // exports . orderItem = async (req, res) => {
// //   try {
// //     console.log("Order data received:", req.body);
// //     const { userId, products } = req.body;

// //     // Validate User
// //     const user = await User.findById(userId);
// //     if (!user) {
// //       return res.status(404).json({ error: "User not found" });
// //     }

// //     // Ensure user has a complete primary address
// //     if (!user.city || !user.state || !user.pincode) {
// //       return res.status(400).json({ error: "User primary address is incomplete" });
// //     }

// //     // Fetch user's additional address (Optional)
// //     const userAddress = await UserAddress.findOne({ user: userId, status: "Active" });

// //     let anotheraddress = null; // Default to null if no additional address is provided
// //     if (userAddress) {
// //       anotheraddress = {
// //         address: userAddress.address || "",
// //         landmark: userAddress.landmark || "",
// //         city: userAddress.city || "",
// //         state: userAddress.state || "",
// //         postalCode: userAddress.postalCode || "",
// //         country: userAddress.country || "",
// //       };
// //     }
// //     let totalAmount = 0;
// //     let orderItems = [];
    
// //     for (const item of products) {
// //       const product = await Product.findById(item.productId);
// //       if (!product) {
// //         return res.status(404).json({ error: `Product ${item.productId} not found` });
// //       }
    
// //       if (!product.productkey || !Array.isArray(product.productkey)) {
// //         return res.status(400).json({ error: `Product ${product.name} has no stock information` });
// //       }
    
// //       // ✅ Find total available stock across all sizes
// //       let availableQuantity = product.productkey.reduce((acc, p) => acc + (p.Quantity || 0), 0);
// //       if (item.quantity > availableQuantity) {
// //         return res.status(400).json({ error: `Not enough stock for product ${product.name}` });
// //       }
    
// //       // ✅ Find the correct product key for the selected size
// //       let productKey = item.size
// //         ? product.productkey.find(p => p.Size === item.size)
// //         : product.productkey[0]; // If no size provided, pick the first variant
    
// //       if (!productKey) {
// //         return res.status(400).json({ error: `Size ${item.size} not available for product ${product.name}` });
// //       }
    
// //       if (item.quantity > productKey.Quantity) {
// //         return res.status(400).json({ error: `Not enough stock for ${product.name} (Size: ${item.size})` });
// //       }
    
// //       if (item.quantity < 1) {
// //         return res.status(400).json({ error: `Invalid quantity for ${product.name}` });
// //       }
    
// //       // ✅ Deduct stock from the correct size variant
// //       productKey.Quantity -= item.quantity;
// //       await product.save();
    
// //       const finalPrice = productKey.OfferPrice && productKey.OfferPrice > 0
// //       ? product.price - productKey.OfferPrice  // Deduct discount
// //       : product.price;  // Use regular price if no discount
    
// //     orderItems.push({
// //       productId: item.productId,
// //       size: item.size || "N/A",
// //       quantity: item.quantity,
// //       price: finalPrice, // Corrected price
// //       images: product.images[0]
// //     });
    
// //     totalAmount += finalPrice * item.quantity; 
// //   }

// //     // ✅ Store proper address object instead of string
// //     const order = new Order({
// //       userId,
// //       products: orderItems,
// //       totalAmount,
// //       address: {
// //         street: user.street,
// //         username: user.username,
// //         address: user.address,
// //         city: user.city,
// //         state: user.state,
// //         pincode: user.pincode,
// //         country: user.country,
// //       },
// //       anotheraddress, // Will be `null` if userAddress is not found
// //       status: "pending",
// //       paymentStatus: "pending",
// //     });
// //   console.log('orders',order);
// //     await order.save();
// //     res.status(201).json({ message: "Order placed successfully", order });
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ error: "Server error" });
// //   }
// // };
// exports.orderItem = async (req, res) => {
//   try {
//     console.log("Order data received:", req.body);
  
//     const { userId, products, shippingAddress,payementMethod  } = req.body;  // <-- Add shippingAddress from request
   
//       // console.log('Shipping Address Name:', shippingAddress?.name);
//     // Validate User
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Ensure user has a complete primary address
//     if (!user.city || !user.state || !user.pincode) {
//       return res.status(400).json({ error: "User primary address is incomplete" });
//     }

//     // Fetch user's additional address (Optional)
//     const userAddress = await UserAddress.findOne({ user: userId, status: "Active" });

//     let anotheraddress = null; // Default to null if no additional address is provided  it is for alternative address
//     if (userAddress) {
//       anotheraddress = {
       
//         address: userAddress.address || "",
//         landmark: userAddress.landmark || "",
//         city: userAddress.city || "",
//         state: userAddress.state || "",
//         postalCode: userAddress.postalCode || "",
//         country: userAddress.country || "",
//       };
//     }

//     let totalAmount = 0;
//     let orderItems = [];
    
//     for (const item of products) {
//       const product = await Product.findById(item.productId);
//       if (!product) {
//         return res.status(404).json({ error: `Product ${item.productId} not found` });
//       }
    
//       if (!product.productkey || !Array.isArray(product.productkey)) {
//         return res.status(400).json({ error: `Product ${product.name} has no stock information` });
//       }
    
//       // ✅ Find total available stock across all sizes
//       let availableQuantity = product.productkey.reduce((acc, p) => acc + (p.Quantity || 0), 0);
//       if (item.quantity > availableQuantity) {
//         return res.status(400).json({ error: `Not enough stock for product ${product.name}` });
//       }
    
//       // ✅ Find the correct product key for the selected size
//       let productKey = item.size
//         ? product.productkey.find(p => p.Size === item.size)
//         : product.productkey[0]; // If no size provided, pick the first variant
    
//       if (!productKey) {
//         return res.status(400).json({ error: `Size ${item.size} not available for product ${product.name}` });
//       }
    
//       if (item.quantity > productKey.Quantity) {
//         return res.status(400).json({ error: `Not enough stock for ${product.name} (Size: ${item.size})` });
//       }
    
//       if (item.quantity < 1) {
//         return res.status(400).json({ error: `Invalid quantity for ${product.name}` });
//       }
    
//       // ✅ Deduct stock from the correct size variant
//       productKey.Quantity -= item.quantity;
//       await product.save();
    
//       const finalPrice = productKey.OfferPrice && productKey.OfferPrice > 0
//       ? product.price - productKey.OfferPrice  // Deduct discount
//       : product.price;  // Use regular price if no discount
    
//       orderItems.push({
//         productId: item.productId,
//         size: item.size || "N/A",
//         quantity: item.quantity,
//         price: finalPrice, // Corrected price
//         images: product.images[0],
//         payementMethod,
//       });
    
//       totalAmount += finalPrice * item.quantity; 
//     }
//     let paymentStatus = "pending";

//     if (payementMethod === "online") {
//       paymentStatus = "paid";
//     } else if (payementMethod === "cod") {
//       paymentStatus = "pending";
//     } else {
//       paymentStatus = "failed";
//     }
//     // ✅ Use the shipping address passed from frontend
//     const order = new Order({
//       userId,
//       products: orderItems,
//       totalAmount,
//       address: shippingAddress, // Use the shipping address from frontend
//       anotheraddress, // Will be `null` if userAddress is not found
//       status: "pending",
//       paymentStatus,
//       payementMethod,
//     });

//     console.log('Order:', order);
//     await order.save();
//     res.status(201).json({ message: "Order placed successfully", order });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// };


// exports . getAllOrders = async (req, res) => {
//     try {
//         const orders = await Order.find().sort({ createdAt: -1 })
//           .populate("userId", "name email mobileNo") // Get user details
//           .populate("products.productId", "name price images"); // Get product name, price, and image
    
//         res.status(200).json({
//           status: true,
//           message: "Orders retrieved successfully",
//           data: orders,
//         });
//       } catch (error) {
//         console.error("Error fetching orders:", error);
//         res.status(500).json({
//           status: false,
//           message: "Internal Server Error",
//           error: error.message,
//         });
//       }
//   };


//   exports.orderCancel = async (req, res) => {
//     try {
//       const { id } = req.params;
  
//       const order = await Order.findById(id);
//       if (!order) {
//         return res.status(404).json({ error: "Order not found" });
//       }
  
//       // Check if the order can be canceled
//       if (!["pending", "processing"].includes(order.status)) {
//         return res.status(400).json({ error: "Order cannot be canceled at this stage" });
//       }
  
//       // Restore stock only for the correct product key (variant)
//       for (const item of order.products) {
//         const product = await Product.findById(item.productId);
//         if (product) {
//           const variant = product.productkey.find(
//             (p) => p.size === item.size // adjust to match your product variant keys
//           );
  
//           if (variant) {
//             variant.Quantity += item.quantity;
//             await product.save();
//           }
//         }
//       }
  
//       // Update order status
//       order.status = "cancelled";
//       await order.save();
  
//       res.json({ message: "Order canceled successfully", order });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Server error" });
//     }
//   };
  

// // exports . Getorder = async (req, res) => {

// //     try {
// //         const { id } = req.params;
// //         const order = await Order.findById(id).populate("products.productId");
        
// //         if (!order) {
// //           return res.status(404).json({ error: "Order not found" });
// //         }
    
// //         res.json(order);
// //       } catch (error) {
// //         console.error(error);
// //         res.status(500).json({ error: "Server error" });
// //       }

// // };
// exports.Getorder = async (req, res) => {
//   try {
//     const { id } = req.params; // assuming this is user ID

//     const orders = await Order.find({ userId: id }).sort({ createdAt: -1 }).populate("products.productId");
//   // console.log('body',orders)
//     if (!orders || orders.length === 0) {
//       return res.status(404).json({ error: "No orders found for this user" });
//     }

//     res.json(orders);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// };
// exports . orderUpdate = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { status, paymentStatus } = req.body;
    
//         const order = await Order.findOne({ orderId: id });
//         if (!order) {
//           return res.status(404).json({ error: "Order not found" }); 
//         }
    
//         if (status) order.status = status;
//         if (paymentStatus) order.paymentStatus = paymentStatus;
    
//         await order.save();
    
//         return res.json({ message: "Order updated successfully", order }); 
//       } catch (error) {
//         console.error(error);
//         return res.status(500).json({ error: "Server error" }); 
//       }


// };
// exports.trackOrder = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     console.log("Incoming userId:", userId); // <-- check this value

//     const orders = await Order.find({ userId }).sort({ createdAt: -1 });
//     console.log("Orders found:", orders.length); // <-- see if anything matches

//     res.status(200).json({ status: true, orders });
//   } catch (error) {
//     console.error("Error fetching user orders:", error);
//     res.status(500).json({ status: false, message: "Internal server error" });
//   }
// };



