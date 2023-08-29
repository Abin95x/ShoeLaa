const User = require("../models/userModel")
const Product = require("../models/productModel")
const Cart = require("../models/cartModel");
const Address = require("../models/addressModel")
const Order = require("../models/orderModel")
const Coupon = require("../models/couponModel")
const Razorpay = require('razorpay');
require("dotenv").config()



var instance = new Razorpay({
    key_id: process.env.KEYID,
    key_secret: process.env.KEYSECRET
  });   


const checkOutLoad = async(req,res, next)=>{
    try{
        const userId = req.session.userId;
        const cartAddress =  await Address.find({ user: userId })
        const cartC = await Cart.findOne({user: req.session.userId})
        const cartCoupon = cartC.coupon
        const coupon = await Coupon.find()
       
        const cart = await Cart.findOne({ user: userId }).populate('product.productId');
        res.render("checkOut",{cartAddress,cart,coupon,cartCoupon})
        
    }catch(error){
        next(error)
    }
}


const checkOutAddress = async(req,res, next)=>{
    try{
    res.render("checkOutAddress")
    }catch(error){
        next(error)
    }
}
const checkOutAddresss = async(req,res, next)=>{
    try{
        const user = req.session.userId
        const cartAddress =  await Address.find({ user: user })
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
        res.redirect("/checkOut")

    }catch(error){
        next(error)
    }
}

const placeOrder = async(req,res, next)=>{
    try{
        const orderId = req.query.orderId
        const orderData = await Order.findOne({_id: orderId}).populate('products.productId');
        const total = orderData.totalAmount
        const orderDate = orderData.date
        const deliveryDate = orderData.expectedDelivery
        const deliveryAddress = orderData.deliveryAddress
        res.render("placeOrder",{orderId,total,orderDate,deliveryDate,deliveryAddress})
    }catch(error){
        next(error)
    }
}

const addressPayment = async(req,res, next)=>{
    try{
        const address = req.body.address
        const payment = req.body.payment
        const total = req.body.total
        let status = payment == "Cash on Delivery" ? "placed" : "pending"
        const userId = await User.findOne({ _id: req.session.userId })
        const cartData = await Cart.findOne({user: userId})
        const cartProducts = cartData.product
        const orderDate = new Date()
        const delivery = new Date(orderDate.getTime()+(10*24*60*60*1000))
        const deliveryDate = delivery.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).replace(/\//g, '-');

       
          
        if(status === "placed"){
            
            const order = new Order({
                user : userId,
                deliveryAddress : address,
                userName: userId.name,
                totalAmount: total,
                date: orderDate,
                payment: payment,
                products: cartProducts,
                expectedDelivery: deliveryDate
            })
            
            const orderData = await order.save() 
            const orderId = orderData._id
            await Cart.deleteOne({user: userId})
    
            
            for(let i = 0 ; i < cartProducts.length ; i++){
                const productId = cartProducts[i].productId
                const count = cartProducts[i].quantity
                await Product.findByIdAndUpdate({_id: productId},{$inc: {quantity: -count}})
            }
            res.json({
                success: true,
                orderId: orderId,
                total: total,
                address: address
            });
        }else{
            
            const order = new Order({
                user : userId,
                deliveryAddress : address,
                userName: userId.name,
                totalAmount: total,   
                date: orderDate,
                payment: payment,
                products: cartProducts,
                expectedDelivery: deliveryDate
            })
            
            
            let orderData = await order.save() 
            
            const orderId = orderData._id
  
            var options = {
                amount: orderData.totalAmount * 100,
                currency: 'INR',
                receipt: '' + orderId,
            }
          

      
        instance.orders.create(options, function (err, order) {
            
          res.json({ order });
        });
           
            
        }
        
    }catch(error){
        next(error)
        // console.log(error.message);

        res.json({
            success: false,
            message: "An error occurred while processing the order."
        });
    }
}

const verifyPayment = async (req, res, next) => {
    try {
       
      

        
        const { userId } = req.session;
        const cartData = await Cart.findOne({user: userId})
        const cartProducts = cartData.product
        let userData = await User.findById({ _id: userId });
        const details = req.body;
        const crypto = require("crypto");
        let hmac = crypto.createHmac("sha256",process.env.KEYSECRET);
        hmac.update(details.payment.razorpay_order_id + "|" + details.payment.razorpay_payment_id);
        hmac = hmac.digest("hex");
        if (hmac === details.payment.razorpay_signature) {
          await Order.findByIdAndUpdate(
            { _id: details.order.receipt },
            { $set: { paymentId: details.payment.razorpay_payment_id } }
          );const applyCoupon = async (req, res, next) => {
            try {
                const couponCode = req.body.couponCode;
                const grandTotal = req.body.total;
        
                const couponData = await Coupon.findOne({ code: couponCode });
                
                if (!couponData) {
                    res.json({failed:true})
                    return;
                }
                
                if (couponData.user.includes(req.session.userId)) {
                    res.json({failed:true})
                    return;
                }
        
                const discountPercentage = couponData.discountPercentage;
                const discountedAmount = (discountPercentage / 100) * grandTotal;
                const finalTotal = grandTotal - discountedAmount;
        
                console.log('Discounted Total:', finalTotal);
        
                const cartData = await Cart.findOneAndUpdate(
                    { user: req.session.userId },
                    {
                        $inc: { grandTotal: -discountedAmount },
                        $push: { coupon: couponCode }
                    },
                    { new: true } 
                );
        
                await Coupon.findOneAndUpdate(
                    { code: couponCode },
                    { $push: { user: req.session.userId } }
                );
        
                res.json({ success: true, cartData: cartData });
                
            } catch (error) {
                next(error);
            }
        };
          await Order.findByIdAndUpdate(
            { _id: details.order.receipt },
            { $set: { status: "Placed" } }
          );
          await Cart.deleteOne({user: userId})
        
          for (let i = 0; i < cartProducts.length; i++) {
            const productId = cartProducts[i].productId;
            const count = cartProducts[i].quantity;
            await Product.findByIdAndUpdate({ _id: productId }, { $inc: { quantity: -count } });
           }
            
        res.json({ success: true });
            

        } else {
            await Order.deleteOne({ _id: details.order.receipt });
            res.json({ success: false });
            

        }
        
        
    } catch (error) {
        next(error)
        res.json({ success: false });
        
    }
}
const orderConfirm = async (req, res, next) => {
    try {
        
      const { userId } = req.session;
      const order = await Order.findOne({ user: userId });
      res.render("orderSuccess", { order });
    } catch (error) {
      next(error)
   

    }
  };


module.exports = {
    checkOutLoad,
    checkOutAddress,
    checkOutAddresss,
    placeOrder,
    addressPayment,
    verifyPayment,
    orderConfirm
}