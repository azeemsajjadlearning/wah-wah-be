const express = require("express");
const multer = require("multer");
const {
  uploadFile,
  getChunks,
  downloadChunk,
  search,
  deleteFile,
  getFiles,
  renameFile,
  createFolder,
  renameFolder,
  deleteFolder,
  moveFile,
  copyFile,
  moveFolder,
  fixDB,
} = require("../controller/storage");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.route("/upload").post(authMiddleware, upload.single("file"), uploadFile);
router.route("/get-chunks/:file_id").get(authMiddleware, getChunks);
router.route("/download-chunk").post(authMiddleware, downloadChunk);
router.route("/search/:query").get(authMiddleware, search);
router.route("/delete/:file_id").delete(authMiddleware, deleteFile);
router.route("/get-files/:folder_id").get(authMiddleware, getFiles);
router.route("/rename-file/:file_id").put(authMiddleware, renameFile);
router.route("/create-folder").post(authMiddleware, createFolder);
router.route("/rename-folder/:folder_id").put(authMiddleware, renameFolder);
router.route("/delete-folder/:folder_id").delete(authMiddleware, deleteFolder);
router.route("/move-file").post(authMiddleware, moveFile);
router.route("/copy-file").post(authMiddleware, copyFile);
router.route("/move-folder").post(authMiddleware, moveFolder);
router.route("/fix-db").get(fixDB);

module.exports = router;
