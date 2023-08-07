var axios = require("axios");
const { StatusCodes } = require("http-status-codes");

const getCities = async (req, res) => {
  try {
    const response = await axios.get(
      "https://travel.paytm.com/api/flights/v2/airports/" + req.params.query,
      {
        params: {
          version: 2,
          international: true,
          client: "web",
        },
      }
    );
    res
      .status(StatusCodes.OK)
      .send({ success: true, result: response.data.body.airports });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
};

const searchFlights = async (req, res) => {
  try {
    // const response = await axios.get(
    //   "https://travel.paytm.com/api/flights/v2/search",
    //   {
    //     params: {
    //       origin: req.body.origin,
    //       destination: req.body.destination,
    //       adults: req.body.adults || 1,
    //       children: req.body.children || 0,
    //       infants: req.body.infants || 0,
    //       class: req.body.class || "E",
    //       departureDate: req.body.departureDate,
    //       returnDate: req.body.returnDate || null,
    //       client: "web",
    //     },
    //   }
    // );
    const response = await axios.get(
      "https://groww.in/v1/api/stocks_data/explore/v2/indices/GIDXNIFTY100/market_trends?discovery_filter_types=TOP_GAINERS&size=10"
    );
    res.status(StatusCodes.OK).send({ success: true, result: response.data });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
};

module.exports = { getCities, searchFlights };
