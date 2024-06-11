const express = require('express');
const { isLoggedIn } = require('../../middleware');
const User = require('../../models/User');
const router = express.Router();

router.post('/products/:id/like', isLoggedIn, async (req,res)=>{
    // console.log(req.params.id);
    // res.send(req.params.id);
    let {id} = req.params; //product id
    let user = req.user; //user id
    let isLiked = user.wishlist.includes(id);

    //pull & addToSet are mongodb operations
    if(isLiked) {
        await User.findByIdAndUpdate(req.user._id, {$pull: {wishlist : id}})
    }else{
        await User.findByIdAndUpdate(req.user._id, {$addToSet: {wishlist : id}})

    }
    // console.log(isLiked);
})
module.exports = router;