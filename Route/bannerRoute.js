const express = require("express");
const router = express.Router();
const bannerController = require("../Controller/bannerController");
const multer = require("../Multer/multer");
const { isAdmin } = require("../Middleware/auth");


router.route("/").get( bannerController.getAll);

router
  .route("/")
  .post(isAdmin, multer.singleFileUpload, bannerController.create);

router.route("/:id").get(isAdmin,bannerController.getById);

router
  .route("/:id")
  .patch(isAdmin,multer.singleFileUpload, bannerController.update);

router.route("/:id").delete(isAdmin,bannerController.delete);

module.exports = router;
