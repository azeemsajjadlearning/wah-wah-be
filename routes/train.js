const express = require("express");
const router = express.Router();
const {
  getAllStations,
  getAllTrains,
  getTrains,
  getRunningStatus,
} = require("../controller/train");

const authMiddleware = require("../middleware/auth");

router.route("/get-all-stations").get(getAllStations);
router.route("/get-all-trains").get(getAllTrains);
router.route("/get-bw-trains").post(getTrains);
router.route("/get-running-status").post(getRunningStatus);

module.exports = router;
