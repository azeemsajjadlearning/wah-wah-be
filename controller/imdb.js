var request = require("request");
const { StatusCodes } = require("http-status-codes");

const getPopular = (req, res) => {
  Promise.all([
    makeRequest(
      `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_KEY}`
    ),
    makeRequest(
      `https://api.themoviedb.org/3/tv/popular?api_key=${process.env.TMDB_KEY}`
    ),
  ])
    .then(([resp1, resp2]) => {
      res
        .status(StatusCodes.OK)
        .send({ success: true, result: { movie: resp1, tv: resp2 } });
    })
    .catch((error) => {
      console.error(error);
      res.send({ success: false, err: error });
    });
};

const searchQuery = (req, res) => {
  try {
    var options = {
      method: "GET",
      url: `https://api.themoviedb.org/3/search/multi?api_key=${process.env.TMDB_KEY}&query=${req.params.query}`,
    };
    request(options, function (error, response) {
      if (error) res.send({ success: false, err: error });
      res
        .status(StatusCodes.OK)
        .send({ success: true, result: JSON.parse(response.body) });
    });
  } catch (error) {
    console.log(error);
    res.send({ success: false, err: error });
  }
};

const getDetail = (req, res) => {
  Promise.all([
    makeRequest(
      `https://api.themoviedb.org/3/${req.params.media_type}/${req.params.id}?api_key=${process.env.TMDB_KEY}`
    ),
    makeRequest(
      `https://api.themoviedb.org/3/${req.params.media_type}/${req.params.id}/credits?api_key=${process.env.TMDB_KEY}`
    ),
    makeRequest(
      `https://api.themoviedb.org/3/${req.params.media_type}/${req.params.id}/videos?api_key=${process.env.TMDB_KEY}`
    ),
  ])
    .then(([resp1, resp2, resp3]) => {
      res.status(StatusCodes.OK).send({
        success: true,
        result: {
          detail: resp1,
          credits: resp2,
          videos: resp3.results,
        },
      });
    })
    .catch((error) => {
      console.error(error);
      res.send({ success: false, err: error });
    });
};

makeRequest = (url) => {
  return new Promise((resolve, reject) => {
    request(url, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(JSON.parse(body));
      }
    });
  });
};

module.exports = { searchQuery, getDetail, getPopular };
