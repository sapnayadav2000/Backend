const express = require("express");
const router = express.Router();
const userController = require("../Controller/userController");
const {isAuth}=require('../Middleware/auth')
const multer=require('../Multer/multer')


router.route("/register").post(userController.register);
router.route('/profile').get( isAuth,userController.me);

router.route("/login").post(userController.login);


router.route("/").get(userController.GetUser);
router.route("/:id").get(userController.getUserById);
router.route("/:id").patch(isAuth,multer.singleFileUpload,userController.updatedata);

router.route("/verifysignup").post(userController.verifyOTPForSignUp);
router.route("/:id").delete(isAuth,userController.deleteUserById);

module.exports = router;
