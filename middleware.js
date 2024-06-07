const{productSchema, reviewSchema} = require("./schema")


const validateProduct = (req,res,next)=> {
    let {name, img, price, desc} = req.body;
    const {error}= productSchema.validate({name,img,price,desc})
    if(error){
        const msg = error.details.map((err)=>err.message).join(',')
        return res.render('error',{err:msg})
    }
    next();
}

const validateReview = (req,res,next) =>{
    let {rating, comment} = req.body;
    const {error} = reviewSchema.validate({rating, comment})
    if(error){
        const msg = error.details.map((err)=>err.message).join(',')
        return res.render('error',{err:msg})
    }
    next();
}

//middleware to ensure that only logged in user can perform the app functionality
const isLoggedIn = (req,res,next)=>{
    //this means user is not logged in -> log in first
    if(!req.isAuthenticated()){
        req.flash('error', 'Login In First');
        return res.redirect('/login');
    }
    next();

}

module.exports = {validateProduct, validateReview, isLoggedIn}