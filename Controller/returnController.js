const Return = require('../Model/return');
const OrderProduct = require('../Model/orderProduct');
const Order = require('../Model/orders');
const Product = require('../model/product');
const mongoose = require('mongoose');
exports.requestReturn = async (req, res) => {
    const { orderProductId, reason,description } = req.body;
  
    try {
      console.log('Received orderProductId:', orderProductId);
  
      if (!mongoose.Types.ObjectId.isValid(orderProductId)) {
        return res.status(400).json({ message: 'Invalid orderProductId format' });
      }
  
      // Fetch the orderProduct
      const orderProduct = await OrderProduct.findById(orderProductId);
      console.log('Fetched orderProduct:', orderProduct);
  
      if (!orderProduct) {
        return res.status(404).json({ message: 'Order product not found' });
      }
  
      // Fetch the actual order using orderProduct's reference
      const order = await Order.findById(orderProduct.orderId);
      console.log('Fetched order:', order);
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      // Ensure the order and product are linked correctly
      if (order._id.toString() !== orderProduct.orderId.toString()) {
        return res.status(400).json({ message: 'Order ID does not match with product' });
      }
  
      // Check if the product is delivered
      if (order.orderStatus !== 'Delivered') {
        return res.status(400).json({ message: 'Product is not eligible for return' });
      }
  
      // Fetch product and refund policy
      const product = await Product.findById(orderProduct.productId);
      if (!product || !product.refundPolicies || !product.refundPolicies.returnable) {
        return res.status(400).json({ message: 'This product is non-returnable according to refund policy' });
      }
  
      // Check if a return request already exists
      const existingReturn = await Return.findOne({
        orderId: order._id,
        orderProductId,
        userId: order.userId,
        status: { $ne: 'rejected' }
      });
  
      if (existingReturn) {
        return res.status(400).json({ message: 'A return request for this product already exists' });
      }
  
      // Check if return window has expired
      const returnDaysAllowed = product.refundPolicies.returnWindow || 30;
      const returnDeadline = new Date(order.deliveryDate);
      returnDeadline.setDate(returnDeadline.getDate() + returnDaysAllowed);
  
      if (new Date() > returnDeadline) {
        return res.status(400).json({ message: 'Return window has expired for this product' });
      }
  
      // Create return request
      const newReturn = new Return({
        orderId: order._id,
        orderProductId,
        userId: order.userId,
        reason,
        description

      });
  
      await newReturn.save();
  
      res.status(200).json({
        message: 'Return request successfully submitted',
        return: newReturn
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  



exports.GetAll = async (req, res) => {
  try {
    // Fetch all return requests from the database
    const returnRequests = await Return.find();

    // If no return requests found
    if (returnRequests.length === 0) {
      return res.status(404).json({ status: false, message: 'No return requests found' });
    }

    // Return the fetched return requests
    return res.status(200).json({ status: true, data: returnRequests });
  } catch (err) {
    console.error("Error fetching return requests:", err);
    res.status(500).json({ status: false, message: "Server error while fetching return requests", error: err.message });
  }
};


exports.deleteReturn = async (req, res) => {
  const { returnId } = req.params;

  try {
    const returnRequest = await Return.findById(returnId);

    if (!returnRequest) {
      return res.status(404).json({ message: 'Return request not found' });
    }

    await Return.findByIdAndDelete(returnId);

    res.status(200).json({ message: 'Return request deleted successfully' });
  } catch (error) {
    console.error("Error deleting return request:", error);
    res.status(500).json({ message: 'Server error while deleting return request' });
  }
};


exports.updateReturn = async (req, res) => {
    try {
      const returns = await Return.findById(req.params.id);
      if (!returns) {
        return res.status(404).json({ status: false, message: "returns Not Found" });
      }
            // Update other fields
      Object.assign(returns, req.body);
      await returns.save();
  
      res.status(200).json({
        status: true,
        message: "returns Updated Successfully",
        data: returns,
      });
    } catch (err) {
      res.status(400).json({ status: false, error: err.message });
    }
  };
