require("dotenv").config();
const express = require('express')
const router = express.Router()
const bcrypt = require("bcrypt");
const { User } = require("./schema/UserSchema");
const xlsx = require('xlsx')
const path = require('path')


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

  router.get('/forecast',(req,res)=>{
    const filePath = 'C:\\Users\\Hp\\Downloads\\test.xlsx'; // Update with the actual file path
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
      res.status(500).send('Error reading Excel file');
    }
  })
  
  
  router.get("/", (req, res) => {
    res.send("Hello world");
  });
  
  module.exports = router;