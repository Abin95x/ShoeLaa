const mongoose = require("mongoose")

const couponSchema = new mongoose.Schema({

    code: {
        type: String,
        required: true
    },
    discountPercentage: {
        type: Number,
        required: true
    },
    user:{
        type: Array,
        ref: "User"
    },
    startDate : {
        type : Date,
        required : true
    },
    expireDate : {
        type :Date,
        required : true
    },

},{ timestamps: true })

module.exports = mongoose.model("coupon",couponSchema)

