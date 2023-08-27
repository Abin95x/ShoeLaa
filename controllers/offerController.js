const Admin = require("../models/adminModel")
const User = require("../models/userModel")
const Category = require("../models/categoryModel")
const Product = require("../models/productModel")
const mongoose = require('mongoose');

const loadOffer = async(req,res,next) => {
    try{ 
        const productId = req.params.id
        
        const products = await Product.findOne({_id:productId})
        
        res.render("productOffer",{products})
    }catch(error){
        next(error)
    }
}
const addOffer = async(req,res,next) => {
    try{
        const productId = req.params.id
        const percentage = req.body.percentage

        
        const products = await Product.findOne({_id:productId})
        const offerDate = req.body.offerDate
        let offerEndTime = new Date(offerDate);
        offerEndTime.setDate(offerEndTime.getDate() + 7);


        const currentPrice = products.price;
        const discountAmount = Math.floor((currentPrice * percentage) / 100) 
        const newPrice = currentPrice - discountAmount;
        
        products.offerPrice = newPrice
        products.offerStartTime = offerDate;
        products.offerEndTime = offerEndTime;

        await products.save()
        res.redirect("/admin/productList")
        
    }catch(error){
        next(error)
    }
}


const removeOffer = async(req,res,next) => {
    try{
        const productId = req.params.id
        const products = await Product.findOne({_id:productId})


        products.offerPrice = null
        products.offerEndTime = null;
        products.offerStartTime = null;
        
        products.offerPrice = null
       
        await products.save()
        res.redirect("/admin/productList")
        
    }catch(error){
        next(error)
    }
}


module.exports = {
    loadOffer,
    addOffer,
    removeOffer
}