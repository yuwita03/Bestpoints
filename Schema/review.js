const Joi = require("joi");

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    body: Joi.string().min(3).required(),
    rating: Joi.number().min(1).max(5).required(),
  }).required(), //means the data must, so req.body can validate
});
