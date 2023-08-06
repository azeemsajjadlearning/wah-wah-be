const express = require("express");
const router = express.Router();

const { getCities, searchFlights } = require("../controller/flight");

const authMiddleware = require("../middleware/auth");

router.route("/:query").get(authMiddleware, getCities);
router.route("/").post(searchFlights);

module.exports = router;
