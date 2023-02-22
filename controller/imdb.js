var axios = require("axios");
const { StatusCodes } = require("http-status-codes");

const imdb_prefix = "https://api.themoviedb.org/3/";

const search = (req, res) => {
  try {
    axios
      .get(imdb_prefix + "search/multi", {
        params: {
          api_key: process.env.TMDB_KEY,
          query: req.params.query,
          page: req.params.page || 1,
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

const getConfig = (req, res) => {
  // type = "countries" | "jobs" | "languages" | "primary_translations" | "timezones";
  try {
    axios
      .get(
        imdb_prefix +
          "configuration" +
          (req.params.config_type ? "/" + req.params.config_type : ""),
        {
          params: {
            api_key: process.env.TMDB_KEY,
          },
        }
      )
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

const getPopular = (req, res) => {
  // media_type = 'movie' | 'tv' | 'person'
  try {
    axios
      .get(imdb_prefix + req.params.media_type + "/popular", {
        params: {
          api_key: process.env.TMDB_KEY,
          page: req.params.page || 1,
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

const getTrending = (req, res) => {
  try {
    axios
      .get(
        imdb_prefix +
          "trending/" +
          req.query.media_type +
          "/" +
          req.query.time_window,
        {
          params: {
            api_key: process.env.TMDB_KEY,
            language: req.query.language || "en-US",
            region: req.query.region || "IN",
            page: req.params.page || 1,
          },
        }
      )
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

const getCreditDetail = (req, res) => {
  try {
    axios
      .get(imdb_prefix + "credit/" + req.params.credit_id, {
        params: {
          api_key: process.env.TMDB_KEY,
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

const getGenre = (req, res) => {
  try {
    axios
      .get(imdb_prefix + "genre/" + req.params.media_type + "/list", {
        params: {
          api_key: process.env.TMDB_KEY,
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

const getDetail = (req, res) => {
  try {
    axios
      .get(imdb_prefix + req.query.media_type + "/" + req.query.media_id, {
        params: {
          api_key: process.env.TMDB_KEY,
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

const getDetails = (req, res) => {
  // type = "credits" | "external_ids" | "images" | "keywords" | "recommendations" | "release_dates" | "reviews" | "similar" | "translations" | "videos" | "watch/providers";
  try {
    axios
      .get(
        imdb_prefix +
          req.query.media_type +
          "/" +
          req.query.media_id +
          "/" +
          req.query.type,
        {
          params: {
            api_key: process.env.TMDB_KEY,
          },
        }
      )
      .then((resp) => {
        if (req.query.type == "watch/providers") {
          let response = Object.keys(resp.data).map((key) => ({
            id: key,
            ...resp.data[key],
          }));
          res
            .status(StatusCodes.OK)
            .send({ success: true, result: response[1] });
        } else
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

const getUpcomingMovies = (req, res) => {
  try {
    axios
      .get(imdb_prefix + "movie/upcoming", {
        params: {
          api_key: process.env.TMDB_KEY,
          language: req.query.language,
          region: req.query.region,
          page: req.query.page,
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

const getAired = (req, res) => {
  // time_window = "airing_today" | "on_the_air";
  try {
    axios
      .get(imdb_prefix + "tv/" + req.params.time_window, {
        params: {
          api_key: process.env.TMDB_KEY,
          language: req.query.language,
          page: req.query.page,
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

const getSeasonDetail = (req, res) => {
  try {
    axios
      .get(
        imdb_prefix +
          "tv/" +
          req.query.tv_id +
          "/season/" +
          req.query.season_number,
        {
          params: {
            api_key: process.env.TMDB_KEY,
          },
        }
      )
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

const getSeasonDetails = (req, res) => {
  // type = "account_states" | "aggregate_credits" | "credits" | "external_ids" | "images" | "translations" | "videos";
  try {
    axios
      .get(
        imdb_prefix +
          "tv/" +
          req.query.tv_id +
          "/season/" +
          req.query.season_number +
          "/" +
          req.query.type,
        {
          params: {
            api_key: process.env.TMDB_KEY,
          },
        }
      )
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

const getEpisodeDetail = (req, res) => {
  try {
    axios
      .get(
        imdb_prefix +
          "tv/" +
          req.query.tv_id +
          "/season/" +
          req.query.season_number +
          "/episode/" +
          req.query.episode_number,
        {
          params: {
            api_key: process.env.TMDB_KEY,
          },
        }
      )
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

const getEpisodeDetails = (req, res) => {
  // type = "credits" | "external_ids" | "images" | "translations" | "videos";
  try {
    axios
      .get(
        imdb_prefix +
          "tv/" +
          req.query.tv_id +
          "/season/" +
          req.query.season_number +
          "/episode/" +
          req.query.episode_number +
          "/" +
          req.query.type,
        {
          params: {
            api_key: process.env.TMDB_KEY,
          },
        }
      )
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

const getWatchProviders = (req, res) => {
  try {
    axios
      .get(imdb_prefix + "watch/providers/" + req.params.content_type, {
        params: {
          api_key: process.env.TMDB_KEY,
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
};
