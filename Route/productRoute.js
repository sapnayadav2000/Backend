const express = require("express");
const router = express.Router();
const productController = require("../Controller/productController");

const multer = require("../Multer/multer");

router
  .route("/")
  .post(multer.uploadHandler, productController.CreateProduct);

router.route("/").get(productController.GetAllProduct);

router.route("/:id").delete( productController.DeleteProduct);

router
  .route("/:id")
  .patch( multer.uploadHandler, productController.UpdateProduct);

router.route("/:id").get(productController.GetByIdProduct);

router
.route("/subCategories/:categoryId")
.get(productController.getSubCategoryByCategory);

router.route("/").delete(productController.deletedProductimage);

router.route('/product-list-by-categoryId/:id').get(productController.getProductByCategory);
router.route('/product-list-by-subcategoryId/:id').get(productController.getProductBySubCategory);
router.route('/search').post(productController.searchProduct)



module.exports = router;
