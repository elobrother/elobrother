const PaymentSchema = require('../models/payments');
const mongoose = require('mongoose');

class Payments {
    async createPaypalPayment(payments, orderId) {
        const payment = await PaymentSchema.create({ 
            meio : 'PAYPAL',
            orderId : mongoose.Types.ObjectId(orderId),
            payment : payments
        })
        if(!payment) { return false};
        return payment;
    }

    async createMercadopagoPayment(payments, orderId) {
        const payment = await PaymentSchema.create({ 
            meio : 'MERCADOPAGO',
            orderId : mongoose.Types.ObjectId(orderId),
            payment : payments
        })
        if(!payment) { return false};
        return payment;
    }
    async search(req, res) {
        const { orderIds } = req.body;

        const payment = await PaymentSchema.find().where('orderIds').in(orderIds);

        if (!payment) {
            return res.status(400).json({ error: 'Payments not Found'});
        }
        return res.json(payment);

    }
}

module.exports = new Payments();