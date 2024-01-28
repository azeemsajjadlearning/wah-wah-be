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
        res.write(JSON.stringify({ success: true, result: response }));
      } catch (error) {
        console.error(`Error uploading image: ${error.message}`);
        res.write(JSON.stringify({ success: false, error: error.message }));
      }
    }

    res.end();
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

const getImages = async (req, res) => {
  try {
    const images = await Photo.find({ user_id: req.user.user_id }).sort({
      uploadDate: -1,
    });

    const response = await Promise.all(
      images.map(async (item) => {
        const file_id = item.image?.file_id;
        const thumbnail = item.image?.thumbnail?.file_id;
        const metadata = item;

        const thumbnailLink = thumbnail
          ? await bot.getFileLink(thumbnail)
          : null;

        return {
          file_id,
          thumbnail: thumbnailLink,
          metadata,
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

    const image = await Photo.findOne({ "image.file_id": req.params.file_id });

    if (!image)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, error: "Image not found" });

    res.status(StatusCodes.OK).json({ success: true, result: response, image });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

const editImage = async (req, res) => {
  try {
    const { title, description, uploadDate, album } = req.body;
    const imageId = req.params.id;

    const result = await Photo.updateOne(
      { _id: imageId },
      {
        $set: {
          title,
          description,
          uploadDate,
          album: album || null,
        },
      }
    );

    if (result.nModified === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, error: "Image not found" });
    }

    res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Image edited successfully" });
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

    if (response.acknowledged && response.deletedCount === 1) {
      res
        .status(StatusCodes.OK)
        .json({ success: true, message: "Image deleted successfully" });
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

const setFavorite = async (req, res) => {
  try {
    const imageId = req.params.id;

    const existingPhoto = await Photo.findById(imageId);

    if (!existingPhoto) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, error: "Image not found" });
    }

    const newFavoriteValue = !existingPhoto.is_favorite;

    const result = await Photo.updateOne(
      { _id: imageId },
      { $set: { is_favorite: newFavoriteValue } }
    );

    if (result.nModified === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, error: "Image not found" });
    }

    res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Image edited successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

module.exports = {
  getImages,
  uploadImages,
  getImage,
  editImage,
  deleteImage,
  setFavorite,
};
