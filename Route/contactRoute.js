const express = require('express');
const router = express.Router();
const ContactController=require('../Controller/contactController')
const {isAuth}=require('../Middleware/auth')

router.route("/").post(ContactController.CreateContact);

router.route('/user/:userId').get(isAuth, ContactController.GetContactsByUser);
  
router.route("/").get(ContactController.GetAllContact);


router.route("/:id").patch(ContactController.Updatecontact);

router.delete('/:id', ContactController.DeleteContact);
module.exports=router