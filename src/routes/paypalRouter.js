const express = require('express');
const router = express.Router();
const PaypalController = require('../services/paypalController');

const authController = require('../controllers/authController');

router.post('/update/payment', async(req,res) =>  {
    return await PaypalController.updatePayment(req,res);
});

//router.use(authController.verifyToken);
router.post('/success', async(req,res) =>  {
    return await PaypalController.success(req,res);
});
router.post('/buy', PaypalController.pay);

module.exports = router;