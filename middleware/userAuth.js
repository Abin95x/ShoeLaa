const User = require("../models/userModel")

const isLogin = async(req,res,next)=>{
    try{
        const userData = await User.findOne({_id:req.session.userId})
        if(req.session.userId && userData.isBlock === false){
            next()
        }
        else{
            res.redirect("/")
        }
    }catch(error){
        console.log(error.message)
    }
}

const wishCart = async(req,res,next)=>{
    try{
        const userData = await User.findOne({_id:req.session.userId})
        if(req.session.userId && userData.isBlock === false){
            next()
        }
        else{
            res.redirect("/userLogin")
        }
    }catch(error){
        console.log(error.message)
    }
}

const isLogout = async(req,res,next)=>{
    try{
        const userData = await User.findOne({_id:req.session.userId})
        if(req.session.userId && userData.isBlock === false){
            res.redirect("/")
        } else {
            next()
        }
    }catch(error){
        console.log(error.message)
    }
}

  

module.exports = {
    isLogin,
    isLogout,
    wishCart,
    
}