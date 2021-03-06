const express = require('express');
const router = express.Router();

const MercadoPagoController = require('../services/mercadopagoController');
const authController = require('../controllers/authController');

router.post('/update/payment', MercadoPagoController.updatePayment);

router.use(authController.verifyToken);

router.post('/', MercadoPagoController.buy);
router.post('/success', MercadoPagoController.success);
router.post('/refund', MercadoPagoController.refund);


module.exports = router;