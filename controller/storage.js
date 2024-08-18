const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

const BOT_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_BOT_ID;
const CHUNK_SIZE = 20 * 1024 * 1024;
const TEMP_DIR = "./temp_chunks";

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      throw new Error("File is not provided");
    }

    const { originalname, buffer } = req.file;
    const fileIdList = [];
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
        contentType: req.file.mimetype,
      });

      const response = await axios.post(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`,
        formData,
        {
          headers: formData.getHeaders(),
        }
      );

      if (response.data.ok) {
        fileIdList.push(response.data.result.document.file_id);
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

    res.status(200).json({
      success: true,
      result: { fileIdList, originalname },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// const uploadFile = async (req, res) => {
//   try {
//     if (!req.file) {
//       throw new Error("File is not provided");
//     }

//     const { originalname, buffer } = req.file;
//     const fileIdList = [];
//     const totalChunks = Math.ceil(buffer.length / CHUNK_SIZE);
//     let uploadedChunks = 0;

//     for (let start = 0; start < buffer.length; start += CHUNK_SIZE) {
//       const chunk = buffer.slice(start, start + CHUNK_SIZE);

//       const formData = new FormData();
//       formData.append("chat_id", CHAT_ID);
//       formData.append("document", chunk, {
//         filename: `${originalname}.part${Math.floor(start / CHUNK_SIZE)}`,
//         contentType: req.file.mimetype,
//       });

//       const response = await axios.post(
//         `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`,
//         formData,
//         {
//           headers: formData.getHeaders(),
//         }
//       );

//       if (response.data.ok) {
//         fileIdList.push(response.data.result.document.file_id);
//         uploadedChunks++;
//         const uploadProgress = ((uploadedChunks / totalChunks) * 100).toFixed(
//           2
//         );
//         console.log(`Upload progress: ${uploadProgress}%`);
//         res.send(uploadProgress);
//       } else {
//         throw new Error(`Failed to upload chunk: ${response.data.description}`);
//       }
//     }

//     res.status(200).json({
//       success: true,
//       fileIdList,
//       originalname,
//       uploadProgress: "100.00",
//     });
//   } catch (error) {
//     console.error("Error uploading file:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

const downloadFile = async (req, res) => {
  try {
    const { fileIdList, originalname } = req.body;
    const fileChunks = [];

    // Ensure the downloads directory exists
    const downloadDir = "./downloads";
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    for (const fileId of fileIdList) {
      // Get file information from Telegram
      const response = await axios.get(
        `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`
      );
      const filePath = response.data.result.file_path;
      const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

      // Download the file chunk
      const fileResponse = await axios.get(fileUrl, {
        responseType: "arraybuffer",
      });

      // Store the chunk in the fileChunks array
      fileChunks.push(Buffer.from(fileResponse.data));
    }

    // Combine all chunks into a single buffer
    const finalBuffer = Buffer.concat(fileChunks);

    // Write the combined buffer to a file
    const downloadPath = `${downloadDir}/${originalname}`;
    fs.writeFileSync(downloadPath, finalBuffer);

    // Send the file to the client for download
    res.download(downloadPath);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { uploadFile, downloadFile };

// {
//   "success": true,
//   "fileIdList": [
//       "BQACAgUAAxkDAAMKZsFmV8WSpTBcf8Pqmsm9LnrgsAYAAnwUAAJdoBBWskqkUqj3CgABNQQ",
//       "BQACAgUAAxkDAAMLZsFmYlVAqqZz7rI4lsnH84rzS5kAAn0UAAJdoBBW21LTtMIPpJo1BA"
//   ],
//   "originalname": "big_buck_bunny_720p_30mb.mp4"
// }
