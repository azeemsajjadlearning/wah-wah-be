const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
    },
    name: { type: String, default: null },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      maxlength: 10,
      default: null,
    },
    occupation: {
      type: String,
      maxlength: [100, "name can't be more than 100 characters"],
      default: null,
    },
    photoURL: {
      type: String,
      default: null,
    },
    dob: { type: Date, default: null },
    gender: { type: String, default: null },
    country: { type: Object, default: null },
    state: { type: Object, default: null },
    city: { type: Object, default: null },
    about: {
      type: String,
      maxlength: [1000, "name can't be more than 1000 characters"],
      default: null,
    },
    metadata: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
