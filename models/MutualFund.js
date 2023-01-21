const mongoose = require("mongoose");

const MutualFundSchema = new mongoose.Schema();

module.exports = mongoose.model("MutualFund", MutualFundSchema);
