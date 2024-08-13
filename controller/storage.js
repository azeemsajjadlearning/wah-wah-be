const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const { StatusCodes } = require("http-status-codes");

const upload = async (req, res) => {
  try {
    console.log('hello')
    res.status(StatusCodes.OK).json({
      success: true,
      result: "resp.data",
    });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

module.exports = { upload };
