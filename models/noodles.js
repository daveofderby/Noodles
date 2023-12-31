const mongoose = require("mongoose");
const Review = require("./review");
// const User = require("./user");

const Schema = mongoose.Schema;

const ImageSchema = new Schema({ url: String, filename: String });

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

ImageSchema.virtual("square").get(function () {
  return this.url.replace("/upload", "/upload/t_Square");
});

const opts = { toJSON: { virtuals: true } };

const NoodlesSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    weight: Number,

    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

    description: String,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);

NoodlesSchema.virtual("properties.popUpMarkup").get(function () {
  return `<a href="/noodles/${this._id}">
  <h4>${this.title}</h4></a>
  <p>${this.location}</p>`;
});

// Midleware

NoodlesSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const result = await Review.deleteMany({ _id: { $in: doc.reviews } });
    // console.log(result);
  }
});

// Eports

module.exports = mongoose.model("Noodles", NoodlesSchema);
