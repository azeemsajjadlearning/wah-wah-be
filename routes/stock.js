const express = require("express");
const router = express.Router();

const {
  getPopularMF,
  searchMF,
  getCollections,
  getMFInfo,
  getMFGraph,
  getMFDetails,
} = require("../controller/stock");

const authMiddleware = require("../middleware/auth");

router.route("/get-popular-mf").get(authMiddleware, getPopularMF);
router.route("/search-mf").post(authMiddleware, searchMF);
router.route("/get-collections/:type").get(authMiddleware, getCollections);
router.route("/get-mf-info/:search_id").get(authMiddleware, getMFInfo);
router.route("/get-mf-graph").post(authMiddleware, getMFGraph);
router.route("/get-mf-details").post(authMiddleware, getMFDetails);

module.exports = router;
