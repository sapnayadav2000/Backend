const Ticket = require("../Model/ticket");
const OrderProduct = require("../Model/orderProduct"); // Assuming this model exists
const Order = require("../Model/orders");
exports.createTicket = async (req, res) => {
  try {
    const { orderProductId, userId, mobileno, Issue_type } = req.body;
    req.body.image = `Uploads/${req.file?.filename}`;
    console.log("Received orderProductId:", orderProductId);
    // Find the associated OrderProduct document
    const product = await OrderProduct.findById(orderProductId).populate(
      "orderId"
    ); // Populate the orderId field to access order details
    if (!product) {
      return res.status(400).json({ error: "Invalid Product ID provided" });
    }


 

    // Create the return ticket if the product is delivered
    const ticket = await Ticket.create({
      orderProductId,
      userId,
      mobileno,
      Issue_type,
      image: req.body.image,
      returnStatus: "Pending", // Initially, the return status is 'Pending'
    });

    res.status(201).json(ticket); // Return the created ticket
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const updateData = {
      updatedAt: Date.now(),
    };

    // Conditionally add status and priority if provided
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.priority) updateData.priority = req.body.priority;

    const ticket = await Ticket.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ message: "Ticket deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
