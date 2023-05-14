const express = require("express");
const router = express.Router();

const {
  getMenu,
  getAllMenu,
  createMenu,
  giveFirstPermission,
  givePermission,
  removePermission,
  getAllPermission,
} = require("../controller/menu");

const authMiddleware = require("../middleware/auth");

router.route("/").get(authMiddleware, getMenu);
router.route("/all").get(authMiddleware, getAllMenu);
router.route("/create-menu").post(authMiddleware, createMenu);
router.route("/give-first-permission/:user_id").get(giveFirstPermission);
router
  .route("/give-permission/:user_id/:menu_id")
  .get(authMiddleware, givePermission);
router
  .route("/remove-permission/:user_id/:menu_id")
  .get(authMiddleware, removePermission);
router.route("/all-permission").get(authMiddleware, getAllPermission);

module.exports = router;
