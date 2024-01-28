const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

const File = require("../models/CloudStorage");

const {
  getImages,
  uploadImages,
  getImage,
  deleteImage,
} = require("../controller/telegram");
const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, getImages);
router.post("/", authMiddleware, upload.any(), uploadImages);
router.get("/:file_id", authMiddleware, getImage);
router.delete("/:file_id", authMiddleware, deleteImage);

module.exports = router;
