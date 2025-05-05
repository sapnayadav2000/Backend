const express = require("express");
const router = express.Router();
const{isAdmin}=require('../Middleware/auth');
const PincodeController = require("../Controller/pincodeController");

router.post("/", isAdmin,PincodeController.createPincode);
router.get("/",isAdmin, PincodeController.getAllPincodes);
router.get("/:id",isAdmin, PincodeController.getPincodeById);
router.patch("/:id",isAdmin, PincodeController.updatePincode);
router.delete("/:id",isAdmin, PincodeController.deletePincode);
router.post("/check-pincode",PincodeController. checkPincode);

module.exports = router;
