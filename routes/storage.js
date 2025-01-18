const express = require("express");
const multer = require("multer");
const {
  uploadFile,
  getChunks,
  downloadChunk,
  deleteFile,
  getFiles,
  createFolder,
} = require("../controller/storage");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.route("/upload").post(authMiddleware, upload.single("file"), uploadFile);
router.route("/get-chunks/:file_id").get(authMiddleware, getChunks);
router.route("/download-chunk").post(authMiddleware, downloadChunk);
router.route("/delete/:file_id").delete(authMiddleware, deleteFile);
router.route("/get-files/:folder_id").get(authMiddleware, getFiles);
router.route("/create-folder").post(authMiddleware, createFolder);

module.exports = router;
