const express = require("express");
const router = express.Router();
const ReviewController = require("../Controller/reviewController");
const {isAuth}=require('../Middleware/auth')
const multer=require('../Multer/multer')
const {isAdmin}=require('../Middleware/auth')

router.route("/").post(isAuth,multer.uploadHandler,ReviewController.CreateReview);


router.route("/product/:productId").get(multer.uploadHandler,ReviewController.GetReviewProduct);




router.route("/").get(multer.uploadHandler,ReviewController.GetAllReview);
router.route("/:id").patch(multer.uploadHandler, ReviewController.UpdateReview) ; // Update review by ID

// Delete a specific review
router.route("/:id")
  .delete(ReviewController.DeleteReview)

  router.route("/").delete(ReviewController.deletedReviewimage);

 

module.exports = router;