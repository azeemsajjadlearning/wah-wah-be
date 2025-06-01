const express = require("express");
const { getFiles, stream } = require("../controller/stream");

const router = express.Router();

router.get("/get-files", getFiles);
router.post("/", stream);

module.exports = router;
