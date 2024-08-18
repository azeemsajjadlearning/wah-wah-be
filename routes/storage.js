const express = require("express");
const multer = require("multer");
const {
  getFiles,
  getChunks,
  uploadFile,
  downloadFile,
} = require("../controller/storage");
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

const authMiddleware = require("../middleware/auth");

router.route("/").get(authMiddleware, getFiles);
router.route("/:file_id").get(authMiddleware, getChunks);
router.route("/upload").post(authMiddleware, upload.single("file"), uploadFile);
router.route("/downloadFile").post(authMiddleware, downloadFile);

module.exports = router;
