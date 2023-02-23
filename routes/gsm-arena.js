const express = require("express");
const router = express.Router();

const {
  getPopular,
  getBrands,
  getBrand,
  getDetail,
  search,
} = require("../controller/gsm-arena");

router.get("/get-popular", getPopular);
router.get("/get-brands", getBrands);
router.get("/get-brand", getBrand);
router.get("/get-detail", getDetail);
router.get("/", search);

module.exports = router;
