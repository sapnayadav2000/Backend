const Pincode = require("../Model/pincode");

exports.createPincode = async (req, res) => {
  try {
    const { pincode, city, state, country } = req.body;

    const exists = await Pincode.findOne({ pincode });
    if (exists) {
      return res.status(400).json({ status: false, message: "Pincode already exists" });
    }

    const newPincode = new Pincode({ pincode, city, state, country });
    await newPincode.save();

    res.status(201).json({ status: true, message: "Pincode created", data: newPincode });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
};

exports.getAllPincodes = async (req, res) => {
  try {
    const pincodes = await Pincode.find().sort({ createdAt: -1 });
    res.status(200).json({ status: true, data: pincodes });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
};

exports.getPincodeById = async (req, res) => {
  try {
    const pincode = await Pincode.findById(req.params.id);
    if (!pincode) {
      return res.status(404).json({ status: false, message: "Pincode not found" });
    }
    res.status(200).json({ status: true, data: pincode });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
};

exports.updatePincode = async (req, res) => {
  try {
    const updated = await Pincode.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ status: false, message: "Pincode not found" });
    }
    res.status(200).json({ status: true, message: "Pincode updated", data: updated });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
};

exports.deletePincode = async (req, res) => {
  try {
    const deleted = await Pincode.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ status: false, message: "Pincode not found" });
    }
    res.status(200).json({ status: true, message: "Pincode deleted" });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
};
exports.checkPincode = async (req, res) => {
  const { pincode } = req.body;
  try {
    const exists = await Pincode.findOne({ pincode });
    if (exists) {
      res.status(200).json({ status: true, message: "Pincode is serviceable." });
    } else {
      res.status(404).json({ status: false, message: "Pincode not serviceable." });
    }
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
};
