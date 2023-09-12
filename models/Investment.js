const mongoose = require("mongoose");

const InvestmentSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    schema_id: {
      type: String,
      required: true,
    },
    schema_name: {
      type: String,
      required: true,
    },
    nav: { type: Number, required: true },
    current_nav: { type: Number, default: null },
    type: { type: String, required: true },
    date: {
      type: Date,
      required: true,
    },
    amount: { type: Number, required: true },
    current_value: { type: Number, default: null },
    active: { type: Boolean, default: true },
    is_parent: { type: Boolean, default: true },
    redemption_date: { type: Date, default: null },
    redemption_amount: { type: Date, default: null },
    createdAt: { type: Date, default: new Date() },
  },
  { timestamps: true }
);

const Investment = mongoose.model("Investment", InvestmentSchema);

module.exports = Investment;
