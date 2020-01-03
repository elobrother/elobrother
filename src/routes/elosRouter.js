const express = require('express');
const router = express.Router();

const ElosController = require('../controllers/elosController');
const authController = require('../controllers/authController');

//router.post('/create', ElosController.create);
router.post('/', ElosController.orderValue);
router.get('/', ElosController.getAll);
router.post('/md10/getValue', ElosController.md10GetValue);

router.use(authController.verifyToken);
router.put('/', ElosController.updateElo);


module.exports = router;