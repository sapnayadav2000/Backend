const Order = require("../Model/orders");
const OrderProduct = require("../Model/orderProduct");
const TempOrder = require("../Model/temporyOrder");
const Razorpay = require("razorpay");
const UserAddress = require("../Model/userAddress");
const crypto = require("crypto");
// const moment = require('moment');
// const nodemailer = require('nodemailer');
const Product = require("../model/product");
require("dotenv").config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const createOrder = async (req, res) => {
  try {
    const {
      userId,
      userAddressId,
      sessionId,
      firstName,
      lastName,
      country,
      address,
      landmark,
      city,
      pincode,
      state,
      email,
      phone,
      txnId,
      totalProducts,
      totalAmount,
      gatewayAmount,
      shippingAmount,
      discountAmount,
      grandTotal,
      shippingDetails,
      paymentMethod,
      paymentStatus,
      paymentId,
      paymentHash,
      orderStatus,
      orderDate,
      products, // array of { productId, price, mrp, quantity, productType, extraVal, digitalKeys }
    } = req.body;

    console.log("response body", req.body);
    console.log("Verifying userAddressId:", userAddressId);

    // Step 1: Check if address exists
    const addressExists = await UserAddress.findById(userAddressId);
    if (!addressExists) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user address" });
    }

    // Step 2: Generate the new order ID (incremental order ID)
    const lastOrder = await Order.findOne().sort({ orderId: -1 }).limit(1);
    let newOrderIdNumber = 100000; // Default to 100000 if no orders exist yet

    if (lastOrder && lastOrder.orderId) {
      const lastOrderNumber = parseInt(
        lastOrder.orderId.replace("ORD", ""),
        10
      );
      if (!isNaN(lastOrderNumber)) {
        newOrderIdNumber = lastOrderNumber + 1;
      } else {
        console.error("Invalid orderId format for the last order.");
      }
    }

    // Step 3: Generate the new order ID with the incremented order number
    const newOrderId = `ORD${newOrderIdNumber}`;
    let razorpayOrder = null;

    // Handle Razorpay order creation for Online payment method
    if (paymentMethod === "Online") {
      razorpayOrder = await razorpayInstance.orders.create({
        amount: grandTotal * 100,
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        notes: { userId, orderId: newOrderId },
      });

      if (!razorpayOrder) {
        return res
          .status(400)
          .json({ success: false, message: "Failed to create Razorpay order" });
      }

      // Return Razorpay order details to frontend for payment
      return res.status(200).json({
        success: true,
        message: "Razorpay order created successfully",
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      });
    }

    // Step 4: For COD, we directly create the order without Razorpay
    const order = new Order({
      orderId: newOrderId,
      txnId,
      userId,
      userAddress: userAddressId,
      totalProducts,
      totalAmount,
      gatewayAmount,
      shippingAmount,
      discountAmount,
      grandTotal,
      shippingDetails,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "pending" : paymentStatus, // COD orders are not paid at the moment
      paymentId,
      paymentHash,
      orderStatus,
      orderDate,
    });

    const savedOrder = await order.save();

    if (products && products.length > 0) {
      for (let prod of products) {
        const product = await Product.findById(prod.productId);

        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Product not found: ${prod.productId}`,
          });
        }

        // Find the product key for the selected size
        const productKey = product.productkey.find(
          (key) => key.Size === prod.size
        );

        if (!productKey) {
          return res.status(400).json({
            success: false,
            message: `Size not available for product: ${product.name}`,
          });
        }

        // Check if there is enough stock for the selected size
        if (productKey.Quantity >= prod.quantity) {
          productKey.Quantity -= prod.quantity;
          await product.save();

          // Save the product in the order
          await new OrderProduct({
            productId: prod.productId,
            userId,
            price: prod.price,
            Originalprice: prod.Originalprice,
            size: prod.size,
            quantity: prod.quantity,
            orderId: savedOrder._id,
            productType: prod.productType,
            extraVal: prod.extraVal,
            digitalKeys: prod.digitalKeys,
          }).save();
        } else {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product: ${product.name} (Size: ${prod.size})`,
          });
        }
      }
    }

    // Step 6: Save temp order for user details
    const tempOrder = new TempOrder({
      userId,
      sessionId,
      firstName,
      lastName,
      country,
      address,
      landmark,
      city,
      pincode,
      state,
      email,
      phone,
    });

    await tempOrder.save();

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      orderId: savedOrder._id,
      razorpayOrderId: razorpayOrder?.id || null,
      amount: razorpayOrder?.amount || null,
      currency: razorpayOrder?.currency || "INR",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Something went wrong",
        error: error.message,
      });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params; // user ID

    // Step 1: Fetch all orders of the user
    const orders = await Order.find({ userId: id })
      .populate(
        "userAddress",
        "firstName lastName phone address city state pincode"
      )
      .sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: "No orders found for this user" });
    }

    // Step 2: Fetch order products for each order
    const ordersWithProducts = await Promise.all(
      orders.map(async (order) => {
        const orderProducts = await OrderProduct.find({
          orderId: order._id,
        }).populate("productId"); // populate product details

        return {
          ...order.toObject(), // convert Mongoose document to plain JS object
          orderProducts,
        };
      })
    );

    res.json(ordersWithProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};


