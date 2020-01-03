const express = require('express');
const router = express.Router();

const AdminController = require('../controllers/adminController');
const authController = require('../controllers/authController');

router.use(authController.verifyToken);
router.use(authController.verifyAdmin);

router.get('/getAll/count', AdminController.getAllCount);
router.get('/ranking', AdminController.getRanking);

module.exports = router;