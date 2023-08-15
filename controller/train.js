const { StatusCodes } = require("http-status-codes");
var axios = require("axios");
const cheerio = require("cheerio");

const getTrainDetails = async (req, res) => {
  try {
    const response = await axios.get(
      "https://www.irctc.co.in/eticketing/protected/mapps1/trnscheduleenquiry/" +
        req.body.train_no,
      {
        headers: {
          greq: req.body.date,
        },
      }
    );
    res.status(StatusCodes.OK).send({ success: true, result: response.data });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
};

const getTrainCoach = async (req, res) => {
  try {
    const response = await axios.post(
      "https://www.irctc.co.in/online-charts/api/trainComposition",
      {
        trainNo: req.body.train_no,
        jDate: req.body.date,
        boardingStation: req.body.boarding_station,
      }
    );
    res.status(StatusCodes.OK).send({ success: true, result: response.data });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error.message });
  }
};

const coachComposition = async (req, res) => {
  try {
    const response = await axios.post(
      "https://www.irctc.co.in/online-charts/api/coachComposition",
      {
        trainNo: req.body.train_no,
        boardingStation: req.body.boarding_station,
        remoteStation: req.body.remote_station,
        trainSourceStation: req.body.train_source_station,
        jDate: req.body.date,
        coach: req.body.coach,
        cls: req.body.cls,
      }
    );
    res.status(StatusCodes.OK).send({ success: true, result: response.data });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error.message });
  }
};

const getPNRStatus = async (req, res) => {
  try {
    const response = await axios.get(
      "https://m.redbus.in/railways/api/getPnrData",
      {
        params: {
          pnrno: req.params.pnr,
        },
      }
    );
    res.status(StatusCodes.OK).send({ success: true, result: response.data });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error.message });
  }
};

const searchTrain = async (req, res) => {
  try {
    const response = await axios.get(
      "https://m.redbus.in/railways/api/SolrTrainSearch",
      {
        params: {
          search: req.params.query,
        },
      }
    );
    res
      .status(StatusCodes.OK)
      .send({ success: true, result: response.data?.response?.docs });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error.message });
  }
};

const getRunningStatus = async (req, res) => {
  try {
    const response = await axios.get(
      `https://m.redbus.in/railways/api/getLtsDetails?trainNo=${req.body.trainNo}&doj=${req.body.doj}`
    );
    res.status(StatusCodes.OK).send({ success: true, result: response.data });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error.message });
  }
};

const x = async (req, res) => {
  try {
    const response = await axios.get(
      "https://www.redbus.in/railways/api/searchCall",
      {
        src: "NDLS",
        dst: "LKO",
        doj: "20230831",
      }
    );
    res.status(StatusCodes.OK).send({ success: true, result: response.data });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error.message });
  }
};

module.exports = {
  getTrainDetails,
  getTrainCoach,
  coachComposition,
  getPNRStatus,
  searchTrain,
  getRunningStatus,
  x,
};
