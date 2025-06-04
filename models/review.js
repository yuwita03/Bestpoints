const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Structure Models
const reviewSchema = new Schema({
  body: String,
  rating: Number,
});

// Structure will be used
module.exports = mongoose.model("Review", reviewSchema);
