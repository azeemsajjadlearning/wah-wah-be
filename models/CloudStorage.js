const mongoose = require("mongoose");

const AlbumSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  user_id: { type: String, required: true },
  photos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Photo" }],
  uploadDate: { type: Date, default: Date.now },
});

const PhotoSchema = new mongoose.Schema({
  title: { type: String, default: null },
  description: { type: String, default: null },
  image: { type: Object, required: true },
  user_id: { type: String, required: true },
  is_favorite: { type: Boolean, default: false },
  album: { type: mongoose.Schema.Types.ObjectId, ref: "Album", default: null },
  uploadDate: { type: Date, default: Date.now },
});

const Album = mongoose.model("Album", AlbumSchema);
const Photo = mongoose.model("Photo", PhotoSchema);

module.exports = { Album, Photo };
