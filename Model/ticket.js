// models/Ticket.js
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  orderProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderProduct',
    required: true,
  },
  mobileno: { type: String, required: true },
  Issue_type: { type: String, required: true },
  returnStatus: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending', // The default status is pending until processed.
  },
  status: {
    type: String,
    enum: [ 'In Progress', 'Resolved', 'Closed'],
    default: 'In Progress',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  image:{
    type: String,
   
  }
}, {
  timestamps: true, // To auto-generate createdAt and updatedAt
});

module.exports = mongoose.model('Ticket', ticketSchema);
