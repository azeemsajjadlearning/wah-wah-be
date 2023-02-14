const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const {
  search,
  getConfig,
  getPopular,
  getTrending,
  getCreditDetail,
  getGenre,
  getDetail,
  getDetails,
  getUpcomingMovies,
  getAired,
  getSeasonDetail,
  getSeasonDetails,
  getEpisodeDetail,
  getEpisodeDetails,
  getWatchProviders,
} = require("../controller/imdb");

router.route("/search/:query/:page?").get(authMiddleware, search);
router.route("/get-config/:config_type?").get(getConfig);
router.route("/get-popular/:media_type/:page?").get(authMiddleware, getPopular);
router.route("/get-trending").get(authMiddleware, getTrending);
router
  .route("/get-credit-detail/:credit_id")
  .get(authMiddleware, getCreditDetail);
router.route("/get-genre/:media_type").get(authMiddleware, getGenre);
router.route("/get-detail").get(authMiddleware, getDetail);
router.route("/get-details").get(authMiddleware, getDetails);
router.route("/get-upcoming_movies").get(authMiddleware, getUpcomingMovies);
router.route("/get-aired/:time_window").get(authMiddleware, getAired);
router.route("/season/get-detail").get(authMiddleware, getSeasonDetail);
router.route("/season/get-details").get(authMiddleware, getSeasonDetails);
router.route("/episode/get-detail").get(authMiddleware, getEpisodeDetail);
router.route("/episode/get-details").get(authMiddleware, getEpisodeDetails);
router
  .route("/watch-provides/:content_type")
  .get(authMiddleware, getWatchProviders);

module.exports = router;
