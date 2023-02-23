const { StatusCodes } = require("http-status-codes");
const gsmarena = require("gsmarena-api");

const getPopular = async (req, res) => {
  try {
    const resp = await gsmarena.top.get();
    res.send({ success: true, result: resp });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
};

const getBrands = async (req, res) => {
  try {
    const resp = await gsmarena.catalog.getBrands();
    res.send({ success: true, result: resp });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
};

const getBrand = async (req, res) => {
  try {
    const resp = await gsmarena.catalog.getBrand(req.query.brand);
    res.send({ success: true, result: resp });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
};

const getDetail = async (req, res) => {
  try {
    const resp = await gsmarena.catalog.getDevice(req.query.device_id);
    res.send({ success: true, result: resp });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
};

const search = async (req, res) => {
  try {
    const resp = await gsmarena.search.search(req.query.search);
    res.send({ success: true, result: resp });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
};

module.exports = { getPopular, getBrands, getBrand, getDetail, search };
