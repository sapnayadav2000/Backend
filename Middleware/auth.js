require("dotenv").config();
const jwt = require("jsonwebtoken");
const Admin = require("../Model/admin");
const User = require("../Model/user");

/**
 * Generate JWT token for signing in
 */
const signInToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      address: user.address || "",
      phone: user.phone || "",
      image: user.image || "",
      userType: user.userType,
      tokenVersion: user.tokenVersion,
    },
    process.env.JWT_SECRET,
    { expiresIn: "60d" }
  );
};

/**
 * Generate a short-lived token for email verification
 */
const tokenForVerify = (user) => {
  return jwt.sign(
    user,
    
    process.env.JWT_SECRET_FOR_VERIFY,
    { expiresIn: "15m" }
  );
};

/**
 * Middleware to check if the user is authenticated
 */
// const isAuth = async (req, res, next) => {
//   const { authorization } = req.headers;
//   console.log("🛡️ Authorization Header Received:", authorization || 'undefined');
  

//   if (!authorization || !authorization.startsWith("Bearer ")) {
//     return res.status(401).json({ status: false, message: 'Authorization header missing or improperly formatted' });
//   }

//   const token = authorization.split(" ")[1];
//   if (!token) {
//     return res.status(401).json({ status: false, message: 'Token missing from header' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log("✅ Decoded Token:", decoded);

//     if (!decoded.tokenVersion) {
//       return res.status(401).json({ status: false, message: 'Invalid token payload' });
//     }

//     let user;
//     if (decoded.userType === 'Admin') {
//       user = await Admin.findById(decoded._id);
//     } else if (decoded.userType === 'Vendor') {
//       user = await Vendor.findById(decoded._id); // Make sure Vendor model is imported
//     } else {
//       user = await User.findById(decoded._id);
//     }

//     if (!user) {
//       return res.status(404).json({ status: false, message: 'User not found' });
//     }

//     if (user.tokenVersion !== decoded.tokenVersion) {
//       return res.status(401).json({ status: false, message: 'Token version mismatch' });
//     }

//     req.user = {
//       ...user.toObject(),
//       _id: user._id.toString(),
//       userType: decoded.userType
//     };

//     next();
//   } catch (err) {
//     console.error("❌ JWT Verification Error:", err);
//     return res.status(401).json({ status: false, message: 'Token invalid or expired', error: err.message });
//   }
// };
const isAuth = async (req, res, next) => {
  const { authorization } = req.headers;
  // console.log("🛡️ Authorization Header Received:", authorization || 'undefined');
  if (!authorization) {
    return res.status(401).json({ status: false, message: 'Authorization header missing' });
  }
  try {
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.userType === 'Admin') {
      req.user = decoded;
      return next();
    }
    let user;
    if (decoded.userType === 'Vendor') {
      user = await Vendor.findById(decoded._id);
    } else {
      user = await User.findById(decoded._id);
    }

    // if (user && user.status === 'Inactive') {
    //   return res.status(401).json({ status: false, message: 'User account is inactive' });
    // }
    
    if (user && user.tokenVersion === decoded.tokenVersion) {
      req.user = decoded;
      return next();
    } else {
      return res.status(401).json({ status: false, message: 'Invalid token' });
    }
  } catch (err) {
    return res.status(401).json({ status: false, message: 'Please login again', error: err.message });
  }
};

/**
 * Middleware to check if the user is an admin
 */
const isAdmin = async (req, res, next) => {
  try {
    console.log("🔍 Checking Admin Authentication...");
    const authHeader = req.headers.authorization;
     

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("🚨 Missing or incorrect Authorization header!");
      return res.status(401).json({ status: false, message: "Authorization header missing or invalid" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log("🚨 Token missing!");
      return res.status(401).json({ status: false, message: "Token not found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded Admin Token:", decoded);

    const admin = await Admin.findById(decoded._id);
    if (!admin) {
      console.log("🚨 Admin user not found in database!");
      return res.status(403).json({ status: false, message: "User is not an admin" });
    }

    req.user = admin;
    console.log("✅ Admin authenticated successfully!");
    next();
  } catch (err) {
    console.error("🚨 Admin Authentication Error:", err.message);
    return res.status(401).json({ status: false, message: "Invalid or expired token", error: err.message });
  }
};

module.exports = {
  signInToken,
  tokenForVerify,
  isAuth,
  isAdmin,
};
