const User = require("../models/userModel")
const bcrypt = require("bcryptjs")
const nodemailer = require("nodemailer")
const Category = require("../models/categoryModel")
const Product = require("../models/productModel")
const Address = require("../models/addressModel")
const Cart = require("../models/cartModel")
const Order = require("../models/orderModel")
const Banner = require("../models/bannerModel")
const { query } = require("express")
const path = require('path')
const fs = require("fs")
require("dotenv").config()
const crypto = require("crypto");
const ejs = require("ejs");
const puppeteer = require("puppeteer")





let otpGlobal
let emailGlobal
let globalId
let nameGlobal

//for forgot passsword----------

let emailGlobal2
let globalId2
let nameGlobal2
let otpGlobal2



//password hashing-------------------------------------------------------------------------------------------------------------

const securePassword = async(password)=>{
  try{
    const passwordHash = await bcrypt.hash(password,10)
    return passwordHash
  }catch(error){
    next(error)
  }
}

//user sign up and passing arguments to email varifying function---------------------------------------------------------------

const insertUser = async (req, res , next) => {
  try {
    emailGlobal = req.body.email
    nameGlobal = req.body.name
    const existingUser = await User.findOne({ email: req.body.email });
    const code = req.body.referral   
    const codeData = await User.findOne({referral: code})

    if (existingUser) {
      res.render("userSignup", { message: "Email Already Registered" });
    } else {
      if (codeData) {
        const sPassword = await securePassword(req.body.password);
        const user = new User({
          name: req.body.name,
          mobile: req.body.mobile,
          email: req.body.email,
          password: sPassword,
          isVerified: 0,
          isAdmin: 0,
          isBlock: false,
          referral: req.body.code,
          wallet:100,
        });
        
        await User.findOneAndUpdate({referral: code},{$inc:{wallet:200}})

        const userData = await user.save()

      if (userData) {
        globalId = userData._id
        sendVerifyMail(req.body.name, req.body.email, userData._id)
        res.render("otpVerification",{
          message:"  We've sent an OTP to your Email Please enter it below to complete verification. "})
        } else {

          res.render("userSignup", {
            messageRed: "Your registration has failed",
          });
          otpGlobal = otp
           const transporter = nodemailer.createTransport({
             host:"smtp.gmail.com",
             port:587,
             requireTLS:false,
             auth:{
               user:process.env.email,
               pass:process.env.password 
             }
           })
        }
      }else{
        const sPassword = await securePassword(req.body.password);
        const user = new User({
          name: req.body.name,
          mobile: req.body.mobile,
          email: req.body.email,
          password: sPassword,
          isVerified: 0,
          isAdmin: 0,
          isBlock: false,
          referral: req.body.code,
        });

      const userData = await user.save()

      if (userData) {
        globalId = userData._id
        sendVerifyMail(req.body.name, req.body.email, userData._id)
        res.render("otpVerification",{
          message:"  We've sent an OTP to your Email Please enter it below to complete verification. "})
        } else {

          res.render("userSignup", {
            messageRed: "Your registration has failed",
          });
          otpGlobal = otp
           const transporter = nodemailer.createTransport({
             host:"smtp.gmail.com",
             port:587,
             requireTLS:false,
             auth:{
               user:process.env.email,
               pass:process.env.password 
             }
           })
        }
      }
    }
    } catch (error) {
    next(error) //error handling middle ware****************
  }
  
};



//send verify email and sending OTP------------------------------------------------------------------------------------


const sendVerifyMail = async (name,email,id)=>{
  try{
   
    const otp = Math.floor(1000 + Math.random()*9999)
    // const otpExpiration = new Date().getTime() + 30 * 60 * 1000;
    // const otpExpiration = new Date().getTime() + 10 * 1000;

    otpGlobal = otp
    otpGlobal2=otpGlobal

    const transporter = nodemailer.createTransport({
      host:"smtp.gmail.com",
      port:587,
      requireTLS:false,
      auth:{
        user:process.env.email,
        pass:process.env.password 
      }
    })

    const mailOptions = {
      from:process.env.email,
      to:email,
      subject:"For OTP verification",
      html:"<p> Hi " + name + ',please click here to and enter the ' + otp + " for your verification " + email + "</p>"
    } 
    transporter.sendMail(mailOptions,(error,info)=>{
      if(error){
        console.log(error)
      }else{
        console.log("Email has been send.")
        console.log("OTP:- " + otp);
        console.log("OTP Expiration: " + otpExpiration);
      }
    })

  }catch(error){
    next(error)
  }
}

