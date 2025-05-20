const mongoose = require('mongoose');

const OrderProductSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  price: {
    type: Number,
    default: 0.0
  },
  Originalprice: {
    type: Number,
    default: 0.0
  },
  quantity: {
    type: Number,
    default: 1
  },
  size:{
    type: String,
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  productType: {
    type: String,
    default: null,
    trim: true
  },
    orderStatus: {
    type: String,
    enum: ['Pending', 'Dispatch', 'Shipped', 'Delivered', 'Cancel', 'Return'],
    default: 'Pending'
  },
  extraVal: {
    type: String,
    default: null,
    trim: true
  },
  digitalKeys: {
    type: String,
    default: null,
    trim: true
  }
}, {
  timestamps: true // handles createdAt and updatedAt automatically
});

module.exports = mongoose.model('OrderProduct', OrderProductSchema);