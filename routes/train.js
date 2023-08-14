const express = require("express");
const router = express.Router();
const {
  getPopularTrain,
  getTrainDetails,
  getTrainCoach,
  coachComposition,
  searchTrain,
  getRunningStatus,
  getPNR,
  getTrainBetweenStation,
  getAvailability,
} = require("../controller/train");

const authMiddleware = require("../middleware/auth");

router.route("/").get(getPopularTrain);
router.route("/get-details").post(authMiddleware, getTrainDetails);
router.route("/get-coach").post(authMiddleware, getTrainCoach);
router.route("/get-coach-composition").post(authMiddleware, coachComposition);
router.route("/search-train/:query").get(authMiddleware, searchTrain);
router.route("/get-running-status").post(authMiddleware, getRunningStatus);
router.route("/get-pnr-status/:pnr").get(authMiddleware, getPNR);
router
  .route("/get-train-bw-station")
  .post(authMiddleware, getTrainBetweenStation);
router.route("/get-availability").post(authMiddleware, getAvailability);

module.exports = router;
