const User = require("../models/userModel")
const Product = require("../models/productModel")
const Cart = require("../models/cartModel");
const Address = require("../models/addressModel")
const Coupon = require("../models/couponModel")

const loadCart = async (req, res , next) => {
    try {
        const coupon = await Coupon.find({})
        const userId = req.session.userId;
        const cart = await Cart.findOne({ user: userId }).populate('product.productId');        
        res.render("cart", {cart,coupon});
    } catch (error) {
        next(error)
    }
};

const addToCart = async (req, res, next) => {
    try {
        const productId = req.body.productId;
        const product = await Product.findOne({ _id: productId });
        const userId = req.session.userId;
        const currentTime = new Date();
        const offerEndDate = new Date(product.offerEndTime);

        let total, grandTotal;

        if (product.offerPrice && offerEndDate > currentTime) {
            total = 1 * product.offerPrice;
            grandTotal = product.offerPrice;
        } else {
            total = 1 * product.price;
            grandTotal = product.price;
        }

        const cart = await Cart.findOne({ user: userId });

        if (cart) {
            const existingProductIndex = cart.product.findIndex((p) => p.productId.toString() === productId);

            if (existingProductIndex !== -1) {
                let value = parseInt(req.body.quantity) * (product.offerPrice || product.price);

                await Cart.updateOne(
                    { user: userId, 'product.productId': productId },
                    {
                        $inc: {
                            'product.$.quantity': parseInt(req.body.quantity),
                            'product.$.totalPrice': value,
                            grandTotal: grandTotal
                        }
                    }
                );
            } else {
                cart.grandTotal += grandTotal;
                cart.product.push({
                    productId: productId,
                    price: product.price,
                    offerPrice: product.offerPrice,
                    quantity: 1,
                    totalPrice: total,
                    offerEndTime: offerEndDate
                });
            
                await cart.save();
            }
            
        } else {
            const cartData = new Cart({
                user: userId,
                grandTotal: grandTotal,
                product: [
                    {
                        productId: productId,
                        price: product.price,
                        offerPrice: product.offerPrice,
                        quantity: 1,
                        totalPrice: total,
                        offerEndTime: offerEndDate
                    }
                ]
            });

            await cartData.save();
        }

        res.json({ success: true, message: 'Product added' });
    } catch (error) {
        next(error);
    }
};


const change = async (req, res, next) => {
    try {
        const count = req.body.count;
        const cartId = req.body.cartId;
        const productId = req.body.productId;

        const cart = await Cart.findOne({ user: req.session.userId });
        const product = await Product.findOne({ _id: productId });

        const cartProduct = cart.product.find(product => product.productId.toString() === productId);

        if (count == 1) {
            if (cartProduct.quantity < product.quantity) {
                const updateFields = {
                    $inc: {
                        'product.$.quantity': 1,
                        'product.$.totalPrice': product.offerPrice ? product.offerPrice : product.price
                    }
                };

                if (product.offerPrice) {
                    updateFields.grandTotal = cart.grandTotal + product.offerPrice;
                } else {
                    updateFields.grandTotal = cart.grandTotal + product.price;
                }

                await Cart.updateOne(
                    { user: req.session.userId, 'product.productId': productId },
                    updateFields
                );

                res.json({ success: true });
            } else {
                res.json({
                    success: false,
                    message: `The maximum quantity available for this product is ${product.quantity}. Please adjust your quantity.`
                });
            }
        } else if (count == -1) {
            if (cartProduct.quantity > 1) {
                const updateFields = {
                    $inc: {
                        'product.$.quantity': -1,
                        'product.$.totalPrice': -product.offerPrice ? product.offerPrice : product.price
                    }
                };

                if (product.offerPrice) {
                    updateFields.grandTotal = cart.grandTotal - product.offerPrice;
                } else {
                    updateFields.grandTotal = cart.grandTotal - product.price;
                }

                await Cart.updateOne(
                    { user: req.session.userId, 'product.productId': productId },
                    updateFields
                );

                res.json({ success: true });
            } else {
                res.json({ success: false, message: 'Cannot decrement the quantity anymore' });
            }
        } else {
            res.json({ success: false, message: 'Invalid count value' });
        }
    } catch (error) {
        next(error);
    }
};


const deleteCart = async (req, res, next) => {
    try {
        const productId = req.body.productId;
        const cartData = await Cart.findOne({ user: req.session.userId });
        
        // Find the index of the product to be deleted
        const productIndex = cartData.product.findIndex(item => item._id.equals(productId));

        if (productIndex === -1) {
            return res.status(404).json({ success: false, message: "Product not found in cart" });
        }

        const productPrice = cartData.product[productIndex].totalPrice;
        const newGrandTotal = cartData.grandTotal - productPrice;

        if (cartData.product.length === 1) {
            await Cart.deleteOne({ user: req.session.userId });
        } else {
            await Cart.updateMany (
                { user: req.session.userId },
                { $pull: { product: { _id: productId } } }
            );

            cartData.grandTotal = newGrandTotal;
            await cartData.save();
        }

        res.json({ success: true });

    } catch (error) {
        next(error.message);
    }
}





 


module.exports = {
    loadCart,
    addToCart,
    change,
    deleteCart,
}