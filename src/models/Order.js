const { model, Schema } = require('mongoose');
const User = require('../models/User');
//const bcrypt = require('bcrypt');

const OrderSchema = new Schema({
    code : {
        type : String,
        uppercase : true,
        unique : true
    },
    tipo : {
        type: String,
        enum : ['ELOBOOST', 'ELOCOACH', 'MD10'],
        required : true
    },
    status : {
        type: String,
        enum : ['CONCLUIDO', 'JOGANDO', 'AGUARDANDO', 'PARALIZADO'],
        default : 'AGUARDANDO',
        uppercase : true,
    },
    paymentsStatus : {
        type: String,
        enum : ['AGUARDANDO', 'APROVADO', 'DEVOLVIDO', 'RECUSADO'],
        uppercase : true
    },
    days : {
        type : Number,
    },
    valor : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    playerName : {
        type : String,
        required : true
    },
    playerPassword : {
        type : String,
        required : true,
        select : false
    },
    hasCupom : {
        type : Boolean
    },
    cupomId : {
        type : Schema.Types.ObjectId
    },
    userClient : {
        type : Schema.Types.ObjectId
    },
    userPlayer : {
        type : Schema.Types.ObjectId
    },
    quantity : {
        type : Number
    },
    additional : {
        type : Object,
        chatOffiline : { 
            type : Boolean,
            default : true
        },
        timeToPlay : {
            type : Boolean,
            default : false
        },
        routes : {
            type : Boolean,
            default : false
        },
        description : {
            type : String
        }
    }
},{
    timestamps: true,
});

// OrderSchema.pre('save', async function (){
//     const hash = await bcrypt.hash(this.playerPassword, 8);
//     this.playerPassword = hash;
// })


OrderSchema.pre('findOneAndUpdate', async function (){
    if (this._update.userPlayer) {
        const user = (await User.find({ '_id' : this._update.userPlayer})).shift();
        user.pedidos.push(this._conditions._id);
        await user.save();
    } else {
        return;
    }
})

module.exports = model('Order', OrderSchema);