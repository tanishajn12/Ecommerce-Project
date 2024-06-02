const express=  require("express");
const Product = require('../models/Product');
//mini application
const router = express.Router(); //same work as app

//read
router.get("/products", async (req,res)=> {
    let products = await Product.find({});
    res.render("index",{products})
});

//new form
router.get("/product/new",(req,res)=>{
    res.render('new.ejs');
})

module.exports = router;