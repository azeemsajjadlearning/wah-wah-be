const express = require("express");
const router = express.Router();

const { upload } = require("../controller/storage");

const authMiddleware = require("../middleware/auth");

router.route("/upload").get(upload);
// router.route("/upload").get(authMiddleware,upload );

module.exports = router;