//OTP validation -checking the OTP is correct or not----------------------------------------------------------

const otpValidation = async(req,res, next)=>{
  try{
    const otpInput = req.body.otp
    
    console.log(otpInput);
    console.log(otpGlobal);

    if(otpInput == otpGlobal  ){
      const userData = await User.updateOne(
        {email:emailGlobal},
        {$set:{isVerified:1}}
        )
      res.render("userLogin",{message:"Successful... Please Login"})
    }else{
      res.render("otpVerification",{message2:"Invalid OTP"})
    }
  }catch(error){
    next(error)
  }
}

//user login----------------------------------------------------------------------------------------------------

const verifyLogin = async(req,res,next)=>{
  try{
    const Email = req.body.email
    const Password = req.body.password
    
    const userData = await User.findOne({email:Email})
    
    if(userData){
      const passwordMatch = await bcrypt.compare(Password,userData.password)
      if(passwordMatch){
        if(userData.isVerified===0 || userData.isBlock===true){ 
          res.render("userLogin",{messageRed:"Please verify your Email or Account is blocked by admin  "})
        }else{
          req.session.userId = userData._id
          // req.session.isAdmin = userData.isAdmin
          res.redirect("/")
        }
      }else{
        res.render("userLogin",{messageRed:"Email or Password is incorrect"})
      }
    }else{
      res.render("userLogin",{messageRed:"Email or Password is incorrect"})
    }

  }catch(error){
    next(error)
  }
}

//resend otp

const resendOtp = async(req,res,next)=>{
  try{

    sendVerifyMail(nameGlobal,emailGlobal,globalId);
    res.render("otpVerification");

  }catch(error){
    next(error)
  }
}

//profile
const userProfile = async(req,res,next)=>{
  try{
    const user = req.session.userId
    const details = await User.findById(user)
    const addresss = await Address.findOne({ user: req.session.userId });
    res.render("userProfile",{user,details,addresss})
    

  }catch(error){
    next(error)
  }
}

//add address
const addAddress = async(req,res,next)=>{
  try{
    res.render("addAddress")

  }catch(error){
    next(error)
  }
}

//save address
const saveAddress = async(req,res,next)=>{
  try{
    const user = req.session.userId
    const details = await User.findById(user)
    const addresss = await Address.findOne({ user: req.session.userId });
    
    const address = new Address({
      country:req.body.country,
      name:req.body.name,
      mobile:req.body.mobile,
      pin:req.body.pin,
      houseName:req.body.houseName,
      village:req.body.village,
      state:req.body.state,
      user:req.session.userId
    })
    const addressData = await address.save()
    res.render("userProfile" , { user,details,addresss })

  }catch(error){
    // next(error)
    next(error)
  }
}

//show address
const showAddress = async(req,res,next)=>{
  try{
    const userId = req.session.userId;
    const cartAddress =  await Address.find({ user: userId })
    // const cart = await Cart.findOne({ user: userId }).populate('product.productId');
    res.render("showAddress",{cartAddress})
  }catch(error){
    next(error)
  }
}

//update address
const editAddress = async(req,res,next)=>{
  try{
    const id = req.query.id
    const addresss = await Address.findById({ _id : id});
    res.render("editAddress",{addresss})
  }catch(error){
    next(error)
  }
}
// delete address
const deleteAddress = async (req,res,next)=>{
  try{
    const addressId = req.query.id;
    await Address.findByIdAndRemove(addressId);
    res.redirect("/showAddress")
  }catch(error){
    next(error)
  }
}

//update address checkOut
const editCheckOut = async(req,res)=>{
  try{
    const id = req.query.id
    const addresss = await Address.findById({ _id : id});
    res.render("editAddressCheckOut",{addresss})
  }catch(error){
    next(error)
  }
}
// delete address checkout
const deleteCheckOut = async (req,res,next)=>{
  try{
    const addressId = req.query.id;
    await Address.findByIdAndRemove(addressId);
    res.redirect("/checkOut")
  }catch(error){
   next(error)
  }
}
// update address checkout
const updateAddressCheckOut = async(req,res,next)=>{
  try{
    
      const id = req.params.id;
      const country = req.body.country;
      const pin = req.body.pin;
      const mobile = req.body.mobile;
      const houseName = req.body.houseName;
      const village = req.body.village;
      const state = req.body.state;

      const editedAddress = await Address.findOneAndUpdate({_id:id},
        {$set:{
          country: country,
          pin: pin,
          mobile: mobile,
          houseName: houseName,
          village: village,
          state: state,

        }})
        res.redirect(`/checkOut?id=${id}`)

  }catch(error){
    next(error)
  }
}


