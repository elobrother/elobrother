const express = require('express');
const router = express.Router();

const MailController = require('../controllers/mailController');


router.post('/',MailController.sendMail);


module.exports = router;
