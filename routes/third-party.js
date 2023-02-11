const express = require("express");
const router = express.Router();
const {
  uploadMFData,
  getMFData,
  getLatestNAV,
  getNavHistory,
  getAllCountry,
  getAllState,
  getAllCity,
  getInShortNews,
} = require("../controller/third-party");
const authMiddleware = require("../middleware/auth");

router.route("/upload-mf").get(authMiddleware, uploadMFData);
router.route("/get-mf").get(authMiddleware, getMFData);
router.route("/get-mf-latest/:scheme_code").get(authMiddleware, getLatestNAV);
router.route("/get-mf-history/:scheme_code").get(authMiddleware, getNavHistory);
router.route("/get-csc").get(getAllCountry);
router.route("/get-csc/:country").get(getAllState);
router.route("/get-csc/:country/:state").get(getAllCity);
router.route("/get-inshorts/:category").get(getInShortNews);

module.exports = router;
