const UserAddress = require("../Model/userAddress");
const User = require("../Model/user");
exports.CreateUserAddress = async (req, res) => {
  try {
    console.log("Received Data:", req.body); // ✅ Debugging log

    // Use userId instead of user
    const userId = req.user._id;

    if (!userId) {
      return res
        .status(400)
        .json({ status: false, message: "User ID is required" });
    }

    const userDoc = await User.findById(userId);
    if (!userDoc) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    req.body.username = userDoc.name;
    console.log("req", req.body);
    const {
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      pincode,
      country,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !pincode ||
      !country
    ) {
      return res
        .status(400)
        .json({ status: false, message: "All fields are required" });
    }

    const newAddress = await UserAddress.create(req.body);
    console.log("Saved Address:", newAddress); // ✅ Debugging log

    res
      .status(201)
      .json({
        status: true,
        message: "User Address created",
        data: newAddress,
      });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(400).json({ status: false, error: err.message });
  }
};


exports.GetAllAddresses = async (req, res) => {
  try {
    const addresses = await UserAddress.find().sort({ createdAt: -1 });

    if (!addresses.length) {
      return res
        .status(200)
        .json({ status: true, message: "No addresses found", data: [] });
    }

    res.status(200).json({
      status: true,
      message: "Address list retrieved successfully",
      data: addresses,
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

exports.DeleteUserAddress = async (req, res) => {
  try {
    const id = req.params.id;
    const deletes = await UserAddress.findById(id);
    if (!deletes) {
      return res
        .status(404)
        .json({ status: false, message: "UserAddress Not Found" });
    }
    await UserAddress.findByIdAndDelete(deletes);
    res.status(200).json({ status: true, message: "UserAddress Deleted " });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
};
exports.UpdateUserAddress = async (req, res) => {
  try {
    const id = req.params.id; // Address ID
    const address = await UserAddress.findById(id);

    if (!address) {
      return res
        .status(404)
        .json({ status: false, message: "UserAddress Not Found" });
    }

    // Update the Address Fields
    Object.keys(req.body).forEach((key) => {
      address[key] = req.body[key];
    });

    await address.save();

    res.status(200).json({
      status: true,
      message: "UserAddress Updated Successfully",
      updatedAddress: address,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: false, error: err.message });
  }
};

exports.GetByIdUserAddress = async (req, res) => {
  try {
    const id = req.params.id;
    const address = await UserAddress.findById(id);
    console.log("Fetched ID from route params:", id);
    if (address.length == 0) {
      return res
        .status(404)
        .json({ status: false, messgae: "userAddress Not Found" });
    }
    res.status(200).json({
      status: true,
      message: "userAddress Fetch Successfully",
      data: address,
    });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
};

exports.MyAllAddresses = async (req, res) => {
  const userId = req.user._id; // The userId is from the authenticated request
  console.log("User ID from authenticated request:", userId);
  try {
    // Find the user's addresses by userId
    const addresses = await UserAddress.find({ userId: userId }).select(
      "firstName lastName phone address landmark city state pincode country status"
    );

    if (addresses.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No addresses found for this user" });
    }

    return res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    console.error("Error fetching user addresses:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
