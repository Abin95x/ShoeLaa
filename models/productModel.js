const mongoose =require('mongoose')

const productSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:Array
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Category',
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    blocked :{
        type : Boolean,
        default : false
    },
    offerPrice: {
        type: Number,
        required: false
    },
    offerStartTime: {
        type: Date
    },
    offerEndTime: {
        type: Date
    },

},{ timestamps: true })



module.exports=mongoose.model('Product',productSchema)