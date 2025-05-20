const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobileno: {
      type: String,
      required: [true, "Please provide a mobile number"],
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('contact', ContactSchema);
