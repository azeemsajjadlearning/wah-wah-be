const { StatusCodes } = require("http-status-codes");
const { Salary, Deduction } = require("../models/Salary");

const saveSalary = async (req, res) => {
  try {
    const salaryBreakups = req.body.data.salaryBreakups;
    const user_id = req.user.user_id;

    if (!user_id || !Array.isArray(salaryBreakups)) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        success: false,
        message: "user_id and salaryBreakups are required.",
      });
    }

    for (const breakup of salaryBreakups) {
      const validationError = validateSalaryBreakup(breakup);
      if (validationError) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          success: false,
          message: validationError,
        });
      }
    }

    const savedBreakups = await Promise.all(
      salaryBreakups.map(async (breakup) => {
        const {
          month,
          date,
          basic,
          hra,
          lta,
          sa,
          pt,
          tds,
          epf,
          bonus,
          rentPaid,
          interestPaid,
        } = breakup;

        const existingSalary = await Salary.findOne({
          user_id,
          month,
        });

        if (existingSalary) {
          existingSalary.month = month || existingSalary.month;
          existingSalary.date = date || existingSalary.date;
          existingSalary.basic = basic == 0 ? 0 : basic || existingSalary.basic;
          existingSalary.hra = hra == 0 ? 0 : hra || existingSalary.hra;
          existingSalary.lta = lta == 0 ? 0 : lta || existingSalary.lta;
          existingSalary.sa = sa == 0 ? 0 : sa || existingSalary.sa;
          existingSalary.pt = pt == 0 ? 0 : pt || existingSalary.pt;
          existingSalary.tds = tds == 0 ? 0 : tds || existingSalary.tds;
          existingSalary.epf = epf == 0 ? 0 : epf || existingSalary.epf;
          existingSalary.bonus = bonus == 0 ? 0 : bonus || existingSalary.bonus;
          existingSalary.rentPaid =
            rentPaid == 0 ? 0 : rentPaid || existingSalary.rentPaid;
          existingSalary.interestPaid =
            interestPaid == 0 ? 0 : interestPaid || existingSalary.interestPaid;

          const updatedSalary = await existingSalary.save();
          return updatedSalary;
        } else {
          const newSalaryData = {
            user_id,
            month: month,
            date: date,
            basic: basic || 0,
            hra: hra || 0,
            lta: lta || 0,
            sa: sa || 0,
            pt: pt || 0,
            tds: tds || 0,
            epf: epf || 0,
            bonus: bonus || 0,
            rentPaid: rentPaid || 0,
            interestPaid: interestPaid || 0,
          };

          const newSalary = new Salary(newSalaryData);
          const savedSalary = await newSalary.save();
          return savedSalary;
        }
      })
    );

    res
      .status(StatusCodes.CREATED)
      .send({ success: true, data: savedBreakups });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error.message });
  }
};

const getSalaryByFinancialYear = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { financialYear } = req.query;

    if (!user_id || !financialYear) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        success: false,
        message: "user_id and financialYear are required.",
      });
    }

    const months = getMonthsForFinancialYear(financialYear);

    let salaryData = await Salary.find({
      user_id,
      month: { $in: months },
    }).sort({ date: 1 });

    if (salaryData.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).send({
        success: false,
        message: "No salary data found for the specified financial year.",
      });
    }

    const salaryMap = new Map(salaryData.map((s) => [s.month, s]));

    const orderedSalaryData = months
      .map((month) => salaryMap.get(month))
      .filter((salary) => salary);

    res.status(StatusCodes.OK).send({
      success: true,
      data: orderedSalaryData,
    });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error.message });
  }
};

const deleteSalary = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { id } = req.params;

    if (!user_id || !id) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        success: false,
        message: "user_id and id are required.",
      });
    }

    const deletedSalary = await Salary.findOneAndDelete({ _id: id, user_id });

    if (!deletedSalary) {
      return res.status(StatusCodes.NOT_FOUND).send({
        success: false,
        message: "Salary record not found for the specified ID.",
      });
    }

    res.status(StatusCodes.OK).send({
      success: true,
      message: "Salary record deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error.message });
  }
};

const saveDeductions = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { elss, nps, mi, lta, year, metro, regime } = req.body.data;

    const updatedDeduction = await Deduction.findOneAndUpdate(
      { user_id: user_id, year: year },
      {
        $set: {
          elss: elss,
          nps: nps,
          mi: mi,
          lta: lta,
          metro: metro,
          regime: regime,
        },
      },
      { new: true, upsert: true }
    );

    res.status(StatusCodes.OK).send({
      success: true,
      data: updatedDeduction,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      err: error.message,
    });
  }
};

const getDeductions = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const year = req.params.year;

    const deductions = await Deduction.find({ user_id, year });

    if (!deductions || deductions.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).send({
        success: false,
        message: "No deductions found for this user in the specified year.",
      });
    }

    res.status(StatusCodes.OK).send({
      success: true,
      data: deductions,
    });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      err: error.message,
    });
  }
};

const validateSalaryBreakup = (breakup) => {
  const {
    date,
    basic,
    hra,
    lta,
    sa,
    pt,
    tds,
    epf,
    bonus,
    rentPaid,
    interestPaid,
  } = breakup;

  if (date && isNaN(new Date(date).getTime())) {
    return "Invalid date format.";
  }

  if (basic !== undefined && typeof basic !== "number") {
    return "Basic salary must be a number.";
  }

  const optionalFields = {
    hra,
    lta,
    sa,
    pt,
    tds,
    epf,
    bonus,
    rentPaid,
    interestPaid,
  };
  for (const [key, value] of Object.entries(optionalFields)) {
    if (value !== null && value !== undefined && typeof value !== "number") {
      return `${key} must be a number or null.`;
    }
  }

  return null;
};

const getMonthsForFinancialYear = (financialYear) => {
  const [startYearStr, endYearStr] = financialYear.split("-");
  const startYear = parseInt(startYearStr, 10);
  const endYear = parseInt(endYearStr, 10);

  const months = [
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
    "January",
    "February",
    "March",
  ];

  const monthStrings = months.map((month, index) => {
    const year = index < 9 ? startYear : endYear;
    return `${month}-${year}`;
  });

  return monthStrings;
};

module.exports = {
  saveSalary,
  getSalaryByFinancialYear,
  deleteSalary,
  saveDeductions,
  getDeductions,
};
