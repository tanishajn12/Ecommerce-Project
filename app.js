const express = require("express");
const app = express();
const path = require("path");
const mongoose = require('mongoose');
const seedDB = require('./seed');

mongoose.connect('mongodb://127.0.0.1:27017/ecomm') //returns a promise
.then(()=>{console.log("DB connected")})
.catch((err)=> {console.log("Error is:",err)})

app.set("view engine",'ejs')
app.set('views', path.join(__dirname,'views'))
app.use(express.static(path.join(__dirname,'public')));

// seedDB(); //run only once



const PORT = 8080;
app.listen(PORT,()=>{
    console.log(`Server running at port : ${PORT}`)
})

