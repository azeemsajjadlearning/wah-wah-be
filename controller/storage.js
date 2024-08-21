const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

const { Media, Chunk, Folder } = require("../models/CloudStorage");
const { StatusCodes } = require("http-status-codes");

const BOT_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_BOT_ID;
const CHUNK_SIZE = 20 * 1024 * 1024;
const TEMP_DIR = "./temp_chunks";

// if (!fs.existsSync(TEMP_DIR)) {
//   fs.mkdirSync(TEMP_DIR);
// }

const getFiles = async (req, res) => {
  try {
    const files = await Media.find({
      user_id: req.user.user_id,
      parent_folder_id: req.params.folder_id == 0 ? null : req.params.folder_id,
    });
    res.status(StatusCodes.OK).json({ success: true, result: files });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
};

const getChunks = async (req, res) => {
  try {
    const chunk = await Chunk.findOne({ file_id: req.params.file_id });
    res.status(StatusCodes.OK).json({ success: true, result: chunk });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      throw new Error("File is not provided");
    }

    const { originalname, buffer, mimetype } = req.file;
    const fileIdList = [];
    const chunkFileIds = [];
    const totalChunks = Math.ceil(buffer.length / CHUNK_SIZE);
    let uploadedChunks = 0;

    for (let start = 0; start < buffer.length; start += CHUNK_SIZE) {
      const chunk = buffer.slice(start, start + CHUNK_SIZE);

      const chunkFilePath = path.join(
        TEMP_DIR,
        `${originalname}.part${Math.floor(start / CHUNK_SIZE)}`
      );
      fs.writeFileSync(chunkFilePath, chunk);

      const formData = new FormData();
      formData.append("chat_id", CHAT_ID);
      formData.append("document", fs.createReadStream(chunkFilePath), {
        filename: path.basename(chunkFilePath),
        contentType: mimetype,
      });

      const response = await axios.post(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`,
        formData,
        {
          headers: formData.getHeaders(),
        }
      );

      if (response.data.ok) {
        const fileId = response.data.result.document.file_id;
        fileIdList.push(fileId);
        chunkFileIds.push(fileId);
        uploadedChunks++;
        const uploadProgress = ((uploadedChunks / totalChunks) * 100).toFixed(
          2
        );
        console.log(`Upload progress: ${uploadProgress}%`);

        fs.unlinkSync(chunkFilePath);
      } else {
        throw new Error(`Failed to upload chunk: ${response.data.description}`);
      }
    }

    const randomId = new Date().getTime();

    const media = new Media({
      file_name: originalname,
      mime_type: mimetype,
      file_id: randomId,
      parent_folder_id: req.body.folderId || null,
      file_size: buffer.length,
      user_id: req.user.user_id,
    });
    await media.save();

    const chunk = new Chunk({
      file_id: randomId,
      chunk_file_ids: chunkFileIds,
    });
    await chunk.save();

    res.status(200).json({
      success: true,
      result: { fileIdList, originalname },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const downloadFile = async (req, res) => {
  try {
    const { fileIdList, originalname } = req.body;
    const fileChunks = [];
    const totalFiles = fileIdList.length;
    let completedFiles = 0;

    const downloadDir = "./downloads";
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    const downloadFileChunk = async (fileId) => {
      try {
        const response = await axios.get(
          `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`
        );
        const filePath = response.data.result.file_path;
        const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

        const fileResponse = await axios.get(fileUrl, {
          responseType: "arraybuffer",
        });

        fileChunks.push(Buffer.from(fileResponse.data));

        completedFiles++;
        console.log(
          "Progress: " +
            (completedFiles / totalFiles) * 100 +
            "% files downloaded."
        );
      } catch (error) {
        console.error(`Error downloading file with ID ${fileId}:`, error);
      }
    };

    await Promise.all(fileIdList.map(downloadFileChunk));

    const finalBuffer = Buffer.concat(fileChunks);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${originalname}`
    );
    res.setHeader("Content-Type", "application/octet-stream");

    res.send(finalBuffer);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const createFolder = async (req, res) => {
  try {
    const folder = await Folder.create({
      name: req.body.folder_name,
      parent_folder_id: req.body.parent_folder_id || null,
      user_id: req.user.user_id,
    });
    res.status(StatusCodes.OK).json({ success: true, result: folder });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
};

const getFolders = async (req, res) => {
  try {
    const folders = await Folder.find({
      user_id: req.user.user_id,
      parent_folder_id: req.params.folder_id == 0 ? null : req.params.folder_id,
    });
    res.status(StatusCodes.OK).json({ success: true, result: folders });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
};

const deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.deleteOne({ _id: req.params.folder_id });
    res.status(StatusCodes.OK).json({ success: true, result: folder });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const media = await Media.findOne({ file_id: fileId });
    if (!media) {
      return res.status(404).json({ success: false, error: "File not found" });
    }

    const chunk = await Chunk.findOne({ file_id: fileId });

    if (!chunk) {
      return res
        .status(404)
        .json({ success: false, error: "Chunks not found" });
    }

    await Media.deleteOne({ file_id: fileId });

    await Chunk.deleteOne({ file_id: fileId });

    res.status(200).json({
      success: true,
      message: "File and its chunks deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getFiles,
  getChunks,
  uploadFile,
  downloadFile,
  createFolder,
  getFolders,
  deleteFolder,
  deleteFile,
};
