const express = require("express");
const {
  stream,
  getFiles,
  startStream,
  stopStream,
  viewRecordings,
} = require("../controller/stream");

const router = express.Router();

router.post("/", stream);
router.get("/get-files", getFiles);
router.get("/start-cctv-stream", startStream);
router.get("/stop-cctv-stream", stopStream);
router.get("/view-recording", viewRecordings);

module.exports = router;
