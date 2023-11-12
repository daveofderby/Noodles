const Noodle = require("../models/noodles");
const Review = require("../models/review");

module.exports.addRecord = async (req, res, next) => {
  const noodle = await Noodle.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  noodle.reviews.push(review);
  await review.save();
  await noodle.save();
  req.flash("success", "Successfully made a new review");
  res.redirect(`/noodles/${noodle._id}`);
};

module.exports.deleteRecord = async (req, res, next) => {
  const { id, reviewId } = req.params;
  await Noodle.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted review");
  res.redirect(`/noodles/${id}`);
};
