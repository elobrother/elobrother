const { Schema , model } = require('mongoose');

const PaymentsSchema = new Schema({
    meio : {
        type : String,
        enum : [ 'MERCADOPAGO', 'PAYPAL'],
        required : true
    },
    orderId : {
        type : Schema.Types.ObjectId
    },
    payment : {
        type : Schema.Types.Mixed
    }
})

module.exports = model('Payments', PaymentsSchema);