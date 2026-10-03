const { default: mongoose } = require("mongoose");

const LocationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: false,
      validate: {
        validator: function (arr) {
          if (!arr || arr.length === 0) return true;
          return arr.length === 2;
        },
        message: "Location.coordinates must be [lng, lat]",
      },
    },
    fullAddress: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },
    postalCode: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

module.exports = {
  LocationSchema,
};
