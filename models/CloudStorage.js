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

const FileSchema = new mongoose.Schema({
  file_name: {
    type: String,
    required: true,
    trim: true,
  },
  mime_type: {
    type: String,
    required: true,
    trim: true,
  },
  file_id: {
    type: String,
    required: true,
    unique: true,
  },
  origin_file_id: {
    type: String,
    required: false,
  },
  file_size: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["uploaded", "shared", "shortcut"],
    required: true,
    default: "uploaded",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  folder_id: {
    type: String,
    default: null,
  },
  user_id: { type: String, required: true },
});

const FileChunkSchema = new mongoose.Schema({
  file_id: {
    type: String,
    required: true,
  },
  message_ids: {
    type: [String],
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

const FolderSchema = new mongoose.Schema({
  folder_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  folder_name: {
    type: String,
    required: true,
  },
  parent_folder_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
    default: null,
  },
  user_id: { type: String, required: true },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

const Album = mongoose.model("Album", AlbumSchema);
const Photo = mongoose.model("Photo", PhotoSchema);
const File = mongoose.model("File", FileSchema);
const FileChunk = mongoose.model("FileChunk", FileChunkSchema);
const Folder = mongoose.model("Folder", FolderSchema);

module.exports = { Album, Photo, File, FileChunk, Folder };
