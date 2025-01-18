const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const { StatusCodes } = require("http-status-codes");

const { File, Chunk } = require("../models/CloudStorage");
const { STATUS_CODES } = require("http");

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const TEMP_DIR = "./temp_chunks";

// Helper Function
const saveFileChunk = (chunk, filePath) => fs.writeFileSync(filePath, chunk);
const removeFile = (filePath) => fs.unlinkSync(filePath);

const uploadFile = async (req, res) => {
  const { file } = req;

  if (!file) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "No file uploaded" });
  }

  const tempFilePath = path.join(TEMP_DIR, file.originalname);

  try {
    saveFileChunk(file.buffer, tempFilePath);

    const form = new FormData();
    form.append("file", fs.createReadStream(tempFilePath));

    const response = await axios.post(
      `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`,
      form,
      { headers: { Authorization: `Bot ${BOT_TOKEN}` } }
    );

    const updatedFile = await File.findOneAndUpdate(
      { file_id: req.body.file_id },
      {
        file_name: req.body.file_name,
        mime_type: req.body.mime_type,
        file_size: req.body.file_size,
        folder_id: req.body.folder_id || null,
        user_id: req.user.user_id,
        updated_at: Date.now(),
      },
      { new: true, upsert: true }
    );

    const chunk = new Chunk({
      file_id: req.body.file_id,
      chunk_file_id: response.data.attachments[0].id,
      message_id: response.data.id,
      metadata: response.data.attachments[0],
    });
    await chunk.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "File uploaded successfully to Discord",
      result: updatedFile,
    });
  } catch (err) {
    console.error("Error uploading file to Discord:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to upload file to Discord",
      error: err.message || err,
    });
  } finally {
    removeFile(tempFilePath);
  }
};

const downloadChunk = async (req, res) => {
  const fileUrl = req.body.url;

  try {
    const response = await axios.get(fileUrl, {
      responseType: "stream",
    });

    const contentDisposition = response.headers["content-disposition"];
    const fileName = contentDisposition
      ? contentDisposition.split("filename=")[1]
      : "downloaded_file";

    res.setHeader("Content-Type", response.headers["content-type"]);
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    response.data.pipe(res);
  } catch (error) {
    console.error("Error downloading file:", error.response);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error occurred while downloading the file.",
      error: error.message,
    });
  }
};

const getChunks = async (req, res) => {
  try {
    const chunks = await Chunk.find({ file_id: req.params.file_id });
    const file = await File.find({ file_id: req.params.file_id });
    return res
      .status(StatusCodes.OK)
      .send({ success: true, result: chunks, file: file });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || error,
    });
  }
};

module.exports = { uploadFile, downloadChunk, getChunks };
