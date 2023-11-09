const express = require("express");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage: storage });
const router = express.Router();
const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");

const { campgroundSchema } = require("../schemas.js");
const { isLoggedIn } = require("../middleware");

// Middleware ---------------

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

const isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    if (req.user.username != "Admin") {
      req.flash("error", "You do not have permission to do that!");
      return res.redirect(`/campgrounds/${campground._id}`);
    }
  }
  next();
};

// Routes -------------------

router
  .route("/")
  .get(catchAsync(campgrounds.index))
  .post(
    isLoggedIn,
    upload.array("images"),
    validateCampground,
    catchAsync(campgrounds.addRecord)
  );

router.get("/new", isLoggedIn, campgrounds.newRecord);

router
  .route("/:id")
  .get(catchAsync(campgrounds.showRecord))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("images"),
    validateCampground,
    catchAsync(campgrounds.updateRecord)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteRecord));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.editRecord));

module.exports = router;
