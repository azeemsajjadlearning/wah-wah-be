var axios = require("axios");
const { StatusCodes } = require("http-status-codes");

const getPopularMF = async (req, res) => {
  try {
    const resp = await axios.get(
      "https://groww.in/v1/api/data/mf/web/v1/collection",
      {
        params: {
          actTime: new Date().getTime(),
          cid: "popular_direct_mf",
          doc_required: false,
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

const searchMF = async (req, res) => {
  try {
    const resp = await axios.get("https://groww.in/v1/api/search/v1/entity", {
      params: {
        app: false,
        page: req.body.page || 0,
        q: req.body.query,
        size: 20,
      },
    });
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

const getCollections = async (req, res) => {
  try {
    const resp = await axios.get(
      "https://groww.in/v1/api/data/mf/web/v1/collections/" + req.params.type
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

const getMFInfo = async (req, res) => {
  try {
    const resp = await axios.get(
      "https://groww.in/v1/api/data/mf/web/v2/scheme/search/" +
        req.params.search_id,
      { params: { include_swp_frequency: false } }
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

const getMFGraph = async (req, res) => {
  try {
    const resp = await axios.get(
      "https://groww.in/v1/api/data/mf/web/v1/scheme/" +
        req.body.scheme_code +
        "/graph",
      { params: { benchmark: false, months: req.body.months || 36 } }
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

const getMFDetails = async (req, res) => {
  try {
    const resp = await axios.post(
      "https://groww.in/v1/api/bse/v1/scheme/details",
      {
        isin: req.body.isin,
        schemeType: req.body.scheme_type,
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

const getLatestAggregate = async (req, res) => {
  try {
    const resp = await axios.post(
      "https://groww.in/v1/api/stocks_data/v1/tr_live_delayed/segment/CASH/latest_aggregated",
      {
        exchangeAggReqMap: {
          NSE: {
            priceSymbolList: [],
            indexSymbolList: ["NIFTY", "BANKNIFTY"],
          },
          BSE: {
            priceSymbolList: [],
            indexSymbolList: ["1"],
          },
        },
      }
    );

    let result = [];
    result.push(resp.data.exchangeAggRespMap.BSE.indexLivePointsMap["1"]);
    result.push(resp.data.exchangeAggRespMap.NSE.indexLivePointsMap.BANKNIFTY);
    result.push(resp.data.exchangeAggRespMap.NSE.indexLivePointsMap.NIFTY);
    res.status(StatusCodes.OK).send({
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
};

const getAllIndices = async (req, res) => {
  try {
    const resp = await axios.get(
      "https://groww.in/v1/api/stocks_data/v1/company/search_id/nifty",
      {
        params: {
          fields: "ALL_ASSETS",
          page: 0,
          size: 10,
        },
      }
    );
    res.status(StatusCodes.OK).send({
      success: true,
      result: resp.data?.allAssets || resp.data,
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
};

module.exports = {
  getPopularMF,
  searchMF,
  getCollections,
  getMFInfo,
  getMFGraph,
  getMFDetails,
  getLatestAggregate,
  getAllIndices,
};
