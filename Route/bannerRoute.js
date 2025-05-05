const express = require("express");
const router = express.Router();
const bannerController = require("../Controller/bannerController");
const multer = require("../Multer/multer");

router.route("/").get( bannerController.getAll);

router
  .route("/")
  .post( multer.singleFileUpload, bannerController.create);

router.route("/:id").get(bannerController.getById);

router
  .route("/:id")
  .patch(multer.singleFileUpload, bannerController.update);

router.route("/:id").delete(bannerController.delete);

module.exports = router;
