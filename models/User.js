const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    //username -> Passport local mongoose handle it
    //password -> password local mongoose handle it

    email:{
        type: String,
        trim : true,
        required: true
    },

    gender: {
        type: String,
        trim: true,
        required: true
    }
})

userSchema.plugin(passportLocalMongoose); //always applu on schema

let User = mongoose.model('User', userSchema);
module.exports = User;