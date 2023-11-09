const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res, next) => {
  const campgrounds = await Campground.find({}).populate("author");
  res.render("campgrounds/index", { campgrounds });
};

module.exports.addRecord = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
  campground.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  campground.author = req.user._id;
  await campground.save();
  req.flash("success", "Successfully made a new campground");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.newRecord = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.showRecord = async (req, res, next) => {
  const campground = await Campground.findById(req.params.id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");
  if (!campground.author) {
    campground.author = "blank";
  }

  if (!campground) {
    req.flash("error", "Campground not found");
    res.redirect(`/campgrounds`);
  }
  res.render("campgrounds/show", { campground });
};

module.exports.editRecord = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  // if (!campground.author.equals(req.user_id)) {
  //   req.flash("error", "You do not have permission to do that!");
  //   return res.redirect(`/campgrounds/${campground._id}`);
  // }
  if (!campground) {
    req.flash("error", "Campground not found");
    return res.redirect(`/campgrounds`);
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.updateRecord = async (req, res, next) => {
  const { id } = req.params;
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  campground.geometry = geoData.body.features[0].geometry;
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  campground.images.push(...imgs);
  await campground.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Successfully updated campground");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteRecord = async (req, res, next) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Campground deleted!");
  res.redirect(`/campgrounds`);
};
