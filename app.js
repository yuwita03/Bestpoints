const ejsMate = require("ejs-mate");
const express = require("express");
const Joi = require("joi");
const Errorhandle = require("./utils/Errorhandle");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const wrapAsync = require("./utils/wrapAsync");
const path = require("path");
const app = express();

// seeds
const Place = require("./models/place");
const Review = require("./models/review");

// Schema
const { placeSchema } = require("./Schema/place");
const { reviewSchema } = require("./Schema/review");
const review = require("./models/review");

// connecting to database
mongoose
  .connect("mongodb://127.0.0.1/bestpoints")
  .then((result) => {
    console.log("connected to mongodb");
  })
  .catch((err) => {
    console.log(err);
  });

app.engine("ejs", ejsMate);
// type file
app.set("view engine", "ejs");
// path to
app.set("views", path.join(__dirname, "views"));

//middle ware
app.use(express.urlencoded({ extended: true }));
// override ?_method="PUT,DELETE"
app.use(methodOverride("_method"));

const validatePlace = (req, res, next) => {
  const { error } = placeSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    return next(new Errorhandle(msg, 404));
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    return next(new Errorhandle(msg, 404));
  } else {
    next();
  }
};

// getting file home
app.get("/", (req, res) => {
  res.render("home");
});

// display database
app.get(
  "/places",
  wrapAsync(async (req, res, next) => {
    const places = await Place.find();
    res.render("places/index", { places });
  })
);

// create data
app.get("/places/create", async (req, res) => {
  res.render("places/create");
});

// data save
app.post(
  "/places",
  validatePlace,
  wrapAsync(async (req, res, next) => {
    const place = new Place(req.body.place);
    await place.save();
    res.redirect("/places");
  })
);

// display spesific data by id
app.get(
  "/places/:id",
  wrapAsync(async (req, res) => {
    const place = await Place.findById(req.params.id).populate("reviews");
    res.render("places/show", { place });
  })
);

// edit data
app.get(
  "/places/:id/ubahdata",
  wrapAsync(async (req, res) => {
    const place = await Place.findById(req.params.id);
    res.render("places/edit", { place });
  })
);

// Update data
app.put(
  "/places/:id",
  validatePlace,
  wrapAsync(async (req, res) => {
    const place = await Place.findByIdAndUpdate(req.params.id, {
      ...req.body.place,
    });
    res.redirect(`/places/${req.params.id}`);
  })
);

// Delete data
app.delete(
  "/places/:id",
  wrapAsync(async (req, res) => {
    await Place.findByIdAndDelete(req.params.id);
    res.redirect(`/places`);
  })
);

app.post(
  "/places/:id/reviews",
  validateReview,
  wrapAsync(async (req, res) => {
    const review = new Review(req.body.review);
    const place = await Place.findById(req.params.id);
    place.reviews.push(review);
    await review.save();
    await place.save();
    res.redirect(`/places/${req.params.id}`);
  })
);

app.delete(
  "/places/:place_id/reviews/:review_id",
  wrapAsync(async (req, res) => {
    const { place_id, review_id } = req.params;
    await Place.findByIdAndUpdate(place_id, {
      $pull: { reviews: review_id },
    });
    await Review.findByIdAndDelete(review_id);
    res.redirect(`/places/${place_id}`);
  })
);

app.all("*", (req, res, next) => {
  next(new Errorhandle("Page Not Found", 404));
});

// middle ware error
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});

//to defy and notify where the program running at
app.listen(3000, () => {
  console.log("Running on http://127.0.0.1:3000");
});
