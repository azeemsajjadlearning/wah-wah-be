const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    product: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    isTracking: {
      type: Boolean,
      require: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
