const express = require("express");
const multer = require("multer");
const {
  getFiles,
  uploadFile,
  createFolder,
  getFolders,
  deleteFolder,
  deleteFile,
  moveFiles,
  moveFolder,
  search,
  downloadFile,
} = require("../controller/storage");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.route("/get-files/:folder_id").get(authMiddleware, getFiles);
router.route("/upload").post(authMiddleware, upload.array("files"), uploadFile);
router.route("/donwloadFile").post(authMiddleware, downloadFile);
router.route("/create-folder").post(authMiddleware, createFolder);
router.route("/get-folder/:folder_id").get(authMiddleware, getFolders);
router.route("/delete-folder/:folder_id").delete(authMiddleware, deleteFolder);
router.route("/delete-file/:fileId").delete(authMiddleware, deleteFile);
router.route("/files/move").post(authMiddleware, moveFiles);
router.route("/folder/move").post(authMiddleware, moveFolder);
router.route("/search").get(authMiddleware, search);

module.exports = router;
