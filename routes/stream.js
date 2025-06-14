const express = require("express");
const {
  stream,
  getFiles,
  startStream,
  stopStream,
} = require("../controller/stream");

const router = express.Router();

router.post("/", stream);
router.get("/get-files", getFiles);
router.get("/start-cctv-stream", startStream);
router.get("/stop-cctv-stream", stopStream);

module.exports = router;
