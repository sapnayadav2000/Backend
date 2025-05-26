
const express = require('express');
const router = express.Router();
const ReturnController= require('../Controller/returnController');

const {isAdmin}= require('../Middleware/auth');
// Endpoint to request a return
router.post('/request-return',ReturnController. requestReturn);



router.get('/',isAdmin,ReturnController. GetAll);

router.patch('/:id',isAdmin, ReturnController.updateReturn);

router.delete('/:returnId',isAdmin, ReturnController.deleteReturn);

module.exports = router;
