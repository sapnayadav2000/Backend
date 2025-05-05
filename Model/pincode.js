const mongoose = require("mongoose");

const PincodeSchema = new mongoose.Schema(
  {
    pincode: {
      type: String,
      required: true,
      unique: true,
    },
    city: String,
    state: String,
    country: String,
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true, // <-- This adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model("Pincode", PincodeSchema);
