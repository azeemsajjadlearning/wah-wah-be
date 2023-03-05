const express = require("express");
const router = express.Router();

const { getInfo, getLanguages, getChapter } = require("../controller/quran");

const authMiddleware = require("../middleware/auth");

router.route("/").get(authMiddleware, getInfo);
router.route("/language").get(authMiddleware, getLanguages);
router.route("/:chapter_id").get(authMiddleware, getChapter);

module.exports = router;
