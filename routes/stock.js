const express = require("express");
const router = express.Router();

const {
  uploadMFData,
  getMFData,
  getLatestNAV,
  getNavHistory,
} = require("../controller/stock");

const authMiddleware = require("../middleware/auth");

router.route("/upload-mf").get(authMiddleware, uploadMFData);
router.route("/get-mf").get(authMiddleware, getMFData);
router.route("/get-mf-latest/:scheme_code").get(authMiddleware, getLatestNAV);
router.route("/get-mf-history/:scheme_code").get(authMiddleware, getNavHistory);

module.exports = router;
