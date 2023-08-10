const express = require("express");
const router = express.Router();
const {
  getAllTrains,
  getTrainDetails,
  getTrainCoach,
  coachComposition,
  getStationSuggestion,
  getTrainsBetweenStation,
  searchTrain,
  getRunningStatus,
  getPNR,
  x,
} = require("../controller/train");

const authMiddleware = require("../middleware/auth");

router.route("/").get(authMiddleware, getAllTrains);
router.route("/get-details").post(authMiddleware, getTrainDetails);
router.route("/get-coach").post(authMiddleware, getTrainCoach);
router.route("/get-coach-composition").post(authMiddleware, coachComposition);
router
  .route("/get-station-suggestion/:query")
  .get(authMiddleware, getStationSuggestion);
router
  .route("/get-trains-between")
  .post(authMiddleware, getTrainsBetweenStation);
router.route("/search-train/:query").get(authMiddleware, searchTrain);
router.route("/get-running-status").post(authMiddleware, getRunningStatus);
router.route("/get-pnr-status/:pnr").get(authMiddleware, getPNR);
router.route("/x").get(authMiddleware, x);

module.exports = router;
