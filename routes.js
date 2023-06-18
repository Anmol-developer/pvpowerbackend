require("dotenv").config();
const { sign, verify } = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User } = require("./schema/UserSchema");
const nodemailer = require("nodemailer");
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const client = require("twilio")(accountSid, authToken);

const PverificationCode = [];

const sendCalcMail = (email) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: `${process.env.MY_EMAIL}`,
      pass: `${process.env.MY_PASS}`,
    },
  });

  const mailOpt = {
    from: `${process.env.MY_EMAIL}`,
    to: email,
    subject: "Your Forecast calculation is done!",
    text: "Your Forecast calculation is done. You can check it out on the website.",
  };

  transporter.sendMail(mailOpt, (err, info) => {
    if (err) console.log(err);
    else console.log(info.response.split(" ")[2]);
  });
};

const generateVerificationCode = () => {
  //generating a 4 digit code
  const code = Math.floor(1000 + Math.random() * 9000);
  return code.toString();
};

const sendVerificationEmail = (email, verificationCode) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: `${process.env.MY_EMAIL}`,
      pass: `${process.env.MY_PASS}`,
    },
  });

  const mailOpt = {
    from: `${process.env.MY_EMAIL}`,
    to: email,
    subject: "Verification email from PVcast",
    text: `Your verification code is ${verificationCode}`,
  };

  transporter.sendMail(mailOpt, (err, info) => {
    if (err) console.log("mail err: ", err);
    else {
      console.log("sent!");
    }
  });
};

const sendResetPassword = (email, userID) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: `${process.env.MY_EMAIL}`,
      pass: `${process.env.MY_PASS}`,
    },
  });

  const mailOpt = {
    from: `${process.env.MY_EMAIL}`,
    to: email,
    subject: "Reset Password - PVcast",
    text: `Your reset password reset link is http://localhost:${process.env.PORT}/reset-password/${userID}`,
  };

  transporter.sendMail(mailOpt, (err, info) => {
    if (err) console.log("mail err: ", err);
    else console.log("Sent mail");
  });
};

const sendQueryMail = (name, email, subject, query) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: `${process.env.MY_EMAIL}`,
      pass: `${process.env.MY_PASS}`,
    },
  });

  const mailOpt = {
    from: email,
    to: `${process.env.MY_EMAIL}`,
    subject: `Query from ${name}: ${subject}`,
    text: `${query}`,
  };

  transporter.sendMail(mailOpt, (err, info) => {
    if (err) console.log(err);
    else{
      console.log(info.response.split(" ")[2])
      return ('Sent mail')
    }
  });
};

router.get("/logout", (req, res) => {
  // req.logOut();
  req.session.destroy(() => {
    res.clearCookie("jsonwebtoken");
    res.sendStatus(200);
  });
}); //ok

router.post("/signup", async (req, res) => {
  const { username, email, password, verifyCode } = req.body;
  const verificationCode = req.session.verificationCode;
  if (req.cookies.jsonwebtoken) res.clearCookie("jsonwebtoken");

  if (parseInt(verificationCode) === parseInt(verifyCode)) {
    try {
      bcrypt.hash(
        password,
        parseInt(process.env.SALT_ROUNDS),
        async (err, hash) => {
          // Store hash in your password DB.
          if (err) console.log("hash err: ", err);
          else {
            const result = await User.create({
              username,
              email,
              password: hash,
            });
            const jsonwebtoken = sign(
              { userId: result._id },
              `${process.env.SECRET}`,
              { expiresIn: "48h" }
            );
            res.cookie("jsonwebtoken", jsonwebtoken, { httpOnly: true });
            res.send(result);
          }
        }
      );
    } catch (error) {
      console.log("error");
    }
  }
}); //ok

