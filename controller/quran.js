var axios = require("axios");
const { StatusCodes } = require("http-status-codes");

const baseUrl = "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@";

const getLanguages = (req, res) => {
  try {
    axios
      .get(baseUrl + "1/editions.min.json")
      .then((resp) => {
        res
          .status(StatusCodes.OK)
          .send({ success: true, result: jsonToArray(resp.data) });
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

const getInfo = (req, res) => {
  try {
    axios
      .get(baseUrl + "1/info.json")
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

const getChapter = (req, res) => {
  try {
    axios
      .all([
        axios.get(
          baseUrl +
            "1/editions/ara-qurandoorinonun/" +
            req.params.chapter_id +
            ".min.json"
        ),
        axios.get(
          baseUrl +
            "1/editions/ara-quran-la1/" +
            req.params.chapter_id +
            ".min.json"
        ),
        axios.get(
          baseUrl +
            "1/editions/" +
            (req.query.language || "hin-suhelfarooqkhan") +
            "/" +
            req.params.chapter_id +
            ".min.json"
        ),
      ])
      .then((responses) => {
        const [arabic, transcription, translation] = responses;

        res.status(StatusCodes.OK).send({
          success: true,
          result: {
            arabic: arabic.data,
            transcription: transcription.data,
            translation: translation.data,
          },
        });
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

function jsonToArray(json) {
  let result = [];

  for (let key in json) {
    if (json.hasOwnProperty(key)) {
      result.push(json[key]);
    }
  }

  return result;
}

module.exports = { getLanguages, getInfo, getChapter };
