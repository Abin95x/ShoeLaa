const User = require("../models/userModel")
const Product = require("../models/productModel")
const Cart = require("../models/cartModel");
const Address = require("../models/addressModel")
const Order = require("../models/orderModel");




//user

const loadOrder = async (req, res, next) => {
    try {
        const user = req.session.userId;
        const orderData = await Order.find({ user: user }).populate("products.productId");
        const moment = require('moment');

        res.render("orders", {orderData,moment: moment});
    } catch (error) {
        next(error);
    }
};



const cancelOrder = async (req, res, next) => {
  try {
      const { orderId, productId, quantity, total, orderid, payment } = req.query;
      const userId = req.session.userId;

      const user = await User.findById(userId);
      if (payment === "RazorPay") {
        const totalAmount = parseFloat(total);
        
        user.wallet += totalAmount;
      
        await user.save();
      }
      

      await Order.updateOne({ _id: orderId, "products._id": orderid }, { $set: { "products.$.status": "cancelled" } });

      const order = await Order.findOne({ _id: orderId });

      const updatedTotalAmount = order.totalAmount - parseFloat(total);

      await Order.updateOne({ _id: orderId }, { $set: { totalAmount: updatedTotalAmount } });

      await Product.updateOne({ _id: productId }, { $inc: { quantity: quantity } });

      const orderData = await Order.find({ user: user }).populate("products.productId");
      const moment = require('moment');

      res.render("orders", { orderData, moment: moment, message: "Cancelled product price added to the wallet !!" });

  } catch (error) {
      next(error);
  }
};


const returnOrder = async(req,res, next)=>{
    try{

        const { orderId, productId, quantity ,total ,orderid} = req.query;
        
        await Order.updateOne({ _id: orderId,"products._id": orderid},{$set: {"products.$.status":"Returned"}})

        await Product.updateOne({_id: productId}, {$inc: {quantity: quantity }});

        res.redirect("/loadOrder")
        
    }catch(error){
       next(error)
    }
}


//admin

const orderUpdateLoad = async(req,res, next)=>{
    try{
       
        // const orderData = await Order.find({})
        const orderData = await Order.find({}).populate("products.productId")
        const moment = require('moment')
        res.render("orders",{orderData,moment:moment})

    }catch(error){
       next(error)
    }
}

//udate status
const updateOrderStatus = async (req, res, next) => {
    try {
      const { orderId, productId, status } = req.body;


      const result = await Order.updateOne(
        { _id: orderId, "products._id": productId },{ $set: { "products.$.status": status } });

      res.redirect("/admin/orderUpdate");
    } catch (error) {
     next(error)
    }
  };


  const orderDetails = async(req,res,next)=>{
    try{
        const id =req.query.id
        const product = await Product.findById(id)
        res.render("orderDetails",{product})

    }catch(error){
        next(error)
    }
  }
  

  const adminOrder = async(req,res,next) =>{
    try{
      const id =req.query.id
      console.log(id);
      const product = await Product.findById(id)
      console.log(product);
      res.render("orderDetails",{product})
    }catch(error){
      next(error)
    }
  }
  



module.exports={
    loadOrder,
    cancelOrder,
    returnOrder,
    orderUpdateLoad,
    updateOrderStatus,
    orderDetails,
    adminOrder
}