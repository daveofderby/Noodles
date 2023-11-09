const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");
const Review = require("../models/review");

const DB_URL = "mongodb+srv://daveofderby:4tAe9svV1mRKWsCP@cluster0.hm2obzv.mongodb.net/";

// const DB_URL = "mongodb://localhost:27017/yelp-camp";
// const AUTHOR = "652fc1f506016e459d6e6c9a"

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  await Review.deleteMany({});
  for (let i = 0; i < 2; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "652fc1f506016e459d6e6c9a",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description: `Lorem, ipsum dolor sit amet consectetur adipisicing elit. Cumque necessitatibus quisquam, blanditiis ex totam deleniti nisi sint possimus veniam sit? Minima omnis corporis dignissimos doloribus pariatur culpa dolores ut libero?`,
      price,
      geometry: {
        type: "Point",
        coordinates: [cities[random1000].longitude, cities[random1000].latitude],
      },
      images: [
        {
          url: "https://res.cloudinary.com/dudnzaiuc/image/upload/v1698172647/YelpCamp/wgdllmghhpbwopwqyqgu.jpg",
          filename: "YelpCamp/jh2mzcxnos4u62fd0skf.jpg",
        },
        {
          url: "https://res.cloudinary.com/dudnzaiuc/image/upload/v1698242412/YelpCamp/kjqgny3lvfdtgpa1wppk.jpg",
          filename: "YelpCamp/wgdllmghhpbwopwqyqgu.jpg",
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
