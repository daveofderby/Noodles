const Noodles = require("../models/noodles");
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res, next) => {
  const noodles = await Noodles.find({}).populate("author");
  res.render("noodles/index", { noodles });
};

module.exports.addRecord = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.noodles.location,
      limit: 1,
    })
    .send();
  const noodles = new Noodles(req.body.noodles);
  noodles.geometry = geoData.body.features[0].geometry;
  noodles.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  noodles.author = req.user._id;
  await noodles.save();
  req.flash("success", "Successfully made a new noodles");
  res.redirect(`/noodles/${noodles._id}`);
};

module.exports.newRecord = (req, res) => {
  res.render("noodles/new");
};

module.exports.showRecord = async (req, res, next) => {
  const noodles = await Noodles.findById(req.params.id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");
  if (!noodles.author) {
    noodles.author = "blank";
  }

  if (!noodles) {
    req.flash("error", "Noodles not found");
    res.redirect(`/noodles`);
  }
  res.render("noodles/show", { noodles });
};

module.exports.editRecord = async (req, res, next) => {
  const { id } = req.params;
  const noodles = await Noodles.findById(id);
  // if (!noodles.author.equals(req.user_id)) {
  //   req.flash("error", "You do not have permission to do that!");
  //   return res.redirect(`/noodles/${noodles._id}`);
  // }
  if (!noodles) {
    req.flash("error", "Noodles not found");
    return res.redirect(`/noodles`);
  }
  res.render("noodles/edit", { noodles });
};

module.exports.updateRecord = async (req, res, next) => {
  const { id } = req.params;
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.noodles.location,
      limit: 1,
    })
    .send();
  const noodles = await Noodles.findByIdAndUpdate(id, {
    ...req.body.noodles,
  });
  noodles.geometry = geoData.body.features[0].geometry;
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  noodles.images.push(...imgs);
  await noodles.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await noodles.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Successfully updated noodles");
  res.redirect(`/noodles/${noodles._id}`);
};

module.exports.deleteRecord = async (req, res, next) => {
  const { id } = req.params;
  await Noodles.findByIdAndDelete(id);
  req.flash("success", "Noodles deleted!");
  res.redirect(`/noodles`);
};
