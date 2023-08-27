const User = require("../models/userModel")
const Product = require("../models/productModel")
const Wishlist = require("../models/wishlistModel")
const Cart = require("../models/cartModel")

const loadWishlist = async (req, res, next) => {
    try {
        const userId = req.session.userId
        const wishlist = await Wishlist.findOne({ user: userId }).populate('product.productId');
        res.render("wishlist",{wishlist});
    } catch (error) {
        next(error)
    }
}

const addToWishlist = async(req,res, next)=>{
    try{
            const productId = req.body.productId
            const product = await Product.findOne({ _id: productId })
            const userId = await User.findOne({ _id: req.session.userId })
            const wishlist = await Wishlist.findOne({user: userId})

            if (wishlist) {
                const existProduct = await Wishlist.findOne({ user: userId, 'product.productId': product })
               
                if (existProduct) {
                    res.json({ success: false, message: 'Product already exists' })
    
                } else {
                    await Wishlist.findOneAndUpdate({ user: userId }, { $push: { product: { productId: product } } })
                    res.json({ success: true })
                }
    
            } else {
    
                const wishlist = new Wishlist({
                    user: userId,
                    product: [{
                        productId: product
                    }]
                })
    
                const newWish = await wishlist.save()
                if (newWish) {
                    res.json({ success: true })
                } else {
                    res.json({ success: false, message: 'Something went wrong' })
                }
            }
        
    }catch(error){
        next(error)
    }
}

const addToCart = async (req, res, next) => {
    try {

        const productId = req.body.productId
        const cartData = await Cart.findOne({ user: req.session.userId })
        const product = await Product.findOne ({ _id : productId })  
        const currentTime = new Date();
        const offerEndDate = new Date(product.offerEndTime);  

        if (cartData) {
            const exist = cartData.product.find((product) => product.productId.toString() === productId)
            if (exist) {
                res.json({ success: false, message: 'Product is already in cart' })
            } else {
                let total
                if(product.offerPrice && offerEndDate>currentTime){
                    total = 1 * product.offerPrice           
                }else{
                    total = 1 * product.price           
                }
                await Cart.findOneAndUpdate({ user: req.session.userId },
                {
                    $inc:{
                        grandTotal:total
                    },
                    $push: {
                        product: {
                            productId: productId,
                            price: product.price,
                            offerPrice:product.offerPrice,
                            quantity:1,
                            totalPrice: total,
                            offerEndTime: offerEndDate
                        }
                    }
                })           
                res.json({ success : true })
            }
        }else{
            
            let total
            if(product.offerPrice && offerEndDate>currentTime){       
                 total = 1 * product.offerPrice      
            }else{      
                 total = 1 * product.price    
            }
            const cart = new Cart({
                user : req.session.userId,
                grandTotal: total,
                product : [{
                    productId : productId,
                    price: product.price,
                    offerPrice: product.offerPrice,
                    quantity: 1,
                    totalPrice: total,  
                    offerEndTime: offerEndDate                
                }]
            })
            const cartData = await cart.save()
            if(cartData) {
                res.json({ success : true })
            }else{
                res.json({ success : false , message : 'Something wrong' })
            }
        }

    } catch (error) {
        next(error)
    }
}
const deleteWishlist = async (req , res, next) => {
    try {

        const productId = req.body.proId
        const wishData = await Wishlist.findOne({ user : req.session.userId })
        

        if(wishData.product.length === 1) {
            await Wishlist.deleteOne({ user : req.session.userId})
            
            res.json({ success : true })
        }else{
            await Wishlist.findOneAndUpdate({ user : req.session.userId } , {
                $pull : { product : { productId : productId }}
            })

            res.json({ success : true })
        }
        
    } catch (error) {
        next(error)
    }
}

module.exports = {
    loadWishlist,
    addToWishlist,
    addToCart,
    deleteWishlist,
}
