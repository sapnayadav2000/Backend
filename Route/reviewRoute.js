const express = require("express");
const router = express.Router();
const ReviewController = require("../Controller/reviewController");
const {isAuth}=require('../Middleware/auth')
const multer=require('../Multer/multer')
const {isAdmin}=require('../Middleware/auth')

router.route("/").post(isAuth,multer.uploadHandler,ReviewController.CreateReview);


router.route("/product/:productId").get(isAdmin,multer.uploadHandler,ReviewController.GetReviewProduct);




router.route("/").get(isAdmin,multer.uploadHandler,ReviewController.GetAllReview);
router.route("/:id").patch(isAdmin,multer.uploadHandler, ReviewController.UpdateReview) ; // Update review by ID

// Delete a specific review
router.route("/:id")
  .delete(isAdmin,ReviewController.DeleteReview)

  router.route("/").delete(ReviewController.deletedReviewimage);

 

module.exports = router;