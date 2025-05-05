const express = require("express");
const router = express.Router();
const adminController = require("../Controller/adminController");
const { isAdmin } = require("../Middleware/auth");
const multer = require("../Multer/multer");

router
.route("/register")
.post(adminController.register);

router
.route("/login")
.post(adminController.login);
router
.route('/profile')
.get(isAdmin,adminController.me)
router
.route('/updateMe')
.patch(isAdmin,multer.singleFileUpload,adminController.updateMe)

router
.route("/change-password")
.patch(isAdmin, adminController.changePassword);

router
.route("/logout")
.post(isAdmin, adminController.logOut);

router
.route("/getAdmin")
.get(isAdmin,adminController.getProfile);
router
  .route("/:id")
  .patch(isAdmin, multer.singleFileUpload, adminController.updateAdmin);

  router
  .route("/dashboard")
  .get(isAdmin,adminController.dashboardTotal )



module.exports = router;
