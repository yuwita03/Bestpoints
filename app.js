const ejsMate = require("ejs-mate");
const express = require("express");
const ExpressError = require("./utils/ExpressError");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const wrapAsync = require("./utils/wrapAsync");
const path = require("path");
const app = express();

const Place = require("./models/place");

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
    const place = await Place.findById(req.params.id);
    res.render("places/show", { place });
  })
);

// edit data
app.get(
  "/places/:id/edit",
  wrapAsync(async (req, res) => {
    const place = await Place.findById(req.params.id);
    res.render("places/edit", { place });
  })
);

// Update data
app.put(
  "/places/:id",
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

app.all("*", (req, res, next) => {
  try {
    next(new ExpressHandler("Page Not Found", 404));
  } catch (error) {
    console.log(error);
  }
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});

//to defy and notify where the program running at
app.listen(3000, () => {
  console.log("Running on http://127.0.0.1:3000");
});