const updateAddress = async(req,res,next)=>{
  try{
    
      const id = req.params.id;
      const country = req.body.country;
      const pin = req.body.pin;
      const mobile = req.body.mobile;
      const houseName = req.body.houseName;
      const village = req.body.village;
      const state = req.body.state;

      const editedAddress = await Address.findOneAndUpdate({_id:id},
        {$set:{
          country: country,
          pin: pin,
          mobile: mobile,
          houseName: houseName,
          village: village,
          state: state,

        }})
        res.redirect(`/userProfile?id=${id}`)

  }catch(error){
    next(error)
  }
}
 //changepass
 const changePassLoad = async(req,res,next)=>{
  try{
    res.render("changePass")
  }catch(error){
    next(error)
  }
 }

 const changePass = async(req,res,next)=>{
  try{
    const user = req.session.userId
    const userData = await User.findOne({_id:user})
    const details = await User.findById(user)
    const addresss = await Address.findOne({ user: req.session.userId });
    
    
    const currPass = req.body.currPassword
    const pass1 = req.body.password1
    const pass2 = req.body.password2
  
    const passwordMatch = await bcrypt.compare(currPass,userData.password)

    if(passwordMatch){
      
      if(pass1==pass2){
        const newPass = pass1
        const sPassword = await securePassword(newPass);
      
        await User.findOneAndUpdate({_id: user},{$set:{password:sPassword}},{new:true})
        
        res.render("userProfile",{user,details,addresss,message:"password changed"})
        
      }else{
        
        res.render("changePass",{message:"enter same password"})
       
    }
    }else{
      
      res.render("changePass",{message:"current password is wrong"})
    }


  }catch(error){
    next(error)
  }
 }


//------------------------------------------------------------------------------------------------


const loadHome = async(req,res,next)=>{
  try{
    
    
    const banner = await Banner.find({})
    const user =req.session.userId
    
    const { page } = req.query;
    let condition = { blocked: false };
    const currentPage = parseInt(page) || 1
    const productsCount = await Product.countDocuments(condition);
    const totalPages = Math.ceil(productsCount / productsPerPage);
    const products = await Product.find(condition)
      .skip((currentPage - 1) * productsPerPage)
      .limit(productsPerPage);


    res.render("home", {user,products,banner,totalPages,currentPage,page})
  }catch(error){
    next(error)
  }
}

//display products ,search,sort,filter,pagination

const productsPerPage = 8; // Number of products per page

const productsList = async (req, res,next) => {
  try {
    const { search, cat, sort, page } = req.query;

    let condition = { blocked: false };

    if (cat) {
      condition.category = cat;
    }

    if (search) {
      condition.name = { $regex: search, $options: "i" };
    }

    const currentPage = parseInt(page) || 1; // Default page is 1

    // Sort option (default: by product name)
    const sortOption = {};
    if (sort === "low-to-high") {
      sortOption.price = 1; // Sort by price in ascending order
    } else if (sort === "high-to-low") {
      sortOption.price = -1; // Sort by price in descending order
    }

    const productsCount = await Product.countDocuments(condition);
    const totalPages = Math.ceil(productsCount / productsPerPage);

    const products = await Product.find(condition)
      .skip((currentPage - 1) * productsPerPage)
      .limit(productsPerPage);

    // Sort the products based on the sort option (only for the current page)
    if (sortOption.price) {
      products.sort((a, b) => {
        return (a.price - b.price) * sortOption.price;
      });
    }

    const categories = await Category.find({ blocked: false });

    res.render("productsList", {
      categories,
      products,
      search,
      cat,
      sort,
      totalPages,
      currentPage,
      page
    });
  } catch (error) {
    next(error)
  }
};





const details = async (req,res,next)=>{
  const id = req.query.id
  const product = await Product.findById(id)
  try{
    res.render("productsDetails",{product})
  }catch(error){
     next(error)
  }
}

const loadLogin = async(req,res,next)=>{
  try{
    res.render("userLogin")
  }catch(error){
     next(error)
  }
}

const loadSignup = async(req,res,next)=>{
  try{
 
  function generateRandomString(length) {
      return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  }

    const randomString = generateRandomString(10)

    res.render("userSignup",{randomString})
  }catch(error){
    next(error)
  }
}
const userLogout = async(req,res,next)=>{
  try{
req.session.destroy();
res.redirect('/')
  }
  catch(error){
      next(error)
  } 
}

