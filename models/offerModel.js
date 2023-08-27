const mongoose = required("mongoose")
const Schema = mongoose.Schema
const offerSchmea = Schema({
    name: {
        type: String,
        required: true
    },

    startingDate: {
        type: Date,
        required: true
    },

    expiryDate: {
        type: Date,
        required: true
    },

    percentage : {
        type : Number,
        required : true
    },

    status : {
        type : Boolean, 
        default : true
    }
},{ timestamps: true })

module.exports = mongoose.model("offer",offerSchmea)