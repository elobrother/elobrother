const express = require('express');
const router = express.Router();

const paymentsController = require('../controllers/paymentsController');
const authController = require('../controllers/authController');

router.use(authController.verifyToken);

router.post('/', paymentsController.search);


module.exports = router;