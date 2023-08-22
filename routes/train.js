const express = require("express");
const router = express.Router();
const {
  getAllStations,
  getAllTrains,
  getTrains,
  getTrainSchedule,
  getAvailability,
  getRunningStatus,
  getPNRStatus,
} = require("../controller/train");

const authMiddleware = require("../middleware/auth");

router.route("/get-all-stations").get(authMiddleware, getAllStations);
router.route("/get-all-trains").get(authMiddleware, getAllTrains);
router.route("/get-bw-trains").post(authMiddleware, getTrains);
router
  .route("/get-train-schedule/:train_no")
  .get(authMiddleware, getTrainSchedule);
router.route("/get-availability").post(authMiddleware, getAvailability);
router.route("/get-running-status").post(authMiddleware, getRunningStatus);
router.route("/get-pnr-status/:pnr").get(authMiddleware, getPNRStatus);

module.exports = router;
