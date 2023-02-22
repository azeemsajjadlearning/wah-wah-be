const { StatusCodes } = require("http-status-codes");
const gsmarena = require("gsmarena-api");

const search = async (req, res) => {
  try {
    const resp = await gsmarena.search.search(req.query.search);
    res.send(resp);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
};

module.exports = {
  search,
};
