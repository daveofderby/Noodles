const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value) return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const Joi = BaseJoi.extend(extension);

module.exports.noodlesSchema = Joi.object({
  noodles: Joi.object({
    title: Joi.string().required().escapeHTML(),
    weight: Joi.number().required().min(0),
    location: Joi.string().required().escapeHTML(),
    description: Joi.string().empty(""),
  }).required(),
  deleteImages: Joi.array(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    shop: Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(0),
    body: Joi.string().required().escapeHTML(),
  }).required(),
});
