const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  getUser,
  getAllUser,
  updateUser,
} = require("../controller/user");
const authMiddleware = require("../middleware/auth");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/").get(authMiddleware, getUser);
router.route("/all").get(authMiddleware, getAllUser);
router.route("/").post(authMiddleware, updateUser);

module.exports = router;
