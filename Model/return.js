const mongoose = require('mongoose');

const ReturnSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  orderProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderProduct',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ["Pending","Approve", "Reject"],
    default: "Pending",
  },
  requestDate: {
    type: Date,
    default: Date.now
  },

  description: {
    type: String,
    default: null,
    trim: true
  }
}, {
  timestamps: true  // will auto-generate createdAt and updatedAt
});

module.exports = mongoose.model('Return', ReturnSchema);
