const express = require("express");
const router = express.Router();
const {
  getTrainDetails,
  getTrainCoach,
  coachComposition,
  getPNRStatus,
  searchTrain,
  getRunningStatus,
  x,
} = require("../controller/train");

const authMiddleware = require("../middleware/auth");

router.route("/get-details").post(authMiddleware, getTrainDetails);
router.route("/get-coach").post(authMiddleware, getTrainCoach);
router.route("/get-coach-composition").post(authMiddleware, coachComposition);
router.route("/get-pnr-status/:pnr").get(authMiddleware, getPNRStatus);
router.route("/search/:query").get(authMiddleware, searchTrain);
router.route("/get-running-status").post(authMiddleware, getRunningStatus);
router.route("/x").get(x);

module.exports = router;
