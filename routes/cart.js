const express = require("express");
const User = require("../models/User");
const {isLoggedIn} = require("../middleware");
const Product = require("../models/Product");
const router = express.Router();

router.get('/user/cart', isLoggedIn , async (req,res)=> {
    let userId = req.user._id;
    let user = await User.findById(userId).populate('cart');
    res.render('cart/cart',{user});
})

router.post('/user/:productId/add', isLoggedIn , async (req,res)=>{
    let {productId} = req.params;
    let userId = req.user._id;
    let user = await User.findById(userId).populate('cart');
    console.log(user);
    let product = await Product.findById(productId);
    user.cart.push(product);
    await user.save();
    res.redirect("/user/cart");
})

module.exports = router;