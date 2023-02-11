const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const { searchQuery, getDetail, getPopular } = require("../controller/imdb");

router.route("/:query").get(authMiddleware, searchQuery);
router.route("/get-details/:media_type/:id").get(authMiddleware, getDetail);
router.route("/").get(authMiddleware, getPopular);

module.exports = router;
