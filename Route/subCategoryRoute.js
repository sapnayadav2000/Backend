const express = require("express");
const router = express.Router();
const subCategoryController = require("../Controller/subCategoryController");

const multer = require("../Multer/multer");

router
  .route("/")
  .post(
    
    multer.singleFileUpload,
    subCategoryController.CreateSubCategory
  );

router
  .route("/:id")
  .patch(
    
    multer.singleFileUpload,
    subCategoryController.UpdateSubCategory
  );

router
  .route("/:id")
  .delete(subCategoryController.DeleteSubCategory);
router.route("/").get( subCategoryController.GetAllSubCategory);

router
  .route("/:id")
  .get(subCategoryController.GetByIdSubCategory);




module.exports = router;
