const { Schema, model} = require('mongoose');

const ElosSchema = new Schema({
    name : {
        type : String,
        uppercase : true
    },
    value : {
        type : Number
    },
    day : {
        type : String
    },
    position : {
        type : Number
    }
})

module.exports = model('Elos', ElosSchema);