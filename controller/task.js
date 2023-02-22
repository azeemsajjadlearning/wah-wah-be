const { StatusCodes } = require("http-status-codes");
const Task = require("../models/Tasks");

const getAllTask = async (req, res) => {
  try {
    const tasks = await Task.find({ user_id: req.user.user_id }).sort({
      createdAt: -1,
    });
    res.status(StatusCodes.OK).send({ success: true, result: tasks });
  } catch (error) {
    console.log(error);
    res.send({ success: false, err: error });
  }
};

const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    res.status(StatusCodes.OK).send({ success: true, result: task });
  } catch (error) {
    console.log(error);
    res.send({ success: false, err: error });
  }
};

const createTask = async (req, res) => {
  try {
    req.body.user_id = req.user.user_id;
    const task = await Task.create(req.body);
    res.status(StatusCodes.CREATED).send({ success: true, result: task });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body);
    res.status(StatusCodes.OK).send({ success: true, result: updatedTask });
  } catch (error) {
    console.log(error);
    res.send({ success: false, err: error });
  }
};

const deleteTask = async (req, res) => {
  try {
    await Task.deleteOne({ _id: req.params.id })
      .then((resp) => {
        if (resp.deletedCount == 1) {
          res.status(StatusCodes.OK).send({ success: true });
        } else {
          res
            .status(StatusCodes.NO_CONTENT)
            .send({ success: false, result: "task not found!" });
        }
      })
      .catch((err) => {
        console.log(err);
        res.send({ success: false, err });
      });
  } catch (error) {
    console.log(error);
    res.send({ success: false, err: error });
  }
};

module.exports = { getAllTask, getTask, createTask, updateTask, deleteTask };