//forgot password(verifying email)------------------------------------------------------------------------------------------

const getEmail = async(req,res,next)=>{
  try{
    const email = req.body.email
    const userData = await User.findOne({email:email})
    if(userData){

         emailGlobal2 = req.body.email
         globalId2 = userData._id
         nameGlobal2 = req.body.name
        res.redirect('/forgotSendOtp')

      }else{
        res.render("forgotEmail",{message : "email not verified"})
      }
  }catch(error){
      next(error)
  }
}

const forgotEmail = async(req,res,next)=>{
  try{
    res.render("forgotEmail")
  }catch(error){
    next(error)
  }
}

//(OTP)------------------------------------------------------------------------------------------------------------

const forgotSendOtp = async(req,res,next)=>{
  try{
 
    sendVerifyMail(nameGlobal2,emailGlobal2,globalId2)

    res.render("forgotSendOtp")
  }catch(error){
      next(error)
  }
}

const getOtp = async(req,res,next)=>{
  try{
    
    const otpInput = req.body.otp
    console.log(otpGlobal2);
    console.log(otpInput )

    if(otpInput == otpGlobal2){
      res.render("changePassword",{message1:"Successful..."})
    }else{
      res.render("forgotSendOtp",{message2:"Invalid OTP"})
    }
  }catch(error){
    next(error)
  }
}

const forgotResend = async(req,res,next)=>{
  try{

    sendVerifyMail(nameGlobal2,emailGlobal2,globalId2)
    res.render("forgotSendOtp",{message3:"OTP Resend"})

  }catch(error){
    next(error)
  }
}

//change password
const changePassword = async(req,res,next)=>{
  try{
    res.render("changePassword")
  }catch(error){
    next(error)
  }
} 

const getPassword = async(req,res,next)=>{
  try{
    const pass1 = req.body.password1
    const pass2 = req.body.password2

    const newPassword =  await securePassword(pass1)

    if(pass1 == pass2){
      
      await User.findOneAndUpdate({_id:globalId2},{$set:{password:newPassword}}, {new: true})
     res.render('userLogin',{messagePass:"Password Changed Successfully..."})
    }else{
      res.render("changePassword",{messagePassErr:"Enter Same Password"})
    }
    
  }catch(error){
    next(error)
  }
}

const walletLoad = async(req,res,next)=>{
  try{
    
    const userId = req.session.userId
    const userData = await User.findOne({_id: userId})
    const wallet = userData.wallet

    console.log(wallet);
    res.render("wallet",{wallet})
  }catch(error){
    next(error)
  }
}
const invoiceDownload = async (req,res,next) => {
  try {
    const {orderId} = req.query
    const {userId} = req.session
    let sumTotal = 0
    const userData = await User.findById(userId)
    const orderData = await Order.findById(orderId).populate('products.productId')
    orderData.products.forEach(item =>{
      const total = item.productId.price *  item.quantity
      sumTotal += total
    })
    const date = new Date()
    const data = {
      order:orderData,
      user:userData,
      date,
      sumTotal
    }

    const filepathName = path.resolve(__dirname,"../views/user/invoice.ejs")

    const html = fs.readFileSync(filepathName).toString()

    const ejsData = ejs.render(html,data)

    const browser = await puppeteer.launch({ headless: "new" ,executablePath: "/usr/bin/chromium-browser" });

    const page = await browser.newPage();

    await page.setContent(ejsData, { waitUntil: "networkidle0" });

    const pdfBytes = await page.pdf({ format: "Letter" });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      "attachment; filename= order invoice.pdf"
    );
    res.send(pdfBytes);
  } catch (error) {

   next(error)
  }
}







module.exports = {
  insertUser,
  verifyLogin,
  userProfile,
  addAddress, 
  saveAddress,
  showAddress,
  editAddress,
  deleteAddress,
  editCheckOut,
  deleteCheckOut,
  updateAddressCheckOut,
  updateAddress,
  changePass,
  changePassLoad,
  loadHome,
  productsList,
  details,
  loadLogin,
  loadSignup,
  userLogout,
  otpValidation,
  resendOtp,
  getEmail,
  forgotEmail,
  forgotSendOtp,
  getOtp,
  forgotResend,
  changePassword,
  getPassword,
  walletLoad,
  invoiceDownload,
}


