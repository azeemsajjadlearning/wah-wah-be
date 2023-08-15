const { StatusCodes } = require("http-status-codes");
var axios = require("axios");

const getAllStations = async (req, res) => {
  try {
    const resp = await axios.get(
      "https://www.trainman.in/static/pnrApp/js/stations.json"
    );
    res.status(StatusCodes.OK).send({
      success: resp.data?.message == "ok" ? true : resp.data?.message,
      result: resp.data?.stations,
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
};

const getAllTrains = async (req, res) => {
  try {
    const resp = await axios.get(
      "https://www.trainman.in/static/pnrApp/js/trains.json"
    );
    res.status(StatusCodes.OK).send({
      success: resp.data?.message == "ok" ? true : resp.data?.message,
      result: resp.data?.trains,
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
};

const getTrains = async (req, res) => {
  try {
    const resp1 = await axios.get(
      `https://www.trainman.in/services/trains/${req.body.source}/${req.body.destination}`,
      {
        params: {
          key: "012562ae-60a9-4fcd-84d6-f1354ee1ea48",
          sort: "smart",
          meta: "true",
          class: "ALL",
          date: req.body.date,
          quota: req.body.quota,
        },
      }
    );
    const resp2 = await axios.get(
      "https://www.trainman.in/services/cached-avl",
      {
        params: {
          ocode: req.body.source,
          dcode: req.body.destination,
          date: req.body.date,
          quota: req.body.quota,
          timestamp: new Date().getTime(),
        },
      }
    );
    res.status(StatusCodes.OK).send({
      success: true,
      result: {
        list: resp1.data,
        availability: resp2.data,
      },
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
};

const getRunningStatus = async (req, res) => {
  try {
    const resp = await axios.get(
      "https://www.trainman.in/services/get-ntes-running-status/" +
        req.body.train_no,
      {
        params: {
          key: "012562ae-60a9-4fcd-84d6-f1354ee1ea48",
          int: 1,
          refresh: true,
          date: req.body.date,
          time: new Date().getTime(),
        },
      }
    );
    res.status(StatusCodes.OK).send({
      success: true,
      result: resp.data,
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
};

const getPNRStatus = async (req, res) => {
  try {
    const resp = await axios.get(
      `https://api.railbeeps.com/api/getPNR/api-key/web-cfc8cf88fa0ac3b6fd8f9570608c6911/viewState/1d17cc53b1/pnrno/${req.params.pnr}/push/0`
    );
    res.status(StatusCodes.OK).send({
      success: true,
      result: resp.data,
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
};

module.exports = {
  getAllStations,
  getAllTrains,
  getTrains,
  getRunningStatus,
  getPNRStatus,
};
