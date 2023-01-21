const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  resetPassword,
  getUser,
  updateUser,
} = require("../controller/user");
const authMiddleware = require("../middleware/auth");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/reset-password").post(resetPassword);
router.route("/").get(authMiddleware, getUser);
router.route("/").post(authMiddleware, updateUser);

module.exports = router;
