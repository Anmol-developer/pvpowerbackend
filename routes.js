require("dotenv").config();
const express = require('express')
const router = express.Router()
const bcrypt = require("bcrypt");
const { User } = require("./schema/UserSchema");


router.get("/logout", (req, res) => {
    req.session.destroy(() => {
      res.sendStatus(200);
    });
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
    const { username, email, password } = req.body;
    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      res.send("user already exists");
    } else {
      try {
        bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS), async (err, hash) => {
          // Store hash in your password DB.
          if (err) console.log("hash err: ", err);
          else {
            const result = await User.create({ username, email, password: hash });
            res.send(result);
          }
        });
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
        res.send("user does not exists");
      } else {
        bcrypt.compare(password, user.password, async (err, result)=> {
          if (err) console.log("hash compare err: ", err);
          if (result) {
            // const token = await user.generateToken();
            req.session.email = user.email;
            res.send(user);
          }
        });
      }
    } catch (error) {
      console.log("error: ", error);
    }
  });
  
  router.get("/", (req, res) => {
    res.send("Hello world");
  });
  
  module.exports = router;