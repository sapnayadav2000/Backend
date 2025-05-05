const Order = require('../Model/orders');
const OrderProduct = require('../Model/orderProduct');
const TempOrder = require('../Model/temporyOrder');

const UserAddress = require('../Model/userAddress');
const { v4: uuidv4 } = require('uuid');
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
      products // array of { productId, price, mrp, quantity, productType, extraVal, digitalKeys }
    } = req.body;

    // Step 1: Check if address exists
    const addressExists = await UserAddress.findById(userAddressId);
    if (!addressExists) {
      return res.status(400).json({ success: false, message: "Invalid user address" });
    }
    const orderId = uuidv4();
    // Step 2: Create order with existing address
    const order = new Order({
      orderId,
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
      paymentStatus,
      paymentId,
      paymentHash,
      orderStatus,
      orderDate
    });

 
    const savedOrder = await order.save();


    // Step 3: Save order products
    if (products && products.length > 0) {
      const orderProductPromises = products.map(prod => {
        return new OrderProduct({
          productId: prod.productId,
          userId, 
          price: prod.price,
          Originalprice: prod.Originalprice,
          size: prod.size,
          quantity: prod.quantity,
          orderId: savedOrder._id,
          productType: prod.productType,
          extraVal: prod.extraVal,
          digitalKeys: prod.digitalKeys
        }).save();
      });

      await Promise.all(orderProductPromises);
    }

    // Step 4: Save temp order
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
      phone
    });

    await tempOrder.save();

    res.status(201).json({ success: true, message: "Order created successfully", orderId: savedOrder._id });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Something went wrong', error: error.message });
  }
};
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params; // user ID

    // Step 1: Fetch all orders of the user
    const orders = await Order.find({ userId: id })
      .populate('userAddress', 'firstName lastName phone address city state pincode')
      .sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: "No orders found for this user" });
    }

    // Step 2: Fetch order products for each order
    const ordersWithProducts = await Promise.all(
      orders.map(async (order) => {
        const orderProducts = await OrderProduct.find({ orderId: order._id })
          .populate('productId'); // populate product details

        return {
          ...order.toObject(), // convert Mongoose document to plain JS object
          orderProducts
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
    const { OrderId } = req.params;

    // Find the order by OrderId
    const order = await Order.findById(OrderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if the order can be canceled based on order status
    if (!["Pending", "Dispatch"].includes(order.orderStatus)) {
      return res.status(400).json({ error: "Order cannot be canceled at this stage" });
    }

    // Find all OrderProduct items related to this order
    const orderProducts = await OrderProduct.find({ orderId: OrderId });
    if (!orderProducts || orderProducts.length === 0) {
      return res.status(404).json({ error: "No products found for this order" });
    }

    // Restore stock for each product variant
   
    // Update the order status to 'Cancelled'
    order.orderStatus = "Cancel";
    await order.save();

    res.json({ message: "Order cancelled successfully", order });
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
      .sort({ createdAt: -1 })  // Sort by created date to get the most recent orders first
      .populate("productId")
      .populate("orderId");

    if (!orderProducts.length) {
      return res.status(404).json({ status: false, message: "No order products found for user" });
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
    const { userId, orderId } = req.params;

    const orderProducts = await OrderProduct.find({ userId, orderId })
      .populate("productId")
      .populate("orderId");

    if (!orderProducts || orderProducts.length === 0) {
      return res.status(404).json({ status: false, message: "Order product not found" });
    }

    res.status(200).json({ status: true, orderProducts });
  } catch (error) {
    console.error("Error fetching order product details:", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};




// Function to retrieve all orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate("userId", "name email mobileNo") // Populate user details
           
            .populate("userAddress", "alternateAddress") // Populate user address and alternate address (if available)

            const ordersWithProducts = await Promise.all(
              orders.map(async (order) => {
                const orderProducts = await OrderProduct.find({ orderId: order._id })
                  .populate('productId'); // populate product details
        
                return {
                  ...order.toObject(), // convert Mongoose document to plain JS object
                  orderProducts
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




module.exports = { createOrder,getOrderById ,orderCancel,trackOrders,getAllOrders,trackOrderDetails };