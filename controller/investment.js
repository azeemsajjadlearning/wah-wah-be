const Investment = require("../models/Investment");
const InvestmentDetail = require("../models/InvestmentDetail");
var axios = require("axios");
const { StatusCodes } = require("http-status-codes");

const searchMf = async (req, res) => {
  try {
    const resp = await axios.get("https://api.mfapi.in/mf/search", {
      params: { q: req.params.query },
    });
    res.status(StatusCodes.OK).send({
      success: true,
      result: resp.data,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, error: error.message });
  }
};

const createInvestment = async (req, res) => {
  let savedInvestment, savedDetail;

  try {
    const investment = new Investment({
      user_id: req.user.user_id,
      scheme_code: req.body.scheme_code,
      type: req.body.type,
    });

    savedInvestment = await investment.save();

    const mfDetail = await axios.get(
      "https://api.mfapi.in/mf/" + req.body.scheme_code
    );

    const investmentDetail = new InvestmentDetail({
      investment_id: savedInvestment._id,
      date: req.body.date,
      nav: findNAV(mfDetail.data.data, new Date(req.body.date)),
      amount: req.body.amount,
    });

    savedDetail = await investmentDetail.save();

    res.status(StatusCodes.CREATED).json({
      success: true,
      result: { investment: savedInvestment, detail: savedDetail },
    });
  } catch (error) {
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
      scheme_code: req.body.scheme_code,
      user_id: req.user.user_id,
    });

    const mfDetail = await axios.get(
      "https://api.mfapi.in/mf/" + req.body.scheme_code
    );

    const investmentDetail = new InvestmentDetail({
      investment_id: investment._id.toString(),
      date: req.body.date,
      nav: findNAV(mfDetail.data.data, new Date(req.body.date)),
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
      "https://api.mfapi.in/mf/" + req.body.scheme_code
    );

    const investmentDetail = {
      date: req.body.date,
      nav: findNAV(mfDetail.data.data, new Date(req.body.date)),
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

        investmentDetails.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB - dateA;
        });

        const mfDetail = await axios.get(
          "https://api.mfapi.in/mf/" + element.scheme_code
        );

        const resultElement = {
          schema_name: mfDetail.data.meta.scheme_name,
          current_nav: mfDetail.data.data[0].nav,
          one_day_nav: mfDetail.data.data[1].nav,
          ...element.toObject(),
          last_investment: investmentDetails[0].date,
          details: investmentDetails,
        };

        return resultElement;
      })
    );

    finalResult.sort((a, b) => {
      const dateA = new Date(a.last_investment);
      const dateB = new Date(b.last_investment);
      return dateB - dateA;
    });

    res.status(StatusCodes.OK).json({ success: true, result: finalResult });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, error: error.message });
  }
};

function findNAV(data, dateObject, maxAttempts = 5) {
  for (let i = 0; i < maxAttempts; i++) {
    const formattedDate = formatDate(dateObject);
    const nav = data.find((ele) => ele.date === formattedDate);

    if (nav) {
      return nav.nav;
    }

    dateObject.setDate(dateObject.getDate() + 1);
    dateObject.setDate(dateObject.getDate() + 1);
    timestampToFind = dateObject.getTime();
    dateObject.setDate(dateObject.getDate() + 1);
    timestampToFind = dateObject.getTime();
  }
  return null;
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

module.exports = {
  searchMf,
  createInvestment,
  addInvestment,
  getInvestment,
  deleteAllInvestment,
  deleteInvestment,
  editInvestment,
};
