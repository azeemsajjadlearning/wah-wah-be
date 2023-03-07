const Menu = require("../models/Menu");
const UserMenuMapping = require("../models/UserMenuMapping");
const { StatusCodes } = require("http-status-codes");

const getMenu = async (req, res) => {
  try {
    UserMenuMapping.find({ users: req.user.user_id })
      .select("menu")
      .then((userMenuMappings) => {
        const menuIds = userMenuMappings.map((mapping) => mapping.menu);
        return Menu.find({ _id: { $in: menuIds } });
      })
      .then((menus) => {
        return res
          .status(StatusCodes.OK)
          .send({ success: true, result: menus });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.log(error);
    res.send({ success: false, err: error });
  }
};

const getAllMenu = async (req, res) => {
  try {
    const menu = await Menu.find();
    res.status(StatusCodes.OK).send({ success: true, result: menu });
  } catch (error) {
    console.log(error);
    res.send({ success: false, err: error });
  }
};

const createMenu = async (req, res) => {
  try {
    const menu = await Menu.create(req.body);
    res.status(StatusCodes.CREATED).send({ success: true, result: menu });
  } catch (error) {
    console.log(error);
    res.send({ success: false, err: error });
  }
};

const giveFirstPermission = async (req, res) => {
  try {
    const mapping = await UserMenuMapping.create({
      users: req.params.user_id,
      menu: "64056cd26f3400ec6de9a980",
    });
    res.status(StatusCodes.CREATED).send({ success: true, result: mapping });
  } catch (error) {
    console.log(error);
    res.send({ success: false, err: error });
  }
};

const givePermission = async (req, res) => {
  try {
    const mapping = await UserMenuMapping.create({
      users: req.params.user_id,
      menu: req.params.menu_id,
    });
    res.status(StatusCodes.CREATED).send({ success: true, result: mapping });
  } catch (error) {
    console.log(error);
    res.send({ success: false, err: error });
  }
};

const removePermission = async (req, res) => {
  try {
    const mapping = await UserMenuMapping.deleteOne({
      menu: req.params.menu_id,
      users: [req.params.user_id],
    });
    res.status(StatusCodes.ACCEPTED).send({ success: true, result: mapping });
  } catch (error) {
    console.log(error);
    res.send({ success: false, err: error });
  }
};

const getAllPermission = async (req, res) => {
  try {
    const permission = await UserMenuMapping.find();
    res.status(StatusCodes.OK).send({ success: true, result: permission });
  } catch (error) {
    console.log(error);
    res.send({ success: false, err: error });
  }
};

module.exports = {
  getMenu,
  getAllMenu,
  createMenu,
  giveFirstPermission,
  givePermission,
  removePermission,
  getAllPermission,
};
