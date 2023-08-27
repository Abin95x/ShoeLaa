const mongoose = require("mongoose")

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        rquired: true
    },
    coupon:{
        type: String,
        
    },
     grandTotal:{
            type:Number,
            default:0
        },
    product: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required : true
        },
        price:{
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        totalPrice: {
            type: Number,
            required: true
        },
        offerPrice: {
            type: Number,
            
        },
        offerEndTime: {
            type: Date,
            required: true
        },
        
       
        
    }]
},{ timestamps: true })

module.exports = mongoose.model("cart",cartSchema)