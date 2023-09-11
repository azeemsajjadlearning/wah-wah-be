const express = require("express");
const router = express.Router();

const { getLiveMatches, getMatch } = require("../controller/cricket");

const authMiddleware = require("../middleware/auth");

router.route("/live-matches").get(getLiveMatches);
router.route("/match/:series_id/:match_id").get(getMatch);

module.exports = router;
