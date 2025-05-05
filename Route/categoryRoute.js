const express = require("express");
const router = express.Router();
const categoryController = require("../Controller/categoryController");

const multer = require("../Multer/multer");

router
  .route("/")
  .post( multer.singleFileUpload, categoryController.CreateCategory);

router
  .route("/:id")
  .patch(multer.singleFileUpload, categoryController.UpdateCategory);

router.route("/:id").delete( categoryController.DeleteCategory);
router.route("/").get(categoryController.GetAllCategory);
router.route("/:id").get( categoryController.GetByIdCategory);

module.exports = router;
