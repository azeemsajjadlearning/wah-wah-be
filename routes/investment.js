const express = require("express");
const router = express.Router();

const {
  getInvestment,
  addInvestment,
  updateCurrentValue,
} = require("../controller/investment");

const authMiddleware = require("../middleware/auth");

router.route("/update-investment").get(updateCurrentValue);
router.route("/:schema_id?").get(authMiddleware, getInvestment);
router.route("/").post(authMiddleware, addInvestment);

module.exports = router;
