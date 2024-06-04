const Joi = require('joi');
// joi lets you describe your data using a simple, intuitive, and readable language.
// it is mainly used to validate things on server side

//step 1 : In joi , describe your schema
// step 2

const productSchema = Joi.object({
    name : Joi.string().required().trim(),
    img:Joi.string().trim(),
    price : Joi.number().min(0).required(),
    desc : Joi.string().trim()
});

const reviewSchema = Joi.object({
    rating : Joi.number().min(0).max(5),
    comment : Joi.string().trim()
})

module.exports = {productSchema, reviewSchema}