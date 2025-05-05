const express = require("express");
const router = express.Router();
const AppPolicy=require('../Controller/appPolicyController');

router.
    route('/')
    .post(AppPolicy.createAppPolicy)
    .get(AppPolicy.getAppPolicy)
    .patch(AppPolicy.updateAppPolicy);



module.exports = router