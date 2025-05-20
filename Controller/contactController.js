const Contact = require("../Model/contact");
exports.CreateContact = async (req, res) => {
  try {
    const {  first_name, last_name, email, mobileno, description } =
      req.body;

    if (
   
      !first_name ||
      !last_name ||
      !email ||
      !mobileno ||
      !description
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newContact = new Contact({
      
      first_name,
      last_name,
      email,
      mobileno,
      description,
    });

    const savedContact = await newContact.save();

    res.status(201).json({
      message: "Contact created successfully",
      contact: savedContact,
    });
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.GetContactsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const contacts = await Contact.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Contacts fetched successfully",
      contacts,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.GetAllContact = async (req, res) => {
  try {
    const contact = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({
      message: "All Contacts fetched successfully",
      contact,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.Updatecontact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res
        .status(404)
        .json({ status: false, message: "contact Not Found" });
    }
    // Update other fields
    Object.assign(contact, req.body);
    await contact.save();

    res.status(200).json({
      status: true,
      message: "contact Updated Successfully",
      data: contact,
    });
  } catch (err) {
    res.status(400).json({ status: false, error: err.message });
  }
};

exports.DeleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json({
      message: "Contact deleted successfully",
      deletedContact: contact,
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
