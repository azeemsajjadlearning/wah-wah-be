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
  getTrainComposition,
  getClassChart,
  getCoachChart,
  test,
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
router
  .route("/get-train-composition")
  .post(authMiddleware, getTrainComposition);
router.route("/get-class-chart").post(authMiddleware, getClassChart);
router.route("/get-coach-chart").post(authMiddleware, getCoachChart);
router.route("/test").get(test);

module.exports = router;
