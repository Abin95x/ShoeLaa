const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    deliveryAddress: {
        type: String,
        required: true
    },

    userName: {
        type:String,
        required: true
    },

    totalAmount: {
        type:String,
        required: true
    },

    status: {
        type: String,
        required: false
    },

    date: {
        type: Date,
        required: true
    },

    payment: {
        type: String,
        required: true
    },

    expectedDelivery : {
        type : Date,
        required : true
    },

    paymentId: {
        type: String
    },
    products: [{
        productId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: "true"
        },

        quantity:{
            type: Number,
            required: true,
        },

        totalPrice: {
            type: Number,
            required: true
        },

        status : {
            type : String,
            default : 'Placed'
        },

       
    }]
},{ timestamps: true })

module.exports = mongoose.model("order",orderSchema)