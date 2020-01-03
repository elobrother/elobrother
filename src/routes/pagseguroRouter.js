const express = require('express');
const router = express.Router();

const PagueSeguroController = require('../services/pagueseguroController')


router.post('/buy', async (req,res) => {
    try { 
        const code = await PagueSeguroController.buy(req,res);
        if(code.err) { return res.status(200).send({ message : `Houve um erro ao gerar Pagamento no paypal ${code.err}`})}
        let pagseguroUrl = `https://sandbox.pagseguro.uol.com.br/checkout/v2/payment.html?code=${code.result}`;
        return res.status(200).send(pagseguroUrl);
    } catch(err) {
        return res.status(400).send(err.message)
    }
});

module.exports = router;