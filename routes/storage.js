const express = require("express");
const multer = require("multer");
const { uploadFile, downloadFile } = require("../controller/storage");
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

const authMiddleware = require("../middleware/auth");

router.route("/upload").post(authMiddleware, upload.single("file"), uploadFile);
router.route("/downloadFile").post(authMiddleware, downloadFile);

module.exports = router;
