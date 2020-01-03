const express = require('express');
const router = express.Router();

const OrderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

router.use(authController.verifyToken);

router.get('/', OrderController.getAll);
router.get('/:userId', OrderController.getOrdersByUser);
router.get('/getByCode/:code', OrderController.getByCode);
router.get('/dropouts/getAll', OrderController.getAllDropouts);
router.post('/create', OrderController.create);
router.post('/user/cancelOrder', OrderController.userCancelOrder);
router.put('/updateUser/:id', OrderController.updateUser);
router.post('/dropouts/:id', OrderController.dropoutsOrder);
router.put('/updateStatus/:id', OrderController.updateStatus);
router.delete('/:id', OrderController.delete);
router.post('/getPlayer/Password', OrderController.getPlayerPassword);
router.post('/refund', async (req, res) =>  {
    return await OrderController.refund(req,res) 
});

module.exports = router;

