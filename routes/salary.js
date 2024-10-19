const express = require("express");
const router = express.Router();

const {
  saveSalary,
  getSalaryByFinancialYear,
  deleteSalary,
  saveDeductions,
  getDeductions,
} = require("../controller/salary");
const authMiddleware = require("../middleware/auth");

router.route("/").post(authMiddleware, saveSalary);
router.route("/financial-year").get(authMiddleware, getSalaryByFinancialYear);
router.route("/delete-salary/:id").delete(authMiddleware, deleteSalary);
router.route("/save-deductions").post(authMiddleware, saveDeductions);
router.route("/deductions/:year").get(authMiddleware, getDeductions);

module.exports = router;
