const express = require('express');
const router = express.Router();

const CupomController = require('../controllers/cupomController');
const authController = require('../controllers/authController');

router.use(authController.verifyToken);

router.get('/:id', async(req,res) => {
    await CupomController.validate(req,res)
});
router.get('/', CupomController.getAll);
router.post('/', CupomController.create);
router.delete('/:id', CupomController.delete);


module.exports = router;