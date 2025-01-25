const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const firebaseAdmin = require("firebase-admin");
const firebase = require("firebase");
const jwt = require("jsonwebtoken");

const register = (req, res) => {
  try {
    let firebaseUser;
    firebaseAdmin
      .auth()
      .createUser({
        email: req.body.email,
        password: req.body.password,
      })
      .then((user) => {
        firebaseUser = user;
      })
      .catch((err) => {
        res.send({ success: false, err });
      })
      .finally(async () => {
        if (firebaseUser) {
          req.body.user_id = firebaseUser.uid;
          const user = await User.create({ ...req.body });
          res
            .status(StatusCodes.CREATED)
            .send({ success: true, result: { db: user, firebaseUser } });
        }
      });
  } catch (error) {
    console.log(error);
    res.send({ success: false, err: error });
  }
};

const login = (req, res) => {
  firebase
    .auth()
    .signInWithEmailAndPassword(req.body.email, req.body.password)
    .then((user) => {
      firebaseUser = user.user;
      if (firebaseUser.emailVerified) {
        const payload = {
          user_id: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET);
        res.status(StatusCodes.OK).send({ success: true, result: token });
      } else
        res.status(StatusCodes.FORBIDDEN).send({
          success: false,
          error: "Email not verified!",
        });
    })
    .catch((err) => {
      res.status(StatusCodes.FORBIDDEN).send({ success: false, err });
    });
};

const logout = (req, res) => {
  try {
    firebase
      .auth()
      .signOut()
      .then(
        function () {
          res
            .status(StatusCodes.OK)
            .send({ success: true, result: "user logout!" });
        },
        function (error) {
          console.error("Sign Out Error", error);
          res.send({ success: false, error });
        }
      );
  } catch (error) {
    console.log(error);
    res.send({ success: false, error });
  }
};

const resetPassword = (req, res) => {
  firebaseAdmin
    .auth()
    .generatePasswordResetLink(req.body.email)
    .then((link) => {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_EMAIL,
          pass: process.env.EMAIL_PASS,
        },
      });
      const mailOptions = {
        from: process.env.EMAIL_EMAIL,
        to: req.body.email,
        subject: "Reset your password for " + process.env.APP_NAME,
        html: `<p>Hello,</p>
              <p>Follow this link to reset your password your email address.</p>
              ${link}
              <p>If you didn’t ask to reset your password, you can ignore this email.</p>
              <p>Thanks,</p>
              <p>Your ${process.env.APP_NAME} team</p>
            `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
        } else {
          res
            .status(StatusCodes.OK)
            .send({ success: true, result: "Email sent!" });
        }
      });
    })
    .catch((err) => {
      res.send({ success: false, err });
    });
};

const getUser = async (req, res) => {
  try {
    const user = await User.find({ user_id: req.user.user_id });
    if (user.length > 0)
      res.status(StatusCodes.OK).send({ success: true, result: user[0] });
    else
      res
        .status(StatusCodes.NOT_FOUND)
        .send({ success: false, result: "No user found" });
  } catch (error) {
    console.log(error);
    res.send({ success: false, err: error });
  }
};

const getAllUser = async (req, res) => {
  try {
    const users = await User.find();
    res.status(StatusCodes.OK).send({ success: true, result: users });
  } catch (error) {
    console.log(error);
    res.send({ success: false, err: error });
  }
};

const updateUser = async (req, res) => {
  try {
    const updateUser = await User.findOneAndUpdate(
      { user_id: req.user.user_id },
      req.body
    );
    res
      .status(StatusCodes.ACCEPTED)
      .send({ success: true, result: updateUser });
  } catch (error) {
    console.log(error);
    res.send({ success: false, err: error });
  }
};

module.exports = {
  register,
  login,
  logout,
  resetPassword,
  getUser,
  getAllUser,
  updateUser,
};
