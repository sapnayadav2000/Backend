const express = require("express");
const router = express.Router();
const productDetailsController = require("../Controller/productDetailsController");


router.route("/").post( productDetailsController.create);

router.route("/:id").patch(productDetailsController.update);

router.route("/:id").delete(productDetailsController.delete);
router.route("/").get(productDetailsController.getAll);
router.route("/:id").get(productDetailsController.getById);

module.exports = router;
