const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "plese provide name"],
    },
    email: {
      type: String,
      unique: true, // Enforce uniqueness for email
      sparse: true, // Allow null or undefined values (skip uniqueness check for them)
      validate: {
        validator: function (value) {
          return !(!value && !this.mobileNo); // Only one of email or mobileNo can be null or undefined
        },
        message: "Only one of email or mobileNo can be null or undefined",
      },
    },
    mobileNo: {
      type: String,
      unique: true, // Enforce uniqueness for mobileNo
      sparse: true, // Allow null or undefined values (skip uniqueness check for them)
      required: [true, "Please provide a mobile number"],
    },
    image: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    pincode: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "plese provide password"],
      select: false,
    },
    userType: {
      type: String,
      default: "Admin",
      enum: ["Admin"],
    },
    role: {
      type: String,
      default: "Admin",
      required: [true, "plese provide role"],
      enum: ["Admin"],
    },
    status: { type: String, default: "Active" } 
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
