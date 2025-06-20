const express = require("express");
const {
  stream,
  getFiles,
  startStream,
  stopStream,
  viewRecordings,
} = require("../controller/stream");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.route("/").post(authMiddleware, stream);
router.route("/get-files").get(authMiddleware, getFiles);
router.route("/start-cctv-stream").get(authMiddleware, startStream);
router.route("/stop-cctv-stream").get(authMiddleware, stopStream);
router.route("/view-recording").get(authMiddleware, viewRecordings);

module.exports = router;
