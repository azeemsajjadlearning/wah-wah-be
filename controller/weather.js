const axios = require("axios");
const { StatusCodes } = require("http-status-codes");

const baseURL = "http://api.weatherapi.com/v1/";

const getWeather = (req, res) => {
  try {
    axios
      .get(baseURL + "forecast.json", {
        params: {
          key: process.env.WEATHER_API_KEY,
          q: `${req.params.lat},${req.params.long}`,
          aqi: "yes",
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
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
};
module.exports = {
  getWeather,
};
