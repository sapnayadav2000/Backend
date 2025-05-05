const express = require("express");
const router = express.Router();
const wishlistController = require("../Controller/wishlistController.js");
const {isAuth}=require('../Middleware/auth.js')

router.get("/get",isAuth, wishlistController.getAllWishlist);
router.get("/",isAuth,wishlistController.MyWhislist)
router.route("/:userId/").post(isAuth,wishlistController.addToWishlist);
router.route("/:userId").get(isAuth,wishlistController.getWishlist);
router.route("/:userId").get(isAuth,wishlistController.updateWishlist);
router.route("/:userId/remove/:productId").delete(isAuth,wishlistController.deleteWishlist);
router.get('/count/:userId',isAuth, wishlistController.getWishlistCount);

module.exports = router;
