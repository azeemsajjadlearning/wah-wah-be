const express = require("express");
const router = express.Router();
const {
  getAllTrains,
  getTrainDetails,
  getTrainCoach,
  coachComposition,
} = require("../controller/train");

router.route("/").get(getAllTrains);
router.route("/get-details").post(getTrainDetails);
router.route("/get-coach").post(getTrainCoach);
router.route("/get-coach-composition").post(coachComposition);

module.exports = router;
