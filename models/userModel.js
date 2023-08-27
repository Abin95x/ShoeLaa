const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    name:{
        type:String,    
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    email:{
        type:String,
        requied:true
    },
    password:{
        type:String,
        required:true
    },
    address:{
        type:String
    },
    isVerified:{
        type:Number,
        default:0
    },
    isBlock:{
        type:Boolean,
        default:false
    },
    isAdmin:{
        type:Number,
        default:0
    },
    wallet: {
        type: Number,
        default: 0
    },
    referral:{
        type: String,
        required: false
    },
   
},{ timestamps: true })

module.exports = mongoose.model("User",userSchema)