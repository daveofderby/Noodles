const express = require("express");
const router = express.Router({ mergeParams: true });
const reviews = require("../controllers/reviews");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const Review = require("../models/review");
const { reviewSchema } = require("../schemas.js");
const { isLoggedIn } = require("../middleware");

// Middleware ---------------

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

const isAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);

  if (!review.author.equals(req.user._id)) {
    if (req.user.username != "Admin") {
      req.flash("error", "You do not have permission to do that!");
      return res.redirect(`/campgrounds/${id}`);
    }
  }
  next();
};

// Routes ---------------

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.addRecord));

router.delete("/:reviewId", isLoggedIn, isAuthor, catchAsync(reviews.deleteRecord));

module.exports = router;
