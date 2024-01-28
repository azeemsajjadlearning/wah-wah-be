const express = require("express");
const router = express.Router();

const {
  searchMf,
  getInvestment,
  createInvestment,
  addInvestment,
  deleteAllInvestment,
  deleteInvestment,
  editInvestment,
} = require("../controller/investment");

const authMiddleware = require("../middleware/auth");

router.route("/").get(authMiddleware, getInvestment);
router.route("/search-mf/:query").get(authMiddleware, searchMf);
router.route("/create-investment").post(authMiddleware, createInvestment);
router.route("/add-investment").post(authMiddleware, addInvestment);
router
  .route("/delete-all-investment/:id")
  .delete(authMiddleware, deleteAllInvestment);
router.route("/delete-investment/:id").delete(authMiddleware, deleteInvestment);
router.route("/edit-investment").post(authMiddleware, editInvestment);

module.exports = router;
