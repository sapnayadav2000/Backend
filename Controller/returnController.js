const Return = require("../Model/return");
const OrderProduct = require("../Model/orderProduct");
const Order = require("../Model/orders");
const Product = require("../model/product");
const mongoose = require("mongoose");
exports.requestReturn = async (req, res) => {
  const { orderProductId, reason, description } = req.body;

  try {
    console.log("Received orderProductId:", orderProductId);

    if (!mongoose.Types.ObjectId.isValid(orderProductId)) {
      return res.status(400).json({ message: "Invalid orderProductId format" });
    }

    // Fetch the orderProduct with product and order populated
    const orderProduct = await OrderProduct.findById(orderProductId)
      .populate("productId")
      .populate("orderId");
    console.log("Fetched orderProduct:", orderProduct);

    if (!orderProduct) {
      return res.status(404).json({ message: "Order product not found" });
    }

    const order = orderProduct.orderId;

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order._id.toString() !== orderProduct.orderId._id.toString()) {
      return res
        .status(400)
        .json({ message: "Order ID does not match with product" });
    }

    if (order.orderStatus !== "Delivered") {
      return res
        .status(400)
        .json({ message: "Product is not eligible for return" });
    }

    const product = orderProduct.productId;
    if (
      !product ||
      !product.refundPolicies ||
      !product.refundPolicies.returnable
    ) {
      return res
        .status(400)
        .json({
          message: "This product is non-returnable according to refund policy",
        });
    }

    const existingReturn = await Return.findOne({
      orderId: order._id,
      orderProductId,
      userId: order.userId,
      status: { $ne: "rejected" },
    });

    if (existingReturn) {
      return res
        .status(400)
        .json({ message: "A return request for this product already exists" });
    }

    const returnDaysAllowed = product.refundPolicies.returnWindow || 30;
    const returnDeadline = new Date(order.deliveryDate);
    returnDeadline.setDate(returnDeadline.getDate() + returnDaysAllowed);

    if (new Date() > returnDeadline) {
      return res
        .status(400)
        .json({ message: "Return window has expired for this product" });
    }

    const newReturn = new Return({
      orderId: order._id,
      orderProductId,
      userId: order.userId,
      reason,
      description,
    });

    await newReturn.save();

    res.status(200).json({
      message: "Return request successfully submitted",
      return: newReturn,
      orderProductDetails: orderProduct, // <-- include populated orderProduct details here
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.GetAll = async (req, res) => {
  try {
    const returns = await Return.find()
      .populate({
        path: "orderProductId",
        populate: { path: "productId" },
      })
      .populate("orderId")
      .populate("userId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      total: returns.length,
      returns,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteReturn = async (req, res) => {
  const { returnId } = req.params;

  try {
    const returnRequest = await Return.findById(returnId);

    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }

    await Return.findByIdAndDelete(returnId);

    res.status(200).json({ message: "Return request deleted successfully" });
  } catch (error) {
    console.error("Error deleting return request:", error);
    res
      .status(500)
      .json({ message: "Server error while deleting return request" });
  }
};

exports.updateReturn = async (req, res) => {
  try {
    const returns = await Return.findById(req.params.id);
    if (!returns) {
      return res
        .status(404)
        .json({ status: false, message: "returns Not Found" });
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
