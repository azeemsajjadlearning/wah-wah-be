var axios = require("axios");
const { StatusCodes } = require("http-status-codes");

const getLiveMatches = async (req, res) => {
  try {
    const resp = await axios.get(
      "https://hs-consumer-api.espncricinfo.com/v1/pages/matches/current",
      {
        params: {
          lang: "en",
          latest: true,
        },
      }
    );
    res.status(StatusCodes.OK).json({
      success: true,
      result: resp.data,
    });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

const getMatch = async (req, res) => {
  try {
    const resp = await axios.get(
      "https://hs-consumer-api.espncricinfo.com/v1/pages/match/home",
      {
        params: {
          lang: "en",
          seriesId: req.params.series_id,
          matchId: req.params.match_id,
        },
      }
    );
    res.status(StatusCodes.OK).json({
      success: true,
      result: resp.data,
    });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

module.exports = { getLiveMatches, getMatch };
