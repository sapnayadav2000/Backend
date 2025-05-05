// routes/ticketRoutes.js
const express = require('express');
const router = express.Router();
const ticketController = require('../Controller/ticketController');
const {isAuth} = require('../Middleware/auth');
const {isAdmin}= require('../Middleware/auth');
const multer = require("../Multer/multer");

router.post('/',isAuth,multer.singleFileUpload,ticketController.createTicket);
router.get('/',isAdmin, ticketController.getAllTickets);
router.patch('/:id',  ticketController.updateTicketStatus);
router.delete('/:id', isAdmin, ticketController.deleteTicket);

module.exports = router;
