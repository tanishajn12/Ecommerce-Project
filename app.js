const express = require("express");
const app = express();
const path = require("path");
const mongoose = require('mongoose');
const seedDB = require('./seed');
const productRoutes = require("./routes/product");
const methodOverride=require('method-override');
const reviewRoutes = require("./routes/review");
const session = require("express-session");
const flash = require("connect-flash");

mongoose.connect('mongodb://127.0.0.1:27017/ecomm') //returns a promise
.then(()=>{console.log("DB connected")})
.catch((err)=> {console.log("Error is:",err)})

app.set("view engine",'ejs')
app.set('views', path.join(__dirname,'views'))

app.use(express.static(path.join(__dirname,'public')));

// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// For parsing application/json
app.use(express.json());

app.use(methodOverride('_method'))

let configSession = {
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true } //http -> https
}


app.use(session(configSession)); //session middleware
app.use(flash()); //flash middleware

app.use((req,res,next)=>{
    res.locals.success = req.flash('success');
    res.locals.error =  req.flash('error');
    next();

})

//Routes
app.use(productRoutes);
app.use(reviewRoutes);

// seedDB(); //run only once

const PORT = 8080;
app.listen(PORT,()=>{
    console.log(`Server running at port : ${PORT}`)
})