router.get("/dashboard", async (req, res) => {
  if (req.cookies.jsonwebtoken !== undefined) {
    const jsonwebtoken = req.cookies.jsonwebtoken;
    verify(jsonwebtoken, `${process.env.SECRET}`, async (err, decoded) => {
      if (err) {
        console.log(err);
        res.sendStatus(404);
      } else {
        const userId = decoded.userId;
        const user = await User.findById(userId);
        return res.send(user);
      }
    });
  } else {
    res.sendStatus(401);
  }
}); //ok

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (req.cookies.jsonwebtoken) res.clearCookie("jsonwebtoken");
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.sendStatus(409);
    } else {
      bcrypt.compare(password, user.password, async (err, result) => {
        if (err) console.log("hash compare err: ", err);
        if (result) {
          const jsonwebtoken = sign(
            { userId: user._id },
            `${process.env.SECRET}`,
            { expiresIn: "48h" }
          );
          res.cookie("jsonwebtoken", jsonwebtoken, { httpOnly: true });
          res.send(user);
        } else {
          res.sendStatus(409);
        }
      });
    }
  } catch (error) {
    console.log("error: ", error);
  }
}); //ok

router.get("/validate/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const data = await User.findById(userId);
    res
      .status(200)
      .send(data.PredictedData[data.PredictedData.length - 1]);
  } catch (error) {
    console.log(error);
  }
}); //ok for now

router.post("/verify-email", async (req, res) => {
  const { email } = req.body;
  const isUserExist = await User.findOne({ email });
  if (!isUserExist) {
    const verificationCode = generateVerificationCode();
    sendVerificationEmail(email, verificationCode);
    // console.log('email sent');
    req.session.verificationCode = verificationCode;
    // req.session.email = email;

    res.sendStatus(200);
  } else {
    res.sendStatus(409);
  }
}); //ok

router.get("/send-sms", (req, res) => {
  const PCode = generateVerificationCode();
  PverificationCode[0] = PCode;
  try {
    client.messages.create({
      body: `Hi! your verification code is ${PCode}`,
      from: `${process.env.TWILIO_NO}`,
      to: `${process.env.TWILIO_VERIFIED_NO}`,
    });

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
  }
}); //ok for now

router.post("/edit/:userID", async (req, res) => {
  const userID = req.params.userID;
  const { verifyCode, username, email, address, designation, phone, zipCode } =
    req.body;
  if (parseInt(verifyCode) === parseInt(PverificationCode[0])) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userID,
        {
          username,
          email,
          address,
          designation,
          phone,
          zipCode,
        },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      res.send(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(409).send("Invalid code");
  }
}); //ok for now

router.post("/send-reset-password", async (req, res) => {
  const { email } = req.body;
  const isUserExist = await User.findOne({ email });
  if (isUserExist) {
    sendResetPassword(email, isUserExist._id);
    res.sendStatus(200);
  } else {
    res.sendStatus(409);
  }
}); //ok for now

router.put("/resetP/:userId", async (req, res) => {
  const { userId } = req.params;
  const { password } = req.body;
  try {
    bcrypt.hash(
      password,
      parseInt(process.env.SALT_ROUNDS),
      async (err, hash) => {
        // Store hash in your password DB.
        if (err) console.log("hash err: ", err);
        else {
          const update = await User.findByIdAndUpdate(
            userId,
            { password: hash },
            { new: true }
          );
        }
      }
    );

    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(401);
    console.log(err);
  }
}); //ok for now

router.post("/send-calc-mail", (req, res) => {
  const { email } = req.body;
  try {
    sendCalcMail(email);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
  }
}); //ok for now

router.post("/query", (req, res) => {
  const { name, email, subject, query } = req.body;
  try {
    sendQueryMail(name, email, subject, query);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
  }
}); //ok for now

router.get("/history/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const history = await User.findById(userId);
    res.status(200).send(history.PredictedData);
  } catch (error) {
    console.log(error);
  }
}); //ok for now

router.delete("/delete/:userId", async (req, res) => {
  const { userId } = req.params;
  const { data } = req.query;
  try {
    const deleteData = await User.findById(userId);
    deleteData.PredictedData = deleteData.PredictedData.filter(
      (elem) => elem._id.toString() !== data
    );
    await deleteData.save();
    res.status(200).send(deleteData.PredictedData);
  } catch (error) {
    console.log(error);
  }
}); //ok for now

router.get("/", (req, res) => {
  if (req.cookies.jsonwebtoken) {
    const token = req.cookies.jsonwebtoken;
    verify(token, `${process.env.SECRET}`, async (err, decoded) => {
      if (err) {
        console.log(err);
        res.sendStatus(404);
      } else {
        const userId = decoded.userId;
        const user = await User.findById(userId);
        res.status(200).send(user);
      }
    });
  } else {
    res.status(409);
  }
}); //ok

module.exports = router;
