const express = require("express");
const router = express.Router();

const { search } = require("../controller/gsm-arena");

router.get("/", search);

module.exports = router;
