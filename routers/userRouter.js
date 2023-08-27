const express = require("express");
const userRoute = express();
const auth = require("../middleware/userAuth")

//setting view engine
userRoute.set("views","./views/user")

//controllers
const userController = require( '../controllers/userController')
const productController = require("../controllers/productController")
const cartController = require("../controllers/cartController")
const wishlistController = require("../controllers/wishlistController")
const checkoutController = require("../controllers/checkoutContoller")
const orderController = require("../controllers/orderController")
const couponContoller = require("../controllers/couponController")
const errorMiddleware = require("../middleware/errors")

//home
userRoute.get("/",userController.loadHome);

//signup
userRoute.get("/userSignup",userController.loadSignup)
userRoute.post("/userSignup",userController.insertUser)

//otp
userRoute.post("/otpVerification",userController.otpValidation)
userRoute.get("/resendOtp",userController.resendOtp)

//login
userRoute.get('/userLogin',auth.isLogout,userController.loadLogin)
userRoute.post("/userLogin",userController.verifyLogin)

//user profile
userRoute.get("/userProfile",auth.isLogin,userController.userProfile)

//add address
userRoute.get("/addAddress",auth.isLogin,userController.addAddress)
//save address
userRoute.post("/saveAddress",auth.isLogin,userController.saveAddress)
//show address
userRoute.get("/showAddress",auth.isLogin,userController.showAddress)
//edit address 
userRoute.get("/editAddress",auth.isLogin,userController.editAddress)
//delete address
userRoute.get("/deleteAddress",auth.isLogin,userController.deleteAddress)
//edit address checkout
userRoute.get("/editCheckOut",auth.isLogin,userController.editCheckOut)
//delete address checkout
userRoute.get("/deleteCheckOut",auth.isLogin,userController.deleteCheckOut)
//update address checkout
userRoute.post("/updateAddressCheckOut/:id",auth.isLogin,userController.updateAddressCheckOut)

//update 
userRoute.post("/updateAddress/:id",auth.isLogin,userController.updateAddress)
//change pass
userRoute.get("/changePass",auth.isLogin,userController.changePassLoad)
userRoute.post("/changePass",auth.isLogin,userController.changePass)

//logout
userRoute.get("/logout",auth.isLogin,userController.userLogout)

//forgot mail verification
userRoute.get("/forgotEmail",userController.forgotEmail)
userRoute.post("/getEmail",userController.getEmail)

//forgot  mail-OTP
userRoute.get("/forgotSendOtp",userController.forgotSendOtp)
userRoute.post("/getOtp",userController.getOtp)

//resend
userRoute.get("/forgotResend",userController.forgotResend)

//change password
userRoute.get("/changePassword",userController.changePassword)
userRoute.post("/getPassword",userController.getPassword)

//product list
userRoute.get("/productsList",userController.productsList)

//product details
userRoute.get("/productsDetails",userController.details)

//cart
userRoute.get("/cart",auth.wishCart,cartController.loadCart)
userRoute.post("/addToCart",auth.wishCart,cartController.addToCart)
userRoute.post("/change",auth.wishCart,cartController.change)
userRoute.post("/deleteCart",auth.wishCart,cartController.deleteCart)

//wishlist
userRoute.get("/wishlist",auth.wishCart,wishlistController.loadWishlist)
userRoute.post("/addToWislist",auth.wishCart,wishlistController.addToWishlist)
userRoute.post("/addToCartt",auth.wishCart,wishlistController.addToCart)
userRoute.post("/wishDelete",auth.wishCart,wishlistController.deleteWishlist)

//check out
userRoute.get("/checkOut",auth.isLogin,checkoutController.checkOutLoad)
userRoute.post("/checkOut",auth.isLogin,checkoutController.addressPayment)
userRoute.get("/checkOutAddress",auth.isLogin,checkoutController.checkOutAddress)
userRoute.post("/checkOutAddresss",auth.isLogin,checkoutController.checkOutAddresss)
userRoute.post("/verifyPayment",auth.isLogin,checkoutController.verifyPayment)

//order place
userRoute.get("/placeOrder",auth.isLogin,checkoutController.placeOrder)
userRoute.get("/loadOrder",auth.isLogin,orderController.loadOrder)
userRoute.get("/cancelOrder",auth.isLogin,orderController.cancelOrder)
userRoute.get("/returnOrder",auth.isLogin,orderController.returnOrder)
userRoute.post("/orderConfirm",auth.isLogin,checkoutController.orderConfirm)
userRoute.get("/orderDetails",auth.isLogin,orderController.orderDetails)


//wallet
userRoute.get("/wallet",auth.isLogin,userController.walletLoad)
// userRoute.get("/walletHistory",auth.isLogin,userController.walletHistory)

//coupon
userRoute.post("/applyCoupon",auth.isLogin,couponContoller.applyCoupon)
userRoute.patch("/deleteCoupon",auth.isLogin,couponContoller.removeCoupon)




//invoice
userRoute.get("/invoice",auth.isLogin,userController.invoiceDownload)

userRoute.use(errorMiddleware)


module.exports = userRoute;
