const mongoose = require('mongoose');

const TempOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', // Or your user model name
    required: true
  },
  sessionId: {
    type: String,
  
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    default: null,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  landmark: {
    type: String,
    default: null,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true // handles createdAt and updatedAt
});

module.exports = mongoose.model('TempOrder', TempOrderSchema);