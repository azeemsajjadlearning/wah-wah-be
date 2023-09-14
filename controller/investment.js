const Investment = require("../models/Investment");
const InvestmentDetail = require("../models/InvestmentDetail");
var axios = require("axios");
const { StatusCodes } = require("http-status-codes");

const createInvestment = async (req, res) => {
  let savedInvestment, savedDetail;

  try {
    const investment = new Investment({
      user_id: req.user.user_id,
      schema_code: req.body.schema_code,
      type: req.body.type,
    });

    savedInvestment = await investment.save();

    const mfDetail = await axios.get(
      "https://groww.in/v1/api/data/mf/web/v1/scheme/" +
        savedInvestment.schema_code +
        "/graph",
      { params: { benchmark: false, months: 10000 } }
    );

    const investmentDetail = new InvestmentDetail({
      investment_id: savedInvestment._id,
      date: req.body.date,
      nav: findNAV(mfDetail.data.folio.data, new Date(req.body.date)),
      amount: req.body.amount,
    });

    savedDetail = await investmentDetail.save();

    res.status(StatusCodes.CREATED).json({
      success: true,
      result: { investment: savedInvestment, detail: savedDetail },
    });
  } catch (error) {
    if (savedInvestment) {
      await Investment.findByIdAndRemove(savedInvestment._id);
    }
    if (savedDetail) {
      await InvestmentDetail.findByIdAndRemove(savedDetail._id);
    }

    if (error.code === 11000) {
      res
        .status(StatusCodes.CONFLICT)
        .send({ success: false, error: "This Scheme is already added!!" });
    } else {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ success: false, error: error.message });
    }
  }
};

const addInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOne({
      schema_code: req.body.schema_code,
    });

    const mfDetail = await axios.get(
      "https://groww.in/v1/api/data/mf/web/v1/scheme/" +
        req.body.schema_code +
        "/graph",
      { params: { benchmark: false, months: 10000 } }
    );

    const investmentDetail = new InvestmentDetail({
      investment_id: investment._id.toString(),
      date: req.body.date,
      nav: findNAV(mfDetail.data.folio.data, new Date(req.body.date)),
      amount: req.body.amount,
    });

    const savedDetail = await investmentDetail.save();

    res
      .status(StatusCodes.CREATED)
      .json({ success: true, result: savedDetail });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, error: error.message });
  }
};

const deleteAllInvestment = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);
    const deletedDetails = await InvestmentDetail.deleteMany({
      investment_id: investment._id,
    });
    const deletedInvestment = await Investment.deleteOne({
      _id: req.params.id,
    });
    res.status(StatusCodes.GONE).json({
      success: true,
      result: { investment: deletedInvestment, details: deletedDetails },
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, error: error.message });
  }
};

const deleteInvestment = async (req, res) => {
  try {
    const deletedDetails = await InvestmentDetail.deleteOne({
      _id: req.params.id,
    });
    res.status(StatusCodes.GONE).json({
      success: true,
      result: { investment: deletedDetails },
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, error: error.message });
  }
};

const editInvestment = async (req, res) => {
  try {
    const mfDetail = await axios.get(
      "https://groww.in/v1/api/data/mf/web/v1/scheme/" +
        req.body.schema_code +
        "/graph",
      { params: { benchmark: false, months: 10000 } }
    );

    const investmentDetail = {
      date: req.body.date,
      nav: findNAV(mfDetail.data.folio.data, new Date(req.body.date)),
      amount: req.body.amount,
    };

    const detail = await InvestmentDetail.findOneAndUpdate(
      { _id: req.body.id },
      investmentDetail
    );

    res.status(StatusCodes.OK).json({
      success: true,
      result: detail,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, error: error.message });
  }
};

const getInvestment = async (req, res) => {
  try {
    const investments = await Investment.find({
      user_id: req.user.user_id,
    }).exec();

    if (!investments || investments.length === 0) {
      throw new Error("Investment not found");
    }

    const finalResult = await Promise.all(
      investments.map(async (element) => {
        const investmentDetails = await InvestmentDetail.find({
          investment_id: element._id,
        }).exec();

        const mfDetail = await axios.get(
          "https://groww.in/v1/api/data/mf/web/v1/scheme/" +
            element.schema_code +
            "/graph",
          { params: { benchmark: false, months: 10000 } }
        );

        const resultElement = {
          schema_name: mfDetail.data.folio.name,
          current_nav:
            mfDetail.data.folio.data[mfDetail.data.folio.data.length - 1][1],
          one_day_nav:
            mfDetail.data.folio.data[mfDetail.data.folio.data.length - 2][1],
          ...element.toObject(),
          details: investmentDetails,
        };

        return resultElement;
      })
    );

    res.status(StatusCodes.OK).json({ success: true, result: finalResult });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, error: error.message });
  }
};

function findNAV(data, dateObject, maxAttempts = 5) {
  let timestampToFind = dateObject.getTime();

  for (let attempts = 0; attempts <= maxAttempts; attempts++) {
    for (const [timestamp, value] of data) {
      if (timestamp === timestampToFind) {
        return value;
      }
    }

    if (attempts < maxAttempts) {
      dateObject.setDate(dateObject.getDate() + 1);
      timestampToFind = dateObject.getTime();
    }
  }

  return null;
}

module.exports = {
  createInvestment,
  addInvestment,
  getInvestment,
  deleteAllInvestment,
  deleteInvestment,
  editInvestment,
};
