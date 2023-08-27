const express = require("express")
const adminRoute = express()
const auth = require("../middleware/adminAuth")
//controllers
const adminController = require("../controllers/adminController")
const productController = require("../controllers/productController")
const categoryController = require("../controllers/categoryController")
const orderController = require("../controllers/orderController")
const offerController = require("../controllers/offerController")
const couponContoller = require("../controllers/couponController")
const bannerContoller = require("../controllers/bannerController")

const multer = require("../config/multer")

adminRoute.set("views", "./views/admin")

//login
adminRoute.get("/adminLogin",auth.isLogout , adminController.adminLogin)
adminRoute.post("/adminVerify",adminController.verifyAdmin)

//dashboard
adminRoute.get("/home",auth.isLogin,adminController.home)

//user management
adminRoute.get("/userManage",auth.isLogin,adminController.userManage)
adminRoute.get("/userBlock",auth.isLogin,adminController.userBlock)

//category mangement
adminRoute.get("/categoryManagement",auth.isLogin,categoryController.categoryLoad)
adminRoute.post("/categoryManagement",auth.isLogin,categoryController.addCategory)
adminRoute.get("/categoryUnlist",auth.isLogin,categoryController.categoryUnlist )
adminRoute.get("/categoryEdit",auth.isLogin,categoryController.getCategoryEdit)
adminRoute.post("/categoryEdit",auth.isLogin,auth.isLogin,categoryController.categoryEdit)

//add product
adminRoute.get("/productList",auth.isLogin,productController.loadProductList)
adminRoute.get("/unlistProduct",auth.isLogin,productController.unlistProduct)
adminRoute.get("/productAdd",auth.isLogin,productController.loadProductAdd)
adminRoute.post("/productAdd",auth.isLogin,multer.upload.array("img",5),productController.addProduct)

//edit product
adminRoute.get("/productEdit/:id",auth.isLogin,productController.loadProductEdit)
adminRoute.post("/productEdit/:id",auth.isLogin,multer.upload.array("img",5),productController.editProduct)

//img delete
adminRoute.get("/imgDelete/:image/:id",auth.isLogin,productController.deleteImage)

//orderUpdate
adminRoute.get("/orderUpdate",auth.isLogin,orderController.orderUpdateLoad)
adminRoute.post("/updateOrderStatus",auth.isLogin,orderController.updateOrderStatus)

// product offer 
adminRoute.get("/productOffer/:id",auth.isLogin,offerController.loadOffer)
adminRoute.post("/addOffer/:id",auth.isLogin,offerController.addOffer)
adminRoute.get("/removeOffer/:id",auth.isLogin,offerController.removeOffer)

//coupon
adminRoute.get("/coupon",auth.isLogin,couponContoller.loadCoupon)
adminRoute.get("/couponList",auth.isLogin,couponContoller.loadCouponList)
adminRoute.post("/addCoupon",auth.isLogin,couponContoller.addCoupon)
adminRoute.get("/couponEdit",auth.isLogin,couponContoller.couponEditLoad)
adminRoute.post("/editCoupon",auth.isLogin,couponContoller.couponEdit)
adminRoute.get("/couponDelete",auth.isLogin,couponContoller.couponDelete)

//banner
adminRoute.get("/bannerAdd",auth.isLogin,bannerContoller.addBannerLoad)
adminRoute.get("/bannerList",auth.isLogin,bannerContoller.bannerList)
adminRoute.post("/addBanner",auth.isLogin,multer.upload.array("image",5),bannerContoller.addBanner)
adminRoute.get("/editBanner/:id",auth.isLogin,bannerContoller.bannerEditLoad)
adminRoute.post("/editBanner",auth.isLogin,multer.upload.array("image",5),bannerContoller.bannerEdit)
adminRoute.patch("/deleteBannerImage",auth.isLogin,bannerContoller.deleteBannerImage)
adminRoute.get("/unlistBanner",auth.isLogin,bannerContoller.unlistBanner)

//logout
adminRoute.get("/logout",auth.isLogin,adminController.logout)

adminRoute.get("/adminOrder",auth.isLogin,orderController.adminOrder)








module.exports = adminRoute 