const { StatusCodes } = require("http-status-codes");
const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

const { Photo } = require("../models/CloudStorage");

const uploadImages = async (req, res) => {
  try {
    const responses = [];

    for (const file of req.files) {
      try {
        const telegramResponse = await bot.sendDocument(
          process.env.TELEGRAM_BOT_ID,
          file.buffer
        );

        const response = await Photo.create({
          image: telegramResponse.document,
          user_id: req.user.user_id,
        });

        responses.push(response);
        // Send response for each image upload
        res.write(JSON.stringify({ success: true, result: response }));
      } catch (error) {
        console.error(`Error uploading image: ${error.message}`);
        // Send error response for each image upload failure
        res.write(JSON.stringify({ success: false, error: error.message }));
      }
    }

    res.end(); // End the response after all images are processed
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

const getImages = async (req, res) => {
  try {
    const imageIds = await Promise.all(
      (
        await Photo.find({ user_id: req.user.user_id }).sort({ uploadDate: -1 })
      ).map((item) => ({
        file_id: item.image?.file_id,
        thumbnail: item.image?.thumbnail?.file_id,
        metadata: item,
      }))
    );

    const response = await Promise.all(
      imageIds.map(async (ele) => {
        const thumbnailLink = await bot.getFileLink(ele.thumbnail);
        return {
          file_id: ele.file_id,
          thumbnail: thumbnailLink,
          metadata: ele.metadata,
        };
      })
    );

    res.status(StatusCodes.OK).json({ success: true, result: response });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

const getImage = async (req, res) => {
  try {
    const response = await bot.getFileLink(req.params.file_id);
    res.status(StatusCodes.OK).json({ success: true, result: response });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

const deleteImage = async (req, res) => {
  try {
    const file_id = req.params.file_id;

    if (!file_id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, error: "Missing file_id parameter" });
    }

    const response = await Photo.deleteOne({ "image.file_id": file_id });

    if (response.deletedCount === 1) {
      res.status(StatusCodes.OK).json({ success: true, result: response });
    } else {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, error: "Image not found" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

bot.on("photo", async (ctx) => {
  //   const response = await File.create({ file: ctx.document });
  bot.sendMessage(ctx.from.id, ctx.document.file_name + " is uploaded!");
});

bot.on("text", async (ctx) => {
  bot.sendMessage(ctx.from.id, ctx.text);
});

bot.on("document", async (ctx) => {
  //   const response = await File.create({ file: ctx.document });
  bot.sendMessage(ctx.from.id, ctx.document.file_name + " is uploaded!");
});

module.exports = { getImages, uploadImages, getImage, deleteImage };
