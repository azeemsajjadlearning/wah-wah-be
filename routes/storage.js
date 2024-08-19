const express = require("express");
const multer = require("multer");
const {
  getFiles,
  getChunks,
  uploadFile,
  downloadFile,
  createFolder,
  getFolders,
  deleteFolder,
} = require("../controller/storage");
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

const authMiddleware = require("../middleware/auth");

router.route("/get-files/:folder_id").get(authMiddleware, getFiles);
router.route("/getChunk/:file_id").get(authMiddleware, getChunks);
router.route("/upload").post(authMiddleware, upload.single("file"), uploadFile);
router.route("/downloadFile").post(authMiddleware, downloadFile);
router.route("/create-folder").post(authMiddleware, createFolder);
router.route("/get-folder/:folder_id").get(authMiddleware, getFolders);
router.route("/delete-folder/:folder_id").delete(authMiddleware, deleteFolder);

module.exports = router;
