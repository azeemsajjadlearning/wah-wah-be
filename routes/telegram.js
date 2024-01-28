const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

const File = require("../models/CloudStorage");

const {
  getImages,
  uploadImages,
  getImage,
  editImage,
  deleteImage,
  setFavorite,
} = require("../controller/telegram");
const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, getImages);
router.post("/", authMiddleware, upload.any(), uploadImages);
router.get("/:file_id", authMiddleware, getImage);
router.put("/:id", authMiddleware, editImage);
router.delete("/:file_id", authMiddleware, deleteImage);
router.get("/alter_favorite/:id", authMiddleware, setFavorite);

module.exports = router;
