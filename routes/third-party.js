const express = require("express");
const router = express.Router();
const {
  getAllCountry,
  getAllState,
  getAllCity,
  getInShortNews,
  getYouTubeThumbnail,
} = require("../controller/third-party");

router.route("/get-csc").get(getAllCountry);
router.route("/get-csc/:country").get(getAllState);
router.route("/get-csc/:country/:state").get(getAllCity);
router.route("/get-inshorts/:category").get(getInShortNews);
router.route("/get-youtube-thumbnail/:key").get(getYouTubeThumbnail);

module.exports = router;
