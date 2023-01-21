const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

const authenticationMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(StatusCodes.UNAUTHORIZED);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(StatusCodes.FORBIDDEN);
    req.user = user;
    next();
  });
};

module.exports = authenticationMiddleware;
