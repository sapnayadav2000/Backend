const express = require("express");
const router = express.Router();
const brandController = require("../Controller/brandController");
const multer = require("../Multer/multer");


router
  .route("/")
  .post(multer.singleFileUpload, brandController.CreateBrand);

router
  .route("/:id")
  .patch(multer.singleFileUpload, brandController.UpdateBrand);

router.route("/").get(brandController.GetAllBrand);

router.route("/:id").get(brandController.GetByIdBrand);

router.route("/:id").delete(brandController.DeleteBrand);

module.exports = router;
