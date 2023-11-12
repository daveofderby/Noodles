const express = require("express");
const multer = require("multer");
const { storage } = require("../cloudinary/index.js");
const upload = multer({ storage: storage });
const router = express.Router();
const noodles = require("../controllers/noodles.js");
const catchAsync = require("../utils/catchAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Noodles = require("../models/noodles.js");

const { noodlesSchema } = require("../schemas.js");
const { isLoggedIn } = require("../middleware.js");

// Middleware ---------------

const validateNoodles = (req, res, next) => {
  const { error } = noodlesSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

const isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const noodles = await Noodles.findById(id);
  if (!noodles.author.equals(req.user._id)) {
    if (req.user.username != "Admin") {
      req.flash("error", "You do not have permission to do that!");
      return res.redirect(`/noodles/${noodles._id}`);
    }
  }
  next();
};

// Routes -------------------

router
  .route("/")
  .get(catchAsync(noodles.index))
  .post(
    isLoggedIn,
    upload.array("images"),
    validateNoodles,
    catchAsync(noodles.addRecord)
  );

router.get("/new", isLoggedIn, noodles.newRecord);

router
  .route("/:id")
  .get(catchAsync(noodles.showRecord))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("images"),
    validateNoodles,
    catchAsync(noodles.updateRecord)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(noodles.deleteRecord));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(noodles.editRecord));

module.exports = router;
