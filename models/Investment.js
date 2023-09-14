const mongoose = require("mongoose");

const InvestmentSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    schema_code: { unique: true, type: String, required: true },
    type: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Investment = mongoose.model("Investment", InvestmentSchema);

module.exports = Investment;
