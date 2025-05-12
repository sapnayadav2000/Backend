const express = require("express");
const notificationController = require("../Controller/notificationController");

const multer = require("../Multer/multer");

const router = express.Router();
const { isAdmin } = require("../Middleware/auth");
// Auth routes *****************************************************************

router
  .route("/")
  .post(isAdmin,
    multer.singleFileUpload,
    notificationController.createNotification
  );

router
  .route("/")
  .get( notificationController.getAllNotification);
router
  .route("/:id")
  .delete(isAdmin, notificationController.deleteNotification)
  .patch(
    isAdmin,
    multer.singleFileUpload,
    notificationController.updateNotification
  );

router
  .route("/:id")
  .get(isAdmin, notificationController.getNotification);

module.exports = router;
