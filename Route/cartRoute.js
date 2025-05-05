const express = require('express');
const router = express.Router();
const cartController = require('../Controller/cartController.js');
const {isAuth}=require('../Middleware/auth.js')

router
.route('/')
.post(isAuth,cartController.addToCart)

router
.route('/:id')
.get(isAuth,cartController.getCart)
router
.route('/')
.get(isAuth,cartController.getAllCart)

router
.route('/')
.get(isAuth,cartController.cartCount)

router.delete('/:cartId/item/:itemId',isAuth, cartController.removeCartItem);
router.get('/:cartId/item/:itemId',isAuth, cartController.UpdatedQunatity);







module.exports=router