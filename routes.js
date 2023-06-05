require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User } = require("./schema/UserSchema");
const xlsx = require("xlsx");
const nodemailer = require("nodemailer");
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const client = require("twilio")(accountSid, authToken);
// const passport = require('passport')

const PverificationCode = [];

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
    else console.log("sent!");
  });
};

const sendQueryMail = (name, email,subject, query)=>{
  const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
      user:`${process.env.MY_EMAIL}`,
      pass: `${process.env.MY_PASS}`
    }
  })

  const mailOpt = {
    from: email,
    to: `${process.env.MY_EMAIL}`,
    subject: `Query from ${name}: ${subject}`,
    text: `${query}`
  }

  transporter.sendMail(mailOpt,(err, info)=>{
    if(err) console.log(err);
    else console.log(info.response.split(' ')[2]);
  })
}

const sendCalcMail = (email) =>{
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: `${process.env.MY_EMAIL}`,
      pass: `${process.env.MY_PASS}`
    }
  })

  const mailOpt = {
    from: `${process.env.MY_EMAIL}`,
    to: email,
    subject: 'Your Forecast calculation is done!',
    text: 'Your Forecast calculation is done. You can check it out on the website.'
  }

  transporter.sendMail(mailOpt, (err, info)=>{
    if(err) console.log(err);
    else console.log(info.response.split(' ')[2]);
  })
}

router.get("/logout", (req, res) => {
  // req.logOut();
  req.session.destroy(() => {
    res.sendStatus(200);
  });
  //tutorial added redirect to process.env.CLIENT_URL
  // res.redirect('http://localhost:3000/')
});

// Endpoint to download the Excel file
router.get("/download", (req, res) => {
  const filePath = "C:\\Users\\Hp\\Downloads\\test.xlsx"; // Update with the actual file path

  res.download(filePath, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error downloading file");
    }
  });
});

router.post("/signup", async (req, res) => {
  const { username, email, password, verifyCode } = req.body;
  const verificationCode = req.session.verificationCode;
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
            res.send(result);
          }
        }
      );
    } catch (error) {
      console.log("error");
    }
  }
});

router.get("/dashboard", async (req, res) => {
  if (req.session.email !== undefined) {
    const email = req.session.email;
    const user = await User.findOne({ email });
    res.send(user);
  } else {
    res.sendStatus(401);
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.sendStatus(409);
    } else {
      bcrypt.compare(password, user.password, async (err, result) => {
        if (err) console.log("hash compare err: ", err);
        if (result) {
          req.session.email = user.email;
          res.send(user);
        } else {
          res.sendStatus(409);
        }
      });
    }
  } catch (error) {
    console.log("error: ", error);
  }
});

router.get("/forecast", (req, res) => {
  const filePath = "C:\\Users\\Hp\\Downloads\\test.xlsx"; // Update with the actual file path
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    const extractedData = jsonData.slice(1).map((row) => {
      const numericValue = parseFloat(row[3]);
      const dateObject = xlsx.SSF.parse_date_code(numericValue);

      return {
        date: `${String(dateObject.m).padStart(2, "0")}/${String(
          dateObject.d
        ).padStart(2, "0")}/${String(dateObject.y)}`,
        time: dateObject.H + ":" + dateObject.M + ":" + dateObject.S,
        Predictedpv: row[2],
        // Actualpv: row[1],
      };
    });
    // Send the data as JSON response
    res.json(extractedData);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error reading Excel file");
  }
});

router.post("/verify-email", async (req, res) => {
  const { email } = req.body;
  const isUserExist = await User.findOne({ email });
  if (!isUserExist) {
    const verificationCode = generateVerificationCode();
    sendVerificationEmail(email, verificationCode);
    // console.log('email sent');
    req.session.verificationCode = verificationCode;
    req.session.email = email;

    res.sendStatus(200);
  } else {
    res.sendStatus(409);
  }
});

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
});

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
});

router.post("/send-reset-password", async (req, res) => {
  const { email } = req.body;
  const isUserExist = await User.findOne({ email });
  if (isUserExist) {
    sendResetPassword(email, isUserExist._id);
    res.sendStatus(200);
  } else {
    res.sendStatus(409);
  }
});

router.put("/resetP/:userId", async (req, res) => {
  const {userId} = req.params;
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
});

router.post('/send-calc-mail', (req,res)=>{
  const {email} = req.body;
  try {
    sendCalcMail(email)
    res.sendStatus(200)
  } catch (error) {
    console.log(error);
  }
})

router.post('/query',(req,res)=>{
  const {name, email, subject, query} = req.body;
  try {
    sendQueryMail(name,email,subject,query);
    res.sendStatus(200)
  } catch (error) {
    console.log(error);
  }
})

// router.get('/login/success',(req,res)=>{
//   if(req.user){
//     res.status(200).json({
//       error:false,
//       message:"Login success!",
//       user: req.user
//     })
//   }else{
//     res.status(403).json({
//       error:true,
//       message: "UnAuthorized"
//     })
//   }
// })

// router.get('/login/failure',(req,res)=>{
//   res.status(401).json({
//     error: true,
//     message:"Login failed!"
//   })
// })

// router.get('/google',(req,res)=>{
//   passport.authenticate('google',["profile","email"])
// })

// router.get('/google/callback',(req,res)=>{
//   passport.authenticate('google', {
//     failureRedirect:'/login/failed',
//     successRedirect:'http://localhost:3000/'  //tutorial added process.env.client -- check later
//   });
// })

router.get("/", (req, res) => {
  res.send("Hello world");
});

module.exports = router;
