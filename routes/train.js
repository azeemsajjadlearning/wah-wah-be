const express = require("express");
const router = express.Router();
const {
  getAllStations,
  getAllTrains,
  getTrains,
  getRunningStatus,
} = require("../controller/train");

const authMiddleware = require("../middleware/auth");

router.route("/get-all-stations").get(authMiddleware, getAllStations);
router.route("/get-all-trains").get(authMiddleware, getAllTrains);
router.route("/get-bw-trains").post(authMiddleware, getTrains);
router.route("/get-running-status").post(authMiddleware, getRunningStatus);

module.exports = router;
