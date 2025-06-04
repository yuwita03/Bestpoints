const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

// Structure Models
const placeSchema = new Schema({
  title: String,
  price: String,
  description: String,
  location: String,
  image: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

placeSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({ _id: { $in: doc.reviews } });
  }
});
// Structure will be used
module.exports = mongoose.model("Place", placeSchema);
