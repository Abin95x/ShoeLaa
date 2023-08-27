const mongoose = require("mongoose")
const addressSchema = new mongoose.Schema({
    country:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    mobile:{
        type: String,
        required: true
    },
    pin:{
        type: String,
        required: true
    },
    houseName:{
        type: String,
        required: true
    },
    village:{
        type: String,
        required: true
    },
    
    state:{
        type: String,
        required: true
    },
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required: true
    },
    


},{ timestamps: true })

module.exports = mongoose.model("Address",addressSchema)