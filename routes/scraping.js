const express = require("express");
const router = express.Router();
const { getPrice, trackPrice } = require("../controller/scraping");
const authMiddleware = require("../middleware/auth");

router.route("/").post(authMiddleware, getPrice);
router.route("/track").post(authMiddleware, trackPrice);

module.exports = router;
