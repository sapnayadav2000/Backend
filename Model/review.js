const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  username:
  {
    type: String,
  
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  images: [{
    type: String,
  }],
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
 
}, {
  timestamps: true, // <-- This adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Review', reviewSchema);
