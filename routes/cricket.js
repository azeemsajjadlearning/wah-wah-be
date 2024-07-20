const express = require("express");
const router = express.Router();

const { getLiveMatches, getMatch } = require("../controller/cricket");

const authMiddleware = require("../middleware/auth");

router.route("/live-matches").get(authMiddleware, getLiveMatches);
router.route("/match/:match_id").get(authMiddleware, getMatch);

module.exports = router;
