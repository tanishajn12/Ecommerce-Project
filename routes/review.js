const express = require("express")
const router = express.Router();
const Product = require("../models/Product");
const Review = require("../models/Review");
const {validateReview, isLoggedIn} = require('../middleware')

router.post('/products/:id/review', isLoggedIn,  async (req,res)=>{
    try{
        let {rating, comment} = req.body;
        let {id} = req.params;

        const product = await Product.findById(id);

        //new review
        const review = new Review({rating, comment});
        
        product.reviews.push(review);
        //save method is from mongo db hence awaut method
        await product.save();
        await review.save(); 


        //adding flash message
        req.flash('success' , 'Review added successfully');
        res.redirect(`/products/${id}`);
    }

    catch(e) {
        res.render('error',{err: e.message})
    }
})

module.exports= router;