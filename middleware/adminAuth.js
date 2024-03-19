const isLogin=async(req,res,next)=>{
    try {
        if(req.session.adminId){
            next() 
        }
        else{
            res.redirect('/admin/adminLogin')
        }
    } catch (error) {
        console.log(error.message)
    }
}

const isLogout = async(req,res,next)=>{
    try {
        if (req.session.adminId) {
            res.redirect("/admin/home")
        } else{
            next()
        }
        
    } catch (error) {   
        console.log(error.message); 
    }
}


module.exports={
    isLogin,
    isLogout,
}