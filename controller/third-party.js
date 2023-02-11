const { StatusCodes } = require("http-status-codes");
const request = require("request");
const mongoose = require("mongoose");
const MutualFund = require("../models/MutualFund");

const uploadMFData = (req, res) => {
  var options = {
    method: "GET",
    url: "https://latest-mutual-fund-nav.p.rapidapi.com/fetchLatestNAV",
    headers: {
      "X-RapidAPI-Host": process.env.RAPIDAPI_MF_HOST,
      "X-RapidAPI-Key": process.env.RAPIDAPI_MF_KEY,
    },
  };
  request(options, async function (error, response) {
    if (error) {
      res.send({ success: false, error });
      throw new Error(error);
    }

    let obj = {};

    Object.keys(JSON.parse(response.body)[0]).forEach((ele) => {
      if (ele !== "Date")
        obj[ele.toString().toLowerCase().replace(/ /g, "_")] = "String";
      else obj[ele.toString().toLowerCase().replace(/ /g, "_")] = "Date";
    });

    const newSample = JSON.parse(response.body).map((obj) => {
      const newObj = {};
      Object.keys(obj).forEach((key) => {
        obj["Date"] = new Date(obj["Date"]);
        newObj[key.toLowerCase().replace(/ /g, "_")] = obj[key];
      });
      return newObj;
    });

    const responseSchema = new mongoose.Schema(obj, { timestamps: true });
    const MutualFund = mongoose.model("MutualFund", responseSchema);

    await MutualFund.deleteMany({});

    try {
      const upload = await MutualFund.insertMany(newSample);
      res
        .status(StatusCodes.CREATED)
        .send({ success: true, result: upload.length + " uploaded" });
    } catch (error) {
      console.log(error);
      res.send({ success: false, err: error });
    }
  });
};

const getMFData = async (req, res) => {
  try {
    const { page, q } = req.query;
    const mf = await MutualFund.find({
      scheme_name: { $regex: new RegExp(q, "i") },
    })
      .sort({ date: -1 })
      .skip(page * 100)
      .limit(100);
    res.status(StatusCodes.OK).send({ success: true, result: mf });
  } catch (error) {
    console.log(error);
    res.send({ success: false, err: error });
  }
};

const getLatestNAV = async (req, res) => {
  try {
    var options = {
      method: "GET",
      url:
        "https://latest-mutual-fund-nav.p.rapidapi.com/fetchLatestNAV?SchemeCode=" +
        req.params.scheme_code,
      headers: {
        "X-RapidAPI-Host": process.env.RAPIDAPI_MF_HOST,
        "X-RapidAPI-Key": process.env.RAPIDAPI_MF_KEY,
      },
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      res
        .status(StatusCodes.OK)
        .send({ success: true, result: JSON.parse(response.body)[0] });
    });
  } catch (error) {
    console.log(error);
    res.send({ success: false, err: error });
  }
};

const getNavHistory = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let dates = getDates(new Date(start_date), new Date(end_date));
    var options = {
      method: "GET",
      url:
        "https://latest-mutual-fund-nav.p.rapidapi.com/fetchHistoricalNAV?Date=" +
        dates +
        "&SchemeCode=" +
        req.params.scheme_code,
      headers: {
        "X-RapidAPI-Host": process.env.RAPIDAPI_MF_HOST,
        "X-RapidAPI-Key": process.env.RAPIDAPI_MF_KEY,
      },
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      res
        .status(StatusCodes.OK)
        .send({ success: true, result: JSON.parse(response.body) });
    });
  } catch (error) {
    console.log(error);
    res.send({ success: false, err: error });
  }
};

const getAllCountry = (req, res) => {
  try {
    var options = {
      method: "GET",
      url: "https://api.countrystatecity.in/v1/countries",
      headers: {
        accept: "application/json",
        "X-CSCAPI-KEY": process.env.COUNTRYAPIKEY,
      },
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      res
        .status(StatusCodes.OK)
        .send({ success: true, result: JSON.parse(response.body) });
    });
  } catch (error) {
    console.log(error);
    res.send({ success: false, err: error });
  }
};

const getAllState = (req, res) => {
  try {
    var options = {
      method: "GET",
      url:
        "https://api.countrystatecity.in/v1/countries/" +
        req.params.country +
        "/states",
      headers: {
        accept: "application/json",
        "X-CSCAPI-KEY": process.env.COUNTRYAPIKEY,
      },
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      res
        .status(StatusCodes.OK)
        .send({ success: true, result: JSON.parse(response.body) });
    });
  } catch (error) {
    console.log(error);
    res.send({ success: false, err: error });
  }
};

const getAllCity = (req, res) => {
  try {
    var options = {
      method: "GET",
      url:
        "https://api.countrystatecity.in/v1/countries/" +
        req.params.country +
        "/states/" +
        req.params.state +
        "/cities",
      headers: {
        accept: "application/json",
        "X-CSCAPI-KEY": process.env.COUNTRYAPIKEY,
      },
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      res
        .status(StatusCodes.OK)
        .send({ success: true, result: JSON.parse(response.body) });
    });
  } catch (error) {
    console.log(error);
    res.send({ success: false, err: error });
  }
};

const getInShortNews = (req, res) => {
  try {
    var request = require("request");
    var options = {
      method: "GET",
      url: `https://inshorts.deta.dev/news?category=${req.params.category}`,
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      res
        .status(StatusCodes.OK)
        .send({ success: true, result: JSON.parse(response.body) });
    });
  } catch (error) {
    console.log(error);
    res.send({ success: false, err: error });
  }
};

function getDates(startDate, endDate) {
  var dates = [],
    currentDate = startDate,
    addDays = function (days) {
      var date = new Date(this.valueOf());
      date.setDate(date.getDate() + days);
      return date;
    };
  while (currentDate <= endDate) {
    var date = currentDate.getDate().toString().padStart(2, "0");
    var month = currentDate.toLocaleString("default", { month: "short" });
    var year = currentDate.getFullYear();
    var dateString = `${date}-${month}-${year}`;
    dates.push(dateString);
    currentDate = addDays.call(currentDate, 1);
  }
  return dates.join(", ");
}
module.exports = {
  uploadMFData,
  getMFData,
  getLatestNAV,
  getNavHistory,
  getAllCountry,
  getAllState,
  getAllCity,
  getInShortNews,
};
