const express = require("express");
const router = express.Router();

const { getWeather } = require("../controller/weather");

router.route("/:lat/:long").get(getWeather);

module.exports = router;
