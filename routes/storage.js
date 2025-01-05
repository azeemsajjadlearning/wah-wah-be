const express = require("express");
const multer = require("multer");
const {
  getFiles,
  uploadFile,
  getChunks,
  downloadChunk,
  createFolder,
  getFolders,
  deleteFolder,
  deleteFile,
  moveFiles,
  moveFolder,
  search,
} = require("../controller/storage");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.route("/get-files/:folder_id").get(authMiddleware, getFiles);
router
  .route("/upload")
  .post(authMiddleware, upload.single("chunk"), uploadFile);
router.route("/get-chunks/:file_id").get(authMiddleware, getChunks);
router.route("/download-chunks").post(authMiddleware, downloadChunk);
router.route("/create-folder").post(authMiddleware, createFolder);
router.route("/get-folder/:folder_id").get(authMiddleware, getFolders);
router.route("/delete-folder/:folder_id").delete(authMiddleware, deleteFolder);
router.route("/delete-file/:fileId").delete(authMiddleware, deleteFile);
router.route("/files/move").post(authMiddleware, moveFiles);
router.route("/folder/move").post(authMiddleware, moveFolder);
router.route("/search").get(authMiddleware, search);

module.exports = router;
