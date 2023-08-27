const Coupon = require("../models/couponModel")
const Cart = require("../models/cartModel")
const User = require("../models/userModel")


const loadCoupon = async(req,res,next) => {
    try{
        res.render("coupon")
    }catch(error){
        next(error)
    }
}

const loadCouponList = async(req,res,next) => {
    try{
        const couponData = await Coupon.find({})
        res.render("couponList",{couponData})
    }catch(error){
        next(error)
    }
}

const addCoupon = async (req, res, next) => {
    try {
        const code = req.body.code.toUpperCase(); // Convert the coupon code to uppercase
        const exist = await Coupon.findOne({ code: code });

        if (exist) {
            res.render("coupon", { message: "Coupon already exists" });
        } else {
            const newCoupon = new Coupon({
                code: code,
                discountPercentage: req.body.discount,
                startDate: req.body.startingDate,
                expireDate: req.body.expirationDate
            });
            await newCoupon.save();
            res.redirect("/admin/couponList");
        }
    } catch (error) {
        next(error);
    }
};


const couponEditLoad = async(req,res,next)=>{
    try{
        // const couponData = await Coupon.find({})
        const couponId = req.query.id
        const coupon = await Coupon.findById({_id: couponId})
       
        
        res.render("couponEdit",{coupon})
    }catch(error){
        next(error)
    }
}

const couponEdit = async(req,res,next)=>{
    try{
        const id = req.query.id
        await Coupon.findOneAndUpdate({_id: id},
            {
                $set: {
                    code: req.body.code.toUpperCase(),
                    discountPercentage: req.body.discount,
                    startDate: req.body.startingDate,
                    expireDate: req.body.expirationDate
                }
            })
            res.redirect("/admin/couponList")

    }catch(error){
        next(error)
    }
}

const couponDelete = async(req,res,next)=>{
    try{
        const id = req.query.id
        
        await Coupon.findOneAndDelete({_id: id})
       
        res.redirect("/admin/couponList")


    }catch(error){

        next(error)
        
    }
}
let grandTotal2

const applyCoupon = async (req, res, next) => {
    try {
        const couponCode = req.body.couponCode;
        const grandTotal = req.body.total;
        grandTotal2 = req.body.total
        const couponData = await Coupon.findOne({ code: couponCode });
        const cartC = await Cart.findOne({user: req.session.userId})
        const cartCoupon = cartC.coupon

            if (!couponData) {
                res.json({ failed: true, reason: "Invalid coupon code" });
                return;
            }
            const currentDate = new Date();
            const start = couponData.startDate;
            const end = couponData.expireDate;
    
            if (currentDate < start || currentDate > end) {
                res.json({ failed: true, reason: "Coupon is not valid at this time" });
            return;
            }
    
            const cart = await Cart.find({});
    
            if (couponData.user.includes(req.session.userId)) {
                res.json({ failed: true, reason: "Coupon already used by this user" });
            return;
            }
    
            const discountPercentage = couponData.discountPercentage;
            const discountedAmount = Math.floor((discountPercentage / 100) * grandTotal);
            const finalTotal = grandTotal - discountedAmount;

            
    
            const cartData = await Cart.findOneAndUpdate(
                { user: req.session.userId },
                {
                    $inc: { grandTotal: -discountedAmount },
                    $set: { coupon: couponCode }
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

const removeCoupon = async (req, res, next) => {
    try {
        const userId = req.session.userId;
        const selectedCoupon = req.body.coupon; 
        console.log(selectedCoupon, "111111111111111111111111111111111111");

        // Step 1: Fetch the user's cart details from the database
        const cart = await Cart.findOne({ user: req.session.userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const coupon = cart.coupon;
        const grandTotal = cart.grandTotal;

        // Step 2: Check if the user has the selected coupon
        if (coupon !== selectedCoupon) {
            return res.status(400).json({ message: 'Selected coupon does not match user coupon' });
        }

        // Calculate the new grand total after removing the coupon discount
        let newGrandTotal = grandTotal2; // Initialize with the current total

        if (coupon && coupon.discountPercentage) {
            const discountAmount = (coupon.discountPercentage / 100) * grandTotal2;
            newGrandTotal = grandTotal2 - discountAmount;
        }

        // Step 3: Update the user's cart with the new grand total and remove the coupon
        cart.coupon = null;
        cart.grandTotal = newGrandTotal;
        await cart.save(); // Save the updated cart data
        
        return res.status(200).json({ message: 'Coupon removed successfully', newGrandTotal });

    } catch (error) {
        next(error);
    }
};




module.exports = {
    removeCoupon
};









module.exports = {
    loadCoupon,
    loadCouponList,
    addCoupon,
    couponEditLoad,
    couponEdit,
    couponDelete,
    applyCoupon,
    removeCoupon
    
}