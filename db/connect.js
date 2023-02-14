const mongoos = require("mongoose");

const connectDB = (url) => {
  return mongoos.set("strictQuery", false).connect(url);
};

module.exports = connectDB;
