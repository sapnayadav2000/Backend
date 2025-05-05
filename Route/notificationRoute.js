const express = require("express");
const notificationController = require("../Controller/notificationController");

const multer = require("../Multer/multer");

const router = express.Router();

// Auth routes *****************************************************************

router
  .route("/")
  .post(
    multer.singleFileUpload,
    notificationController.createNotification
  );

router
  .route("/")
  .get( notificationController.getAllNotification);
router
  .route("/:id")
  .delete( notificationController.deleteNotification)
  .patch(
    
    multer.singleFileUpload,
    notificationController.updateNotification
  );

router
  .route("/:id")
  .get( notificationController.getNotification);

module.exports = router;
