const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const Fuse = require("fuse.js");
const { StatusCodes } = require("http-status-codes");

const { File, FileChunk, Folder } = require("../models/CloudStorage");

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const SECRET_KEY = process.env.ENCRYPTION_KEY;
const TEMP_DIR = "/tmp/temp_chunks";

const uploadFile = async (req, res) => {
  const { file } = req;

  if (!file) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "No file uploaded" });
  }

  const tempFilePath = path.join(TEMP_DIR, file.originalname);

  try {
    const encryptedData = encryptData(file.buffer, SECRET_KEY);
    saveFileChunk(encryptedData, tempFilePath);

    const form = new FormData();
    form.append("file", fs.createReadStream(tempFilePath));

    const response = await axios.post(
      `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`,
      form,
      { headers: { Authorization: `Bot ${BOT_TOKEN}` } }
    );

    let mimeType = req.body.mime_type;
    if (req.body.file_name && req.body.file_name.endsWith(".mkv")) {
      mimeType = "video/x-matroska";
    } else if (req.body.file_name && req.body.file_name.endsWith(".srt")) {
      mimeType = "application/x-subrip";
    }

    const updatedFile = await File.findOneAndUpdate(
      { file_id: req.body.file_id },
      {
        file_name: req.body.file_name,
        mime_type: mimeType,
        file_size: req.body.file_size,
        folder_id:
          (req.body.folder_id == 0 ? null : req.body.folder_id) || null,
        user_id: req.user.user_id,
        updated_at: Date.now(),
      },
      { new: true, upsert: true }
    );

    const chunk = await FileChunk.updateOne(
      { file_id: req.body.file_id },
      { $addToSet: { message_ids: response.data.id } },
      { upsert: true }
    );

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
  const message_id = req.body.message_id;

  try {
    axios
      .get(
        `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages/${message_id}`,
        {
          headers: {
            Authorization: `Bot ${BOT_TOKEN}`,
          },
        }
      )
      .then(async (resp) => {
        const response = await axios.get(resp.data.attachments[0]?.url, {
          responseType: "arraybuffer",
        });

        const decryptedData = decryptData(response.data, SECRET_KEY);

        const contentDisposition = response.headers["content-disposition"];
        const fileName = contentDisposition
          ? contentDisposition.split("filename=")[1]
          : "downloaded_file";

        res.setHeader("Content-Type", response.headers["content-type"]);
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${fileName}`
        );

        res.send(decryptedData);
      })
      .catch((err) => {
        console.error("Response Error:", err);
      });
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
    const chunks = await FileChunk.find({ file_id: req.params.file_id });
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

const search = async (req, res) => {
  try {
    const query = req.params.query;
    const userId = req.user.user_id;

    const allFiles = await File.find({ user_id: userId });
    const allFolders = await Folder.find({ user_id: userId });

    const fuseOptions = {
      keys: ["file_name", "folder_name"],
      threshold: 0.4,
    };

    const fileFuse = new Fuse(allFiles, {
      keys: ["file_name"],
      ...fuseOptions,
    });
    const folderFuse = new Fuse(allFolders, {
      keys: ["folder_name"],
      ...fuseOptions,
    });

    const fuzzyFiles = fileFuse.search(query).map((result) => result.item);
    const fuzzyFolders = folderFuse.search(query).map((result) => result.item);

    const exactFiles = await File.find({
      user_id: userId,
      file_name: new RegExp(query, "i"),
    });

    const exactFolders = await Folder.find({
      user_id: userId,
      folder_name: new RegExp(query, "i"),
    });

    const dedupedFiles = [
      ...new Map(
        [...exactFiles, ...fuzzyFiles].map((item) => [item.file_name, item])
      ).values(),
    ];

    const dedupedFolders = [
      ...new Map(
        [...exactFolders, ...fuzzyFolders].map((item) => [
          item.folder_name,
          item,
        ])
      ).values(),
    ];

    dedupedFiles.sort((a, b) => a.file_name.localeCompare(b.file_name));
    dedupedFolders.sort((a, b) => a.folder_name.localeCompare(b.folder_name));

    return res.status(StatusCodes.OK).send({
      success: true,
      result: {
        files: dedupedFiles,
        folders: dedupedFolders,
      },
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || error,
    });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { file_id } = req.params;
    const file = await File.findOne({ file_id });

    if (!file) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "File not found.",
      });
    }

    if (file.status === "uploaded") {
      const fileChunks = await FileChunk.find({ file_id });

      if (!fileChunks.length) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: "No chunks found for the specified file_id.",
        });
      }

      const messageIds = fileChunks.map((chunk) => chunk.message_ids).flat();

      if (messageIds.length > 1) {
        const chunkSize = 100;
        for (let i = 0; i < messageIds.length; i += chunkSize) {
          const chunk = messageIds.slice(i, i + chunkSize);
          try {
            await axios.post(
              `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages/bulk-delete`,
              { messages: chunk },
              { headers: { Authorization: `Bot ${BOT_TOKEN}` } }
            );
          } catch (error) {
            console.error(`Error deleting chunk: ${chunk}`, error);
          }
        }
      } else {
        try {
          await axios.delete(
            `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages/${messageIds[0]}`,
            { headers: { Authorization: `Bot ${BOT_TOKEN}` } }
          );
        } catch (error) {
          console.error(
            `Error deleting message with ID ${messageIds[0]}:`,
            error
          );
        }
      }

      await File.deleteOne({ file_id });
      await FileChunk.deleteOne({ file_id });
    } else if (file.status === "shortcut") {
      await File.deleteOne({ file_id });
    }

    return res.status(StatusCodes.OK).send({ success: true });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || error,
    });
  }
};

const getFiles = async (req, res) => {
  try {
    const folderId = req.params.folder_id == 0 ? null : req.params.folder_id;

    const files = await File.find({
      folder_id: folderId,
      user_id: req.user.user_id,
    }).sort({ file_name: 1 });

    const folders = await Folder.find({
      parent_folder_id: folderId,
      user_id: req.user.user_id,
    }).sort({ folder_name: 1 });

    const folderPath = folderId ? await getFolderPath(folderId) : [];

    return res.status(StatusCodes.OK).send({
      success: true,
      result: {
        files,
        folders,
        folderPath,
      },
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || error,
    });
  }
};

const renameFile = async (req, res) => {
  try {
    const file = await File.findOne({ file_id: req.params.file_id });

    if (!file) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "File not found",
      });
    }

    file.file_name = req.body.file_name || file.file_name;

    await file.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      result: file,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || error,
    });
  }
};

const createFolder = async (req, res) => {
  try {
    const folder = new Folder({
      folder_name: req.body.folder_name,
      parent_folder_id: req.body.parent_folder_id,
      user_id: req.user.user_id,
    });

    await folder.save();

    return res
      .status(StatusCodes.CREATED)
      .json({ success: true, result: folder });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || error,
    });
  }
};

const renameFolder = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.folder_id);

    if (!folder) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "Folder not found",
      });
    }

    folder.folder_name = req.body.folder_name || folder.folder_name;

    await folder.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      result: folder,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || error,
    });
  }
};

const deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.folder_id);

    if (!folder) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "Folder not found",
      });
    }

    const file = await File.find({ folder_id: req.params.folder_id });
    const insideFolder = await Folder.find({
      parent_folder_id: req.params.folder_id,
    });

    if (file.length > 0 || insideFolder.length > 0) {
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        error: "This folder contains some files or folders!",
      });
    } else {
      const folder = await Folder.findByIdAndDelete(req.params.folder_id);
      return res.status(StatusCodes.OK).json({
        success: true,
        result: folder,
      });
    }
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || error,
    });
  }
};

const moveFile = async (req, res) => {
  const { file_id, target_folder } = req.body;

  if (!file_id) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "File ID and target folder are required",
    });
  }

  try {
    const file = await File.findOne({ file_id });

    if (!file) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "File not found",
      });
    }

    file.folder_id = target_folder;
    file.updated_at = Date.now();
    await file.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "File moved successfully",
      result: file,
    });
  } catch (err) {
    console.error("Error moving file:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to move file",
      error: err.message || err,
    });
  }
};

const copyFile = async (req, res) => {
  const { file_id, target_folder, new_file_id } = req.body;

  if (!file_id) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "File ID is required",
    });
  }

  try {
    const file = await File.findOne({ file_id });

    if (!file) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "File not found",
      });
    }

    const copiedFile = new File({
      file_name: file.file_name,
      mime_type: file.mime_type,
      file_id: new_file_id,
      origin_file_id: file.origin_file_id || file_id,
      file_size: file.file_size,
      status: "shortcut",
      folder_id: target_folder,
      user_id: file.user_id,
    });

    await copiedFile.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "File copied successfully",
      result: copiedFile,
    });
  } catch (err) {
    console.error("Error copying file:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to copy file",
      error: err.message || err,
    });
  }
};

const moveFolder = async (req, res) => {
  const { folder_id, target_folder } = req.body;

  if (!folder_id) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Folder ID and target folder are required",
    });
  }

  try {
    const folder = await Folder.findOne({ folder_id });

    if (!folder) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Folder not found",
      });
    }

    folder.parent_folder_id = target_folder;
    folder.updated_at = Date.now();
    await folder.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Folder moved successfully",
      result: folder,
    });
  } catch (error) {
    console.error("Error moving folder:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to move folder",
      error: err.message || err,
    });
  }
};

// Helper Function
const saveFileChunk = (chunk, filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, chunk);
};

const removeFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("Error removing file:", err);
  }
};

const encryptData = (data, key) => {
  return Buffer.from(data).map(
    (byte, index) => byte ^ key.charCodeAt(index % key.length)
  );
};

const decryptData = (data, key) => {
  return Buffer.from(data).map(
    (byte, index) => byte ^ key.charCodeAt(index % key.length)
  );
};

const getFolderPath = async (folderId) => {
  let path = [];
  let currentFolder = await Folder.findById(folderId);

  while (currentFolder) {
    path.unshift({
      folder_id: currentFolder.id,
      folder_name: currentFolder.folder_name,
    });
    if (!currentFolder.parent_folder_id) break;
    currentFolder = await Folder.findById(currentFolder.parent_folder_id);
  }

  return path;
};

const fixDB = async (req, res) => {
  try {
    const storage = await File.aggregate([
      {
        $group: {
          _id: null,
          totalFileSize: { $sum: "$file_size" },
        },
      },
      {
        $project: {
          _id: 0,
          totalFileSizeInGB: {
            $divide: [
              { $divide: [{ $divide: ["$totalFileSize", 1024] }, 1024] },
              1024,
            ],
          },
        },
      },
    ]);

    const messages = await FileChunk.aggregate([
      { $unwind: "$message_ids" },
      { $group: { _id: null, totalMessageIds: { $sum: 1 } } },
    ]);

    const storageInGB = storage.length > 0 ? storage[0].totalFileSizeInGB : 0;
    const totalMessages = messages.length > 0 ? messages[0].totalMessageIds : 0;

    const storageRounded = storageInGB.toFixed(2);

    res.send({
      success: true,
      storage: parseFloat(storageRounded),
      messages: totalMessages,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || error,
    });
  }
};

module.exports = {
  uploadFile,
  downloadChunk,
  getChunks,
  search,
  deleteFile,
  getFiles,
  renameFile,
  createFolder,
  renameFolder,
  deleteFolder,
  moveFile,
  copyFile,
  moveFolder,
  fixDB,
};
