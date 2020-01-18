
const {Schema, model} = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
    name : {
        type : String,
        require : true
    },
    password : {
        type : String,
        require : true
    },
    hasForgottenPassowrd : {
        type : Boolean,
        default : false
    },
    email : {
        type : String,
        require : true,
        unique : true,
        lowercase : true
    },
    phoneNumber : {
        type : String
    },
    cpf : {
        type : String
    },
    status : {
        type : String,
        enum : ['JOGADOR', 'CLIENTE', 'ADMIN'],
        required : true
    },
    bankAccount : {
        name : {
            type : String
        },
        agency : {
            type : String
        },
        account : {
            type : String
        },
        fullName : {
            type : String
        },
        CPF : {
            type : String
        }
    },
    pedidos : [{
        type : Schema.Types.ObjectId
    }]
})

async function isCripto (password) {
    try {
        await bcrypt.getRounds(password);
        return false;
    }catch(err){
        return true;
    }
}

UserSchema.pre('save', async function (){
    if(await isCripto(this.password)) {
        const hash = await bcrypt.hash(this.password, 8);
        this.password = hash;
    }
})


UserSchema.pre('findOneAndUpdate', async function (){
    if(this._update.password || (this._update) && (this._update.user) && (this._update.user.password)) {
        const hash = await bcrypt.hash(this._update.password.toString(), 8);
        this._update.password = hash;
    }
})

module.exports = model('User', UserSchema);