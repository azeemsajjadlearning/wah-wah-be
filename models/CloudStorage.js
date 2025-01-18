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
  file_size: {
    type: Number,
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
  folder_id: {
    type: String,
    default: null,
  },
  user_id: { type: String, required: true },
});

const ChunkSchema = new mongoose.Schema({
  file_id: {
    type: String,
    required: true,
  },
  chunk_file_id: {
    type: String,
    required: true,
  },
  message_id: {
    type: String,
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
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
const Chunk = mongoose.model("Chunk", ChunkSchema);
const Folder = mongoose.model("Folder", FolderSchema);

module.exports = { Album, Photo, File, Chunk, Folder };
