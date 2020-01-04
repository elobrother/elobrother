const express = require('express');
const router = express.Router();

const UserController = require('../controllers/userController');
const authController = require('../controllers/authController');

router.post('/login', async (req, res) => { 
    await UserController.sign(req, res);
});

router.post('/login/admin', async (req, res) => { 
    await UserController.adminSign(req, res);
});

router.put('/user/forgotPassword', UserController.forgotPassword)

router.post('/create', UserController.create);
router.get('/:id', UserController.getUser);

router.use(authController.verifyToken);

router.get('/', UserController.getAll);
router.put('/:id', UserController.update);
router.delete('/:id', UserController.delete);

module.exports = router;