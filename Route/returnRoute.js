

const express = require('express');
const router = express.Router();
const ReturnController= require('../Controller/returnController');

// Endpoint to request a return
router.post('/request-return',ReturnController. requestReturn);



router.get('/',ReturnController. GetAll);
router.patch('/:id', ReturnController.updateReturn);

router.delete('/:returnId', ReturnController.deleteReturn);

module.exports = router;
