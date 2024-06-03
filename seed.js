const mongoose = require("mongoose");
const Product = require("./models/Product");

const products = [
    {
        name : "Iphone 15 Pro",
        img : "https://images.unsplash.com/photo-1710023038502-ba80a70a9f53?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        price : 125000,
        desc : "Amazing camera & outstanding performance"
    },
    {
        name : "macbook pro",
        img : "https://images.unsplash.com/photo-1651241680016-cc9e407e7dc3?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        price : 230000,
        desc: "hello i am a good machine"
    },
    {
        name : "apple watch",
        img :"https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        price : 50000,
        desc: "compatible device"
    },
    {
        name : "ipad",
        img :"https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=2015&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        price : 80000,
        desc: "Very useful for students to study"
    }

]

async function seedDB() {
    await Product.insertMany(products);
    console.log("DB seeded")

}

module.exports=seedDB;