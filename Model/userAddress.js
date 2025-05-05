const mongoose = require("mongoose");
const User=require('../Model/user')
// Define the address schema
const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', // Reference the User model
    required: true
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/,
  },
  address: {
    type: String,
    required: true,
  },
  landmark: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pincode: { // Keep as `pincode` to match frontend
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
    default: "India",
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  
},
{
  timestamps: true, // <-- This adds createdAt and updatedAt automatically
});

// Create the Address model
const UserAddress = mongoose.model("Address", addressSchema);

module.exports = UserAddress;








