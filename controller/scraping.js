const { StatusCodes } = require("http-status-codes");
const axios = require("axios");
const cron = require("node-cron");
const cheerio = require("cheerio");
const Product = require("../models/Product");

const getPrice = async (req, res) => {
  try {
    const response = await axios.get(req.body.url);
    const $ = cheerio.load(response.data);

    const title = $("#productTitle").text().trim();
    const price = $("#tp_price_block_total_price_ww .a-offscreen")
      .text()
      .trim();

    res
      .status(StatusCodes.OK)
      .send({ success: true, result: { title, price } });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
};

const trackPrice = async (req, res) => {
  try {
    const product = await Product.create({
      userId: req.user.user_id,
      price: req.body.price,
      product: req.body.product,
      url: req.body.url,
      isTracking: true,
    });
    res.status(StatusCodes.OK).send({ success: true, result: product });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
};

cron.schedule("29 9 * * *", async () => {
  try {
    const trackers = await Product.find({ isTracking: true });
    trackers.forEach((ele) => {
      const product = Product.create({
        userId: ele.userId,
        price: ele.price,
        product: ele.product,
        url: ele.url,
        isTracking: true,
      })
        .then((resp) => {
          console.log(resp);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  } catch (error) {
    console.error("Error updating prices:", error);
  }
});

module.exports = { getPrice, trackPrice };
