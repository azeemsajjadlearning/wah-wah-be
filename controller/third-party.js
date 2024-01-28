const { StatusCodes } = require("http-status-codes");
const request = require("request");
var axios = require("axios");

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

const getYouTubeThumbnail = (req, res) => {
  try {
    axios
      .get("https://www.googleapis.com/youtube/v3/videos", {
        params: {
          id: req.params.key,
          key: process.env.GCS_KEY,
          part: "snippet",
        },
      })
      .then((resp) => {
        res.status(StatusCodes.OK).send({ success: true, result: resp.data });
      })
      .catch((err) => {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .send({ success: false, err: err });
      });
  } catch (error) {
    console.log(error);
    res.send({ success: false, err: error });
  }
};

const getMyInvestment = (req, res) => {
  try {
    axios
      .get(
        "https://script.google.com/macros/s/AKfycbxkCe1LHeSTeY0TXhWQL82sJ5YNBDwN5Ooo-l5Fwm9wA4b6CCe0rQhXsHWQh9qiQW16hQ/exec"
      )
      .then((resp) => {
        res
          .status(StatusCodes.OK)
          .send({ success: true, result: resp.data.data });
      })
      .catch((err) => {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .send({ success: false, err: err });
      });
  } catch (error) {
    console.log(error);
    res.send({ success: false, err: error });
  }
};

module.exports = {
  getAllCountry,
  getAllState,
  getAllCity,
  getInShortNews,
  getYouTubeThumbnail,
  getMyInvestment,
};
