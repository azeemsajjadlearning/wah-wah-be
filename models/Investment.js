const mongoose = require("mongoose");

const InvestmentSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    scheme_code: { type: String, required: true },
    type: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

InvestmentSchema.index({ user_id: 1, scheme_code: 1 }, { unique: true });

const Investment = mongoose.model("Investment", InvestmentSchema);

module.exports = Investment;
