const { signInToken } = require("../Middleware/auth");
const Admin = require("../Model/admin");
const bcrypt = require("bcrypt");
const User = require("../Model/user");
const Product = require("../model/product");

const Order = require("../Model/orders");
const OrderProduct=require("../Model/orderProduct")
const moment = require("moment");

const path = require("path");
const fs = require("fs");
exports.register = async (req, res) => {
  try {
    const { name, email, mobileNo, userType, city, pincode, password } =
      req.body;

    if (!name || !email || !mobileNo || !password) {
      return res.status(400).json({
        status: false,
        error: "Name, email, mobile number, and password are required",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUser = await Admin.findOne({
      $or: [{ email }, { mobileNo }],
    });

    if (existingUser) {
      return res.status(400).json({
        status: false,
        error: "User already exists",
      });
    }

    const newUser = new Admin({
      name,
      email,
      mobileNo,
      userType,
      city,
      pincode,
      password: hashedPassword,
    });

    await newUser.save();

    const token = signInToken(newUser);

    res.status(201).json({
      status: true,
      message: "User registered successfully",

      // data: newUser, // Return full user details (excluding password if needed)
      token,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      error: err.message || "Internal Server Error",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { mobileOrEmail, password } = req.body;
    const user = await Admin.findOne({
      $or: [{ mobileNo: mobileOrEmail }, { email: mobileOrEmail }],
    }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(400)
        .json({ status: false, error: "Invalid credentials" });
    }

    const token = signInToken(user);
    res
      .status(200)
      .json({ status: true, message: "Login successful", token, data: user });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, err: err.message || "Internal Server Error" });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      mobileNo,
      userType,
      state,
      city,
      role,
      pincode,
      password,
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { mobileNo }],
    });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ status: false, error: "Admin already exists" });
    }

    const newUser = new Admin({
      name,
      email,
      mobileNo,
      userType,
      state,
      city,
      role,
      pincode,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(201).json({ status: true, data: newUser });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, error: err.message || "Internal Server Error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (!oldPassword || !newPassword || !confirmPassword)
      return res
        .status(400)
        .json({ error: "Please provide both old and new passwords" });

    const user = await Admin.findById(req.user._id).select("+password");
    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      return res.status(400).json({ error: "Invalid old password" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res
      .status(200)
      .json({ status: true, message: "Password changed successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, error: err.message || "Internal Server Error" });
  }
};

exports.logOut = async (req, res) => {
  try {
    if (req.user) {
      let user;
      if (req.user.userType === "Admin") {
        user = await Admin.findById(req.user._id);

        if (user) {
          user.tokenVersion += 1;
          await user.save();
          res.json({ status: true, message: "Logged out" });
        } else {
          res.status(401).json({ status: false, message: "Invalid user" });
        }
      } else {
        user = await Admin.findById(req.user._id);

        if (user) {
          user.tokenVersion += 1;
          await user.save();
          res.json({ status: true, message: "Logged out" });
        } else {
          res.status(401).json({ status: false, message: "Invalid user" });
        }
      }
    } else {
      res.status(401).json({ status: false, message: "No token provided" });
    }
  } catch (error) {
    res.status(500).send();
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const user = await Admin.findById(req.params.id);
    if (!user)
      return res.status(404).json({ status: false, message: "User Not Found" });
    Object.assign(user, req.body);
    await user.save();
    res.status(200).json({ status: true, data: user });
  } catch (error) {
    res.status(400).json({ status: false, error: err.message });
  }
};
exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password"); // Exclude password field

    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "admin not found" });
    }

    res.status(200).json({ success: true, data: admin });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
exports.dashboardTotal = async (req, res) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const OrderPending = await Order.countDocuments({
      paymentStatus: "pending",
    });

    const OrderReturn = await OrderProduct.countDocuments({ orderStatus: "Return" });
    const OrderDelivered = await OrderProduct.countDocuments({
      orderStatus: "Delivered",
    });
    const OrderCancelled = await OrderProduct.countDocuments({
      orderStatus: "Cancel",
    });

    const COD = await Order.countDocuments({ paymentMethod: "COD" });
    const razorPay = await Order.countDocuments({ paymentMethod: "razorPay" });

    const totalAmountData = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalAmount = totalAmountData[0]?.total || 0;

    // 🟢 Monthly Orders (last 12 months)
    const monthlyStart = moment().subtract(11, "months").startOf("month");
    const monthlyOrdersData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: monthlyStart.toDate() },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthlyLabels = [];
    const monthlyOrders = [];

    for (let i = 0; i < 12; i++) {
      const date = moment().subtract(11 - i, "months");
      const label = date.format("MMM");
      const key = date.format("YYYY-MM");

      monthlyLabels.push(label);
      const match = monthlyOrdersData.find((item) => item._id === key);
      monthlyOrders.push(match ? match.count : 0);
    }

    // 🟢 Weekly Orders (last 7 days)
    const weeklyStart = moment().subtract(6, "days").startOf("day");
    const weeklyOrdersData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: weeklyStart.toDate() },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const weeklyLabels = [];
    const weeklyOrders = [];

    for (let i = 0; i < 7; i++) {
      const date = moment().subtract(6 - i, "days");
      const label = date.format("ddd"); // Mon, Tue...
      const key = date.format("YYYY-MM-DD");

      weeklyLabels.push(label);
      const match = weeklyOrdersData.find((item) => item._id === key);
      weeklyOrders.push(match ? match.count : 0);
    }

    const response = {
      totalUsers,
      totalProducts,
      totalOrders,
      OrderPending,
      razorPay,
      OrderReturn,
      OrderDelivered,
      OrderCancelled,
      totalAmount,
      COD,
      monthlyLabels,
      monthlyOrders,
      weeklyLabels,
      weeklyOrders,
    };

    res.status(200).json({
      status: true,
      message: "Dashboard counts fetched successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error fetching dashboard counts:", error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await Admin.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ status: true, data: user });
  } catch (error) {
    console.error("Error fetching:", error);
  }
};

exports.updateMe = async (req, res) => {
  try {
    const user = await Admin.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
    });
    // Handle image update
    if (req.file) {
      const newImagePath = `Uploads/${req.file.filename}`;

      // Remove old image if it exists
      if (user.image) {
        const oldFilePath = path.join(__dirname, "../", user.image);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath); // Deletes the old image
        }
      }

      // Assign new image path
      user.image = newImagePath;
    }

    // Update other fields
    Object.assign(user, req.body);
    await user.save();

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ status: true, data: user });
  } catch (err) {
    res.status(400).json({ status: false, error: err.message });
  }
};
