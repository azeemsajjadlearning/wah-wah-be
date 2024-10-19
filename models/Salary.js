const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    month: {
      type: String,
      required: false,
    },
    date: {
      type: Date,
      required: true,
    },
    basic: {
      type: Number,
      required: true,
    },
    hra: {
      type: Number,
      required: true,
    },
    lta: {
      type: Number,
      required: true,
    },
    sa: {
      type: Number,
      required: true,
    },
    pt: {
      type: Number,
      required: true,
    },
    tds: {
      type: Number,
      required: true,
    },
    epf: {
      type: Number,
      required: true,
    },
    bonus: {
      type: Number,
      required: true,
    },
    rentPaid: {
      type: Number,
      required: true,
    },
    interestPaid: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const deductionSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    elss: {
      type: Number,
      required: true,
    },
    nps: {
      type: Number,
      default: null, // or required: false depending on your use case
    },
    mi: {
      type: Number,
      default: null, // or required: false depending on your use case
    },
    lta: {
      type: Number,
      default: null, // or required: false depending on your use case
    },
    year: {
      type: String,
      required: true,
    },
    metro: {
      type: Boolean,
      default: false,
    },
    regime: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Salary = mongoose.model("Salary", salarySchema);
const Deduction = mongoose.model("Deduction", deductionSchema);

// Export both models
module.exports = { Salary, Deduction };
