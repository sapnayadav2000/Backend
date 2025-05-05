const express = require('express');
const router = express.Router();
const blogController = require('../Controller/blogController');

const multer = require("../Multer/multer");

router
    .route('/')
    .post(multer.singleFileUpload,blogController.addBlog)

router
.route('/')
.get(blogController.getAllBlog) 

router
.route('/:id')
.patch(multer.singleFileUpload,blogController.updateBlog)

router
.route('/:id')
.get(blogController.GetByIdgBlog)

router
.route('/:id')
.delete(blogController.deleteByID)


module.exports = router;