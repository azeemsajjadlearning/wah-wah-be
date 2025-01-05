const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const Fuse = require("fuse.js");
const { StatusCodes } = require("http-status-codes");

const { Media, Chunk, Folder } = require("../models/CloudStorage");

const BOT_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_BOT_ID;
const TEMP_DIR = "./temp_chunks";

// Helper functions
const saveFileChunk = (chunk, filePath) => fs.writeFileSync(filePath, chunk);

const removeFile = (filePath) => fs.unlinkSync(filePath);

const uploadChunkToTelegram = async (chunkFilePath, mimetype) => {
  const formData = new FormData();
  formData.append("chat_id", CHAT_ID);
  formData.append("document", fs.createReadStream(chunkFilePath), {
    filename: path.basename(chunkFilePath),
    contentType: mimetype,
  });

  const response = await axios.post(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`,
    formData,
    { headers: formData.getHeaders() }
  );

  if (!response.data.ok) {
    throw new Error(`Failed to upload chunk: ${response.data.description}`);
  }

  return response.data.result.document.file_id;
};

const getChunkDataFromTelegram = async (fileId) => {
  const response = await axios.get(
    `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`
  );

  const filePath = response.data.result.file_path;
  const fileBuffer = await axios.get(
    `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`,
    { responseType: "arraybuffer" }
  );

  return fileBuffer.data;
};

// Main Controller Methods
const uploadFile = async (req, res) => {
  try {
    const { fileName, chunkIndex, totalChunks, folderId, fileSize, fileID } =
      req.body;

    if (!req.file) {
      throw new Error("No chunk provided");
    }

    const chunk = req.file;

    const chunkFilePath = path.join(TEMP_DIR, `${fileName}.part${chunkIndex}`);

    saveFileChunk(chunk.buffer, chunkFilePath);
    const chunkFileId = await uploadChunkToTelegram(
      chunkFilePath,
      chunk.mimetype
    );
    removeFile(chunkFilePath);

    const chunkRecord = await Chunk.findOneAndUpdate(
      { file_id: fileID },
      { $push: { chunk_file_ids: chunkFileId } },
      { upsert: true, new: true }
    );

    if (chunkRecord.chunk_file_ids.length === parseInt(totalChunks, 10)) {
      const media = new Media({
        file_name: fileName,
        mime_type: chunk.mimetype,
        file_id: fileID,
        parent_folder_id: folderId || null,
        file_size: +fileSize,
        user_id: req.user.user_id,
      });
      await media.save();

      return res.status(StatusCodes.OK).json({
        success: true,
        uploadProgress: 100,
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      uploadProgress: (((+chunkIndex + 1) / +totalChunks) * 100).toFixed(2),
    });
  } catch (error) {
    console.error("Error uploading chunk:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
    });
  }
};

const downloadChunk = async (req, res) => {
  try {
    const chunkId = req.body.chunk_id;
    const chunkData = await getChunkDataFromTelegram(chunkId);
    res.status(StatusCodes.OK).send(chunkData);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
    });
  }
};

const getChunks = async (req, res) => {
  const file_id = req.params.file_id;

  try {
    const chunk = await Chunk.findOne({ file_id: file_id });
    res.status(StatusCodes.OK).send({ success: true, result: chunk });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

const getFiles = async (req, res) => {
  try {
    const files = await Media.find({
      user_id: req.user.user_id,
      parent_folder_id: req.params.folder_id == 0 ? null : req.params.folder_id,
    });
    res.status(StatusCodes.OK).json({ success: true, result: files });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
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
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
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
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

const deleteFolder = async (req, res) => {
  try {
    await Folder.deleteOne({ _id: req.params.folder_id });
    res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Folder deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const media = await Media.findOne({ file_id: fileId });
    if (!media) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, error: "File not found" });
    }

    const chunk = await Chunk.findOne({ file_id: fileId });
    if (!chunk) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, error: "Chunks not found" });
    }

    await Media.deleteOne({ file_id: fileId });
    await Chunk.deleteOne({ file_id: fileId });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "File and its chunks deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
    });
  }
};

const moveFiles = async (req, res) => {
  try {
    const { fileIds, destinationFolderId } = req.body;

    if (!fileIds || !destinationFolderId) {
      throw new Error("File IDs and destination folder ID are required.");
    }

    const destinationFolder = await Folder.findById(destinationFolderId);
    if (!destinationFolder) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, error: "Destination folder not found" });
    }

    const updatePromises = fileIds.map((fileId) =>
      Media.updateOne(
        { file_id: fileId },
        { parent_folder_id: destinationFolderId }
      )
    );
    await Promise.all(updatePromises);

    res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Files moved successfully" });
  } catch (error) {
    console.error("Error moving files:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
    });
  }
};

const moveFolder = async (req, res) => {
  try {
    const { folderId, destinationFolderId } = req.body;

    if (!folderId || !destinationFolderId) {
      throw new Error("Folder ID and destination folder ID are required.");
    }

    // Validate folders
    const folderToMove = await Folder.findById(folderId);
    const destinationFolder = await Folder.findById(destinationFolderId);

    if (!folderToMove) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, error: "Folder to move not found" });
    }

    if (!destinationFolder) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, error: "Destination folder not found" });
    }

    // Update the parent_folder_id for the folder
    await Folder.updateOne(
      { _id: folderId },
      { parent_folder_id: destinationFolderId }
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Folder moved successfully",
    });
  } catch (error) {
    console.error("Error moving folder:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
    });
  }
};

const search = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res
        .status(400)
        .json({ success: false, error: "Query parameter is required" });
    }

    // Search in files
    const files = await Media.find({
      user_id: req.user.user_id,
      file_name: { $regex: query, $options: "i" }, // Case-insensitive search
    });

    // Search in folders
    const folders = await Folder.find({
      user_id: req.user.user_id,
      name: { $regex: query, $options: "i" }, // Case-insensitive search
    });

    // Fuse.js options for files
    const fileOptions = {
      includeScore: true,
      threshold: 0.4, // Adjust threshold as needed
      keys: ["file_name"], // Search file_name field
    };

    // Fuse.js options for folders
    const folderOptions = {
      includeScore: true,
      threshold: 0.4, // Adjust threshold as needed
      keys: ["name"], // Search name field
    };

    // Create Fuse instances for files and folders
    const fileFuse = new Fuse(files, fileOptions);
    const folderFuse = new Fuse(folders, folderOptions);

    // Perform searches with Fuse.js
    const fileResults = fileFuse.search(query).map((result) => result.item);
    const folderResults = folderFuse.search(query).map((result) => result.item);

    // Combine results into separate arrays
    res.status(200).json({
      success: true,
      files: fileResults,
      folders: folderResults,
    });
  } catch (error) {
    console.error("Error searching:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getFiles,
  uploadFile,
  getChunks,
  downloadChunk,
  createFolder,
  getFolders,
  deleteFolder,
  deleteFile,
  moveFiles,
  moveFolder,
  search,
};
