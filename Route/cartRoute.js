const express = require('express');
const router = express.Router();
const cartController = require('../Controller/cartController.js');
const {isAuth}=require('../Middleware/auth.js')
const {optionalAuth}=require('../Middleware/auth.js')
router
.route('/')
.post(cartController.addToCart)

router.post("/merge", isAuth, cartController.mergeCartToUser);
router
.route('/:id')
.get(isAuth,cartController.getCart)
router
.route('/')
.get(optionalAuth,cartController.getAllCart)

router
.route('/')
.get(cartController.cartCount)

router.delete('/:cartId/item/:itemId',cartController.removeCartItem);
router.get('/:cartId/item/:itemId',isAuth, cartController.UpdatedQunatity);




// router
// .route('/')
// .post(cartController.addToCart)

// router
// .route('/:id')
// .get(isAuth,cartController.getCart)
// router
// .route('/')
// .get(cartController.getAllCart)

// router
// .route('/')
// .get(cartController.cartCount)

// router.delete('/:cartId/item/:itemId',isAuth, cartController.removeCartItem);
// router.get('/:cartId/item/:itemId',isAuth, cartController.UpdatedQunatity);





module.exports=router

