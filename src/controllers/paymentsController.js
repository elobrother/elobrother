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
}

module.exports = new Payments();