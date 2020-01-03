const { model, Schema} = require('mongoose');

const CupomSchema = new Schema({
    name : {
        type : String,
        uppercase: true
    },

    expirationTime : {
        type : String,
        required : true
    },
    value : {
        type : Number,
        required : true
    },
    amount : {
        type : Number,
        required : true
    }
},
{
    timestamps: true,
}
);

module.exports = model('Cupom', CupomSchema);