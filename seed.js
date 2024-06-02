const mongoose = require("mongoose");
const Product = require("./models/Product");

const products = [
    {
        name : "Iphone 15 Pro",
        img : "https://unsplash.com/photos/an-iphone-is-sitting-on-top-of-a-box-LunVPm34ly4",
        price : 125000,
        desc : "Amazing camera & outstanding performance"
    },
    {
        name : "macbook pro",
        img : "https://unsplash.com/photos/slightly-opened-silver-macbook-mP7aPSUm7aE",
        price : 230000,
        desc: "hello i am a good machine"
    },
    {
        name : "apple watch",
        img :"https://unsplash.com/photos/space-gray-apple-watch-with-black-sports-band-hbTKIbuMmBI",
        price : 50000,
        desc: "compatible device"
    },
    {
        name : "ipad",
        img :"https://unsplash.com/photos/black-ipad-with-white-stylus-pen-gYVNvRygCUw",
        price : 80000,
        desc: "Very useful for students to study"
    }

]

async function seedDB() {
    await Product.insertMany(products);
    console.log("DB seeded")

}

module.exports=seedDB;