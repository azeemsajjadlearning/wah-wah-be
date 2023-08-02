const { StatusCodes } = require("http-status-codes");
var axios = require("axios");

const getAllTrains = async (req, res) => {
  try {
    const response = await axios.get(
      "https://www.irctc.co.in/eticketing/trainList"
    );
    res
      .status(StatusCodes.OK)
      .send({ success: true, result: convertToJSON(response.data) });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
};

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

function convertToJSON(inputString) {
  const cleanedString = inputString.replace(/\\"/g, '"').replace(/\\\\/g, "\\");

  const splitString = cleanedString.split('","');

  const jsonData = splitString.map((item) => {
    const [number, name] = item.split(" - ");
    return { number: number.trim(), name: name.trim() };
  });

  return jsonData;
}

module.exports = {
  getAllTrains,
  getTrainDetails,
  getTrainCoach,
  coachComposition,
};
