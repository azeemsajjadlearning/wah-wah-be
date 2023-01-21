const express = require("express");
const firebaseAdmin = require("firebase-admin");
const firebase = require("firebase");
const connectDB = require("./db/connect");
const cors = require("cors");

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

app.use(express.json());
app.use(cors());

const api_suffix = "/api/v1/";

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(api_suffix + "users", user);
app.use(api_suffix + "tasks", task);
app.use(api_suffix + "third-party", thirdParty);

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
