const express = require('express');
const router = express.Router();
const orderController = require('../Controller/ordersController.js');
const {isAuth}=require('../Middleware/auth.js')


router
.route('/')
.post(isAuth,orderController.createOrder)

router
.route('/:id')
.get(isAuth,orderController.getOrderById)


router
.route('/:OrderId')
.delete(isAuth,orderController.orderCancel)

router
.route('/')
.get(isAuth,orderController.getAllOrders)

router 
.route('/track/:userId')
.get(orderController.trackOrders)

router.route('/track/:userId/:orderId').get(orderController.trackOrderDetails);

router.route('/verify-payment').post(isAuth, orderController.verifyPayment);



module.exports=router