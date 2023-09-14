const mongoose = require("mongoose");
const Investment = require("./Investment");

const InvestmentDetailSchema = new mongoose.Schema(
  {
    investment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Investment,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    nav: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    resumption: {
      type: String,
      default: null,
    },
    redemption_date: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const InvestmentDetail = mongoose.model(
  "InvestmentDetail",
  InvestmentDetailSchema
);

module.exports = InvestmentDetail;
