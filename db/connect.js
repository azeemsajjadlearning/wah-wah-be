const mongoos = require("mongoose");

// const connenctionString =
//     "mongodb+srv://azeem_sajjad:JjgRlxPhvCip24dw@vercel-test-db.y9zpdlm.mongodb.net/?retryWrites=true&w=majority";

const connectDB = (url) => {
  return mongoos.set("strictQuery", false).connect(url);
};

module.exports = connectDB;
