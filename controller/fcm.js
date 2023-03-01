const { StatusCodes } = require("http-status-codes");
const firebaseAdmin = require("firebase-admin");

const sendNotification = async (req, res) => {
  try {
    const message = {
      notification: {
        title: "New Notification",
        body: "This is a notification sent from the server!",
      },
      topic: "all",
    };

    const response = await firebaseAdmin.messaging().send(message);

    console.log("Successfully sent message:", response);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error sending message:", error);
    res.sendStatus(500);
  }
};

module.exports = { sendNotification };
