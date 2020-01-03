const { Schema, model} = require('mongoose');

const DropoutsSchema = new Schema({
    user : {  
        type : Object,
        required : true
    },
    order : {
        type : Object,
        required : true
    },
    description : {
        type : String,
        required : true
    }    
}, 
{
    timestamps : true
})

module.exports = model('Dropouts', DropoutsSchema);