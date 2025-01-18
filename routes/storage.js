const express = require("express");
const multer = require("multer");
const {
  uploadFile,
  getChunks,
  downloadChunk,
} = require("../controller/storage");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.route("/upload").post(authMiddleware, upload.single("file"), uploadFile);
router.route("/get-chunks/:file_id").get(authMiddleware, getChunks);
router.route("/download-chunk").post(authMiddleware, downloadChunk);

module.exports = router;
