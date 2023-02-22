const express = require("express");
const router = express.Router();
const {
  getAllTask,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} = require("../controller/task");
const authMiddleware = require("../middleware/auth");

router.route("/").get(authMiddleware, getAllTask);
router.route("/:id").get(authMiddleware, getTask);
router.route("/").post(authMiddleware, createTask);
router.route("/:id").put(authMiddleware, updateTask);
router.route("/:id").delete(authMiddleware, deleteTask);

module.exports = router;
