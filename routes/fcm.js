const express = require("express");
const router = express.Router();

const { sendNotification } = require("../controller/fcm");
// const authMiddleware = require("../middleware/auth");

router.get("/", sendNotification);

module.exports = router;
