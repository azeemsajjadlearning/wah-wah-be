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
      result: convertToTrainObjects(resp.data?.trains),
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
    const resp = await axios.post(
      "https://www.irctc.co.in/eticketing/protected/mapps1/altAvlEnq/TC",
      {
        concessionBooking: false,
        srcStn: req.body.source,
        destStn: req.body.destination,
        jrnyClass: "",
        jrnyDate: req.body.doj,
        quotaCode: req.body.quota,
        currentBooking: "false",
        flexiFlag: false,
        handicapFlag: false,
        ticketType: "E",
        loyaltyRedemptionBooking: false,
        ftBooking: false,
      },
      {
        headers: {
          greq: new Date().getTime(),
          "Content-Type": "application/json; charset=UTF-8",
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

const getAvailability = async (req, res) => {
  try {
    const resp = await axios.post(
      `https://www.irctc.co.in/eticketing/protected/mapps1/avlFarenquiry/${req.body.train_no}/${req.body.doj}/${req.body.source}/${req.body.destination}/${req.body.cls}/${req.body.quota}/N`,
      {
        paymentFlag: "N",
        concessionBooking: false,
        ftBooking: false,
        loyaltyRedemptionBooking: false,
        ticketType: "E",
        quotaCode: req.body.quota,
        moreThanOneDay: true,
        trainNumber: req.body.train_no,
        fromStnCode: req.body.source,
        toStnCode: req.body.destination,
        isLogedinReq: false,
        journeyDate: req.body.doj,
        classCode: req.body.cls,
      },
      {
        headers: {
          greq: new Date().getTime(),
          "Content-Type": "application/json; charset=UTF-8",
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
    console.log(error.response);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
};

function convertToTrainObjects(inputArray) {
  const outputArray = [];

  for (const item of inputArray) {
    const [trainNumber, trainName] = item.split(" - ");
    outputArray.push({
      train_number: parseInt(trainNumber),
      train_name: trainName,
    });
  }

  return outputArray;
}

module.exports = {
  getAllStations,
  getAllTrains,
  getTrains,
  getAvailability,
  getRunningStatus,
  getPNRStatus,
};
