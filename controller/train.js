const { StatusCodes } = require("http-status-codes");
var axios = require("axios");
const cheerio = require("cheerio");

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

const searchTrain = async (req, res) => {
  try {
    const response = await axios.get(
      "https://travel.paytm.com/api/trains-search/v1/train/" +
        req.params.query +
        "?client=web"
    );
    res.status(StatusCodes.OK).send({ success: true, result: response.data });
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
      "https://travel.paytm.com/api/trains/v1/train/status",
      {
        params: {
          departure_date: req.body.departure_date,
          train_number: req.body.train_number,
          client: "web",
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

const getPNR = async (req, res) => {
  try {
    const response = await axios.get(
      "https://tickets.paytm.com/trains/pnr-enquiry/" + req.params.pnr + "/-"
    );
    const $ = cheerio.load(response.data);

    const rowDiv = $("div.row.bottom-xs");
    rowDiv.find("div").slice(0, 3).remove();
    const divWithClass = rowDiv.html();
    res
      .status(StatusCodes.OK)
      .send({ success: true, result: pnrStyle + divWithClass });
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

const getTrainBetweenStation = async (req, res) => {
  try {
    const response = await axios.post(
      "https://www.irctc.co.in/eticketing/protected/mapps1/altAvlEnq/TC",
      {
        concessionBooking: false,
        srcStn: req.body.source,
        destStn: req.body.destination,
        jrnyClass: "",
        jrnyDate: req.body.date,
        quotaCode: "GN",
        currentBooking: false,
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
    res.status(StatusCodes.OK).send({ success: true, result: response.data });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error.message });
  }
};

const getAvailability = async (req, res) => {
  try {
    const response = await axios.post(
      "https://www.irctc.co.in/eticketing/protected/mapps1/avlFarenquiry/" +
        req.body.train_no +
        "/" +
        req.body.journey_date +
        "/" +
        req.body.source +
        "/" +
        req.body.destination +
        "/" +
        req.body.class +
        "/" +
        req.body.quota +
        "/N",
      {
        moreThanOneDay: true,
        classCode: req.body.class,
      },
      {
        headers: {
          greq: new Date().getTime(),
          "Content-Type": "application/json; charset=UTF-8",
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

const pnrStyle = `<style>.col-xs-6,.col-xs-12,.col-xs-2,.col-xs-7,.col-xs-3,.col-xs-5{box-sizing:border-box;-ms-flex:00auto;flex:00auto;padding-right:5px;padding-right:0.5rem;padding-left:5px;padding-left:0.5rem;}.col-xs-6{-ms-flex-preferred-size:50%;flex-basis:50%;max-width:50%;}.col-xs-12{-ms-flex-preferred-size:100%;flex-basis:100%;max-width:100%;}.dtea{height:80px;-ms-flex-align:center;-ms-grid-row-align:center;align-items:center;padding:24px0;padding-left:34px;}._27Q0{font-size:20px;color:#000;font-weight:600;}._2VhY{font-weight:600;color:#4a4a4a;font-size:20px;margin-left:15px;}._1JXi{padding-left:382px!important;}._16r2{width:100%;font-size:14px;text-transform:none!important;margin:0!important;padding:0!important;height:100%;background-color:#fff!important;color:#00b8f8;text-align:center;border-radius:3px;height:40px;width:180px;cursor:pointer;position:relative;top:35%;border:2pxsolid#ebebeb;}._2Nrf{font-weight:800;}._3KhR{display:block;margin:1%3%;border-top:1pxsolid#deeaee;width:94%;}.row{box-sizing:border-box;display:-ms-flexbox;display:flex;-ms-flex:01auto;flex:01auto;-ms-flex-direction:row;flex-direction:row;-ms-flex-wrap:wrap;flex-wrap:wrap;margin-right:-5px;margin-right:-0.5rem;margin-left:-5px;margin-left:-0.5rem;}.row.reverse{-ms-flex-direction:row-reverse;flex-direction:row-reverse;}._1W5K{padding-left:40px;font-size:18px;color:#4a4a4a;font-weight:600;}._3mnr{margin-top:2%;margin-bottom:4%;}.col-xs-2{-ms-flex-preferred-size:16.66666667%;flex-basis:16.66666667%;max-width:16.66666667%;}._1t1D{font-size:14px;color:#0a0a0a;font-weight:600;}._1w_t{font-weight:400;color:#8c8c8c;font-size:14px;vertical-align:baseline;text-transform:lowercase;}._1w_t:first-letter{text-transform:uppercase;}.col-xs-7{-ms-flex-preferred-size:58.33333333%;flex-basis:58.33333333%;max-width:58.33333333%;}._2bNc{min-height:143px;}.IDpd{height:37px;background-color:#e9e9e9;-ms-flex-align:center;-ms-grid-row-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between;margin-left:0;}.col-xs-3{-ms-flex-preferred-size:25%;flex-basis:25%;max-width:25%;}._1QeI{line-height:1.14;font-weight:400;color:#909090;font-size:14px;padding-left:36px;text-align:left;}._1RDR{padding-left:40px;padding-top:10px;font-size:15px;font-weight:600;color:#565656;line-height:1.33;}._2UNn{text-align:center;border-radius:30px;width:85px;height:20px;}._2kGp{font-size:12px;color:#fff;font-weight:600;line-height:1.33;}._8NG5{border-top:1pxsolid#deeaee;width:616px;margin-left:35px;margin-top:2%;}.col-xs-5{-ms-flex-preferred-size:41.66666667%;flex-basis:41.66666667%;max-width:41.66666667%;}._12BO{font-size:14px;color:#000;}.Z2b2{margin-bottom:10px;}._2zpw{font-weight:600;padding-left:40px;}._1fIo{font-size:14px;font-weight:600;color:#4a4a4a;margin-left:15px;line-height:1.14;}</style>`;

module.exports = {
  getAllTrains,
  getTrainDetails,
  getTrainCoach,
  coachComposition,
  searchTrain,
  getRunningStatus,
  getPNR,
  getTrainBetweenStation,
  getAvailability,
};
