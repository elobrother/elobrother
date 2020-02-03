const { Schema, model } = require('mongoose');

const LogSchema = new Schema({
    meio : {
        type : String,
        enum : [ 'MERCADOPAGO', 'PAYPAL']
    },
    data : {
        type : Schema.Types.Mixed
    }
})

module.exports = model('Log', LogSchema);