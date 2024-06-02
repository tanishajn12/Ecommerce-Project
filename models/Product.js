const mongoose = require("mongoose");

//schema
const productSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true
    },
    img : {
        type:String,
        trim:true
    },
    price:{
        type:Number,
        min:0,
        required:true
    },
    desc:{
        type:String,
        trim: true
    }
})

//model/collection -> JS Class -> objects/documents
// model -> singular & start with capital letter
let Product = mongoose.model('Product', productSchema);
module.exports = Product;