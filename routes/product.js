const express=  require("express");
const Product = require('../models/Product');
const Review = require('../models/Review');
const {validateProduct, isLoggedIn, isSeller, isProductAuthor} = require('../middleware');
//mini application
const router = express.Router(); //same work as app

//read

router.get("/products", async (req,res)=> {
    try{
        let products = await Product.find({});
        res.render("products/index",{products})
    }

    catch(e) {
        res.render('error', {err : e.message})
    }
});

//new form
// user must be logged in to add an product
router.get("/product/new", isLoggedIn, isSeller, (req,res)=>{
    try{
        res.render('products/new'); 
    }

    catch(e) {
        res.render('error', {err : e.message})
    }
   
}) 

//adding 
//validate product -> first check and then add
router.post('/products', isLoggedIn, isSeller,  validateProduct, async(req,res)=>{
    try{
        let {name, img, price, desc} = req.body; //by default undefined
        await Product.create({name, img, price, desc, author:req.user._id}); //automatically save in db as well
        req.flash('success', 'Product Added Successfully');
        res.redirect('/products');
    }
    catch(e) {
        res.render('error', {err : e.message})
    }
})

//show particular product
router.get('/products/:id', isLoggedIn, async (req,res)=>{
    try{
        let {id} = req.params;
        // let foundProduct = await Product.findById(id);
        let foundProduct = await Product.findById(id).populate('reviews');
        // console.log(foundProduct);
        res.render('products/show',{foundProduct, success:req.flash('msg')});
    }

    catch(e) {
        res.render('error', {err : e.message})
    }
})

//show edit form
router.get('/products/:id/edit', isLoggedIn, isSeller,  async (req,res)=> {
    try{
        let {id} = req.params;
        let foundProduct = await Product.findById(id);
        res.render('products/edit',{foundProduct})
    }

    catch(e) {
        res.render('error', {err : e.message})
    }
})

//actually changing the product
router.patch('/products/:id', isLoggedIn, validateProduct , isSeller, isProductAuthor, async(req,res)=>{
    try{
        let {id} = req.params;
        let {name, img, price, desc} = req.body;
        await Product.findByIdAndUpdate(id, {name, img, price, desc});
        req.flash('success', 'Product Edited Successfully');
        res.redirect('/products')
    }

    catch(e) {
        res.render('error', {err : e.message})
    }
})

router.delete('/products/:id', isLoggedIn, isSeller, isProductAuthor,  async (req,res)=>{
    try{
        let {id} = req.params;
        let foundProduct = await Product.findById(id);
        //deleting reviews before deleting products
        for(let ids of foundProduct.reviews) {
            await Review.findByIdAndDelete(ids);
        }
        await Product.findByIdAndDelete(id);
        req.flash('success', 'Product Deleted Successfully');
        res.redirect('/products');
    }

    catch(e) {
        res.render('error', {err : e.message})
    }
})

module.exports = router;

