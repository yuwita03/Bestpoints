const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Structure Models
const placeSchema = new Schema({
  title: String,
  price: String,
  description: String,
  location: String,
  image: String,
});

// Structure will be used
module.exports = mongoose.model("Place", placeSchema);
