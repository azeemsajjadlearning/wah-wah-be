const express = require("express");
const firebaseAdmin = require("firebase-admin");
const firebase = require("firebase");
const connectDB = require("./db/connect");
const cors = require("cors");
const { StatusCodes } = require("http-status-codes");
var axios = require("axios");
// const serviceAccount = require("./firebase.json");
require("dotenv").config();

const app = express();
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(
    JSON.parse(process.env.FIREBASE_KEY)
  ),
});
firebase.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
});

const user = require("./routes/user");
const task = require("./routes/task");
const thirdParty = require("./routes/third-party");
const imdb = require("./routes/imdb");
const gsmarena = require("./routes/gsm-arena");
const fcm = require("./routes/fcm");
const weather = require("./routes/weather");
const stock = require("./routes/stock");
const quran = require("./routes/quran");
const menu = require("./routes/menu");
const scraping = require("./routes/scraping");
const train = require("./routes/train");
const flight = require("./routes/flight");
const investment = require("./routes/investment");
const cricket = require("./routes/cricket");
const telegram = require("./routes/telegram");
const storage = require("./routes/storage");

app.use(express.json());
app.use(cors());

const api_suffix = "/api/v1/";

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/test", async (req, res) => {
  try {
    const resp = await axios.get(
      "https://hs-consumer-api.espncricinfo.com/v1/pages/matches/current?lang=en&latest=true"
    );
    res.status(StatusCodes.OK).send({
      success: true,
      result: resp.data,
    });
  } catch (error) {
    console.log(error.response);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ success: false, err: error });
  }
});

app.use(api_suffix + "users", user);
app.use(api_suffix + "tasks", task);
app.use(api_suffix + "third-party", thirdParty);
app.use(api_suffix + "imdb", imdb);
app.use(api_suffix + "mobile", gsmarena);
app.use(api_suffix + "fcm", fcm);
app.use(api_suffix + "weather", weather);
app.use(api_suffix + "stock", stock);
app.use(api_suffix + "quran", quran);
app.use(api_suffix + "menu", menu);
app.use(api_suffix + "scrap", scraping);
app.use(api_suffix + "train", train);
app.use(api_suffix + "flight", flight);
app.use(api_suffix + "investment", investment);
app.use(api_suffix + "cricket", cricket);
app.use(api_suffix + "telegram", telegram);
app.use(api_suffix + "storage", storage);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
      .then(() => {
        console.log("CONNECTED TO THE DB");
      })
      .catch((err) => {
        console.log(err);
      });
    app.listen(3000);
  } catch (error) {
    console.log(error);
  }
};

start();