const orderCancel = async (req, res) => {
  try {
    const { orderId, productId } = req.params;

    // 1. Validate order existence
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // 2. Find the specific OrderProduct
    const orderProduct = await OrderProduct.findOne({
      orderId,
      productId,
    });

    if (!orderProduct) {
      return res.status(404).json({ error: "Order product not found" });
    }

    // 3. Only allow cancellation if status is Pending or Dispatch
    if (!["Pending", "Dispatch"].includes(orderProduct.orderStatus)) {
      return res.status(400).json({ error: "Order cannot be canceled at this stage" });
    }

    // 4. Update the orderStatus of this product to "Cancel"
    orderProduct.orderStatus = "Cancel";
    await orderProduct.save();

    // 5. Restore stock from Product collection (correct model)
    const productDoc = await Product.findById(productId);
    if (productDoc && Array.isArray(productDoc.productkey)) {
      const productKey = productDoc.productkey.find(
        (key) => key.Size === orderProduct.size
      );

      if (productKey) {
        productKey.Quantity += orderProduct.quantity;
        await productDoc.save();
      }
    }

    // 6. Check if all products are canceled for the order, then cancel whole order
    const remainingItems = await OrderProduct.find({
      orderId,
      orderStatus: { $ne: "Cancel" }
    });

    if (remainingItems.length === 0) {
      order.orderStatus = "Cancel";
      await order.save();
    }

    res.json({
      message: "Product cancelled from order successfully",
      cancelledProduct: orderProduct,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};



const trackOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Incoming userId:", userId);

    // Find all OrderProducts associated with this user
    const orderProducts = await OrderProduct.find({ userId })
      .sort({ createdAt: -1 }) // Sort by created date to get the most recent orders first
      .populate("productId")
      .populate("orderId");

    if (!orderProducts.length) {
      return res
        .status(404)
        .json({ status: false, message: "No order products found for user" });
    }

    // Return all orders for the user
    res.status(200).json({ status: true, orderProducts });
  } catch (error) {
    console.error("Error fetching order products:", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

// Fetch details for a specific order when clicked by the user
const trackOrderDetails = async (req, res) => {
  try {
    const { userId, orderId, orderProductId } = req.params;

    if (!userId || !orderId) {
      return res.status(400).json({ message: 'Missing userId or orderId' });
    }

    // Validate that the order belongs to the user
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found for this user' });
    }
  console.log('order',order);
    // Build query for order products
    const query = { orderId };
    if (orderProductId) {
      query._id = orderProductId;
    }

    // Fetch order product(s) and populate product details
    const orderProducts = await OrderProduct.find(query).populate('productId');

    if (!orderProducts || orderProducts.length === 0) {
      return res.status(404).json({ message: 'Order product(s) not found' });
    }

    res.status(200).json({ success: true, data: orderProducts });
  } catch (error) {
    console.error('Error fetching order product details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Function to retrieve all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email mobileNo") // Populate user details

      .populate("userAddress", "firstName lastName"); // Populate user address and alternate address (if available)

    const ordersWithProducts = await Promise.all(
      orders.map(async (order) => {
        const orderProducts = await OrderProduct.find({
          orderId: order._id,
        }).populate("productId"); // populate product details

        return {
          ...order.toObject(), // convert Mongoose document to plain JS object
          orderProducts,
        };
      })
    );

    res.json(ordersWithProducts);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      paymentId,
      orderId,
      signature,
      userAddressId,
      totalAmount,
      grandTotal,
      products,
      paymentMethod,
      txnId,
      paymentHash,
      shippingDetails,
      userId,
    } = req.body;

    console.log("Request Body:", req.body);
    console.log("Received paymentMethod:", paymentMethod);
    // Step 1: Signature Verification
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    console.log("Generated Signature:", generatedSignature);

    if (generatedSignature !== signature) {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }

    // Step 2: Validate address
    const addressExists = await UserAddress.findById(userAddressId);
    if (!addressExists) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user address" });
    }

    // Step 3: Generate custom order ID
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    let newOrderIdNumber = 100000;
    if (lastOrder && lastOrder.orderId) {
      const lastOrderNumber = parseInt(
        lastOrder.orderId.replace("ORD", ""),
        10
      );
      if (!isNaN(lastOrderNumber)) {
        newOrderIdNumber = lastOrderNumber + 1;
      } else {
        console.error("Invalid last orderId format");
      }
    }
    const newOrderId = `ORD${newOrderIdNumber}`;

    // Optional: Create Razorpay order (only needed if re-initiating)
    let razorpayOrder = null;
    if (paymentMethod === "Online") {
      razorpayOrder = await razorpayInstance.orders.create({
        amount: grandTotal * 100,
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        notes: { userId, orderId: newOrderId },
      });
      if (!razorpayOrder) {
        return res
          .status(400)
          .json({ success: false, message: "Failed to create Razorpay order" });
      }
    }

    // Step 4: Create Order
    const orderDate = new Date();
    const order = await Order.create({
      orderId: newOrderId,
      txnId: txnId || paymentId,
      userId,
      userAddress: userAddressId,
      totalProducts: products.length,
      totalAmount,
      shippingAmount: 0,
      discountAmount: 0,
      gatewayAmount: grandTotal,
      grandTotal,
      shippingDetails,
      paymentMethod,
      paymentId,
      paymentHash: paymentHash || "",
      orderDate,
      orderStatus: "Pending",
      paymentStatus: "Paid",
    });

    // Step 5: Create OrderProduct entries
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      // Find the product key for the selected size
      const productKey = product.productkey.find(
        (key) => key.Size === item.size
      );

      if (!productKey) {
        return res.status(400).json({
          success: false,
          message: `Size not available for product: ${product.name}`,
        });
      }

      // Check if there is enough stock for the selected size
      if (productKey.Quantity >= item.quantity) {
        productKey.Quantity -= item.quantity;
        await product.save();
      } else {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.name} (Size: ${item.size})`,
        });
      }

      // Create the OrderProduct record
      await OrderProduct.create({
        orderId: order._id,
        productId: product._id,
        quantity: item.quantity,
        price: item.price,
        size: item.size || null,
        productName: product.name,
        productImage: product.images?.[0] || "",
        userId,
      });
    }

    // Step 6: Fetch tempOrder data (if exists)
    const tempOrder = await TempOrder.findOne({ userId });
    //     const email = tempOrder?.email || shippingDetails?.email;
    // console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS);
    //     if (email) {
    //       const transporter = nodemailer.createTransport({
    //         service: 'gmail',
    //         auth: {
    //           user: process.env.EMAIL_USER,
    //           pass: process.env.EMAIL_PASS,
    //         },
    //       });

    //       const emailContent = `
    //         <p>Thank you for your order!</p>
    //         <p><strong>Order ID:</strong> ${order.orderId}</p>
    //         <p>We have received your payment of ₹${grandTotal}.</p>
    //         <p>Your order will be processed shortly.</p>
    //         <h4>Shipping Details</h4>
    //         <ul>
    //           <li>Name: ${shippingDetails?.firstName || ''} ${shippingDetails?.lastName || ''}</li>
    //           <li>Phone: ${shippingDetails?.phone || ''}</li>
    //           <li>Address: ${shippingDetails?.address || ''}, ${shippingDetails?.city || ''}, ${shippingDetails?.state || ''} - ${shippingDetails?.pincode || ''}</li>
    //         </ul>
    //       `;

    //       await transporter.sendMail({
    //         from: process.env.EMAIL_USER,
    //         to: email,
    //         subject: 'Order Confirmation',
    //         html: emailContent,
    //       });
    //     }

    // Step 7: Delete temp order
    if (tempOrder?._id) {
      await TempOrder.findByIdAndDelete(tempOrder._id);
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and order placed successfully.",
      orderId: order.orderId,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const updatedOrders = async (req, res) => {
  try {
    const { orderId, orderProductId } = req.params;
    const { orderStatus } = req.body;

    // Find the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update the main order status if a new status is provided
    if (orderStatus) {
      order.orderStatus = orderStatus;

      // If orderStatus is 'Delivered', mark paymentStatus as 'Paid'
      if (orderStatus === 'Delivered' && order.paymentStatus !== 'Paid') {
        order.paymentStatus = 'Paid';
      }

      // Save the updated order
      await order.save();
    }

    // Find the order product document
    const orderProduct = await OrderProduct.findOne({
      _id: orderProductId,
      orderId: orderId,
    });

    if (!orderProduct) {
      return res.status(404).json({ error: 'Order product not found' });
    }

    // Update orderProduct status as well
    orderProduct.orderStatus = orderStatus || orderProduct.orderStatus;
    orderProduct.updatedAt = Date.now();

    await orderProduct.save();

    res.status(200).json({
      message: 'Order product status updated successfully',
      updatedOrderProduct: orderProduct,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};





module.exports = {
  createOrder,
  getOrderById,
  orderCancel,
  trackOrders,
  getAllOrders,
  trackOrderDetails,
  verifyPayment,
  updatedOrders
};
