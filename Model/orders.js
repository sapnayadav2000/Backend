const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true  // Ensure the field is unique
  },

  txnId: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  userAddress:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true
    
  },
  totalProducts: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0.0
  },
  gatewayAmount: {
    type: Number,
    default: 0.0
  },
  shippingAmount: {
    type: Number,
    default: 0.0
  },
  discountAmount: {
    type: Number,
    default: 0.0
  },
  grandTotal: {
    type: Number,
    default: 0.0
  },
  
  shippingDetails: {
    type: String,
    required: true,
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'PAYUMONEY', 'BINANCE', 'CREDIT_CARD',"Online","razorPay"],
    default: 'razorPay'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failure', 'completed','Paid'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    default: null,
    trim: true
  },
  paymentHash: {
    type: String,
    default: null,
    trim: true
  },

  orderDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Order', OrderSchema);