const express = require("express");
const router = express.Router();
const userAddressController = require("../Controller/userAdressController");
const {isAuth}=require('../Middleware/auth.js')

router.route("/").post(isAuth,userAddressController.CreateUserAddress);

router.route("/getAll/").get(isAuth, userAddressController.GetAllAddresses);

router
  .route("/:id")
  .delete(isAuth, userAddressController.DeleteUserAddress);

router
  .route("/:id")
  .patch(isAuth,userAddressController.UpdateUserAddress);

router
  .route("/:id")
  .get(isAuth, userAddressController.GetByIdUserAddress);

  router.route("/").get(isAuth, userAddressController.MyAllAddresses );

module.exports = router;
