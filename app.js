require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const { User } = require("./schema/UserSchema");
const xlsx = require("xlsx");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser')

app.use(cors());
app.use(express.json());
app.use(cookieParser())

const uri = process.env.URI;

mongoose.set("strictQuery", false);
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("connected!");
  });

  const authenticate = async(req,res,next)=>{
    try {
      // const token = req.cookies.token;
      // console.log("cokie",req.cookies);
      const verify = jwt.verify(token, process.env.SECRET)
      const user = await User.findOne({_id:verify, "tokens.token":token});
      if(!user) { throw new Error('user not found') }
      req.user = user;
      req.token = token;

      next();
    } catch (error) {
      console.log(error);
    }
  }
app.get('/forecast',(req,res)=>{
  const filePath = 'C:\\Users\\Hp\\Downloads\\trial_forecast.xlsx'; // Update with the actual file path

  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    const extractedData = jsonData.slice(1).map((row) => {
      const numericValue = parseFloat(row[2]);
      const dateObject = xlsx.SSF.parse_date_code(numericValue);
      
      return {
        date: `${String(dateObject.m).padStart(2, "0")}/${String(
          dateObject.d
        ).padStart(2, "0")}/${String(dateObject.y)}`,
        time: dateObject.H + ":" + dateObject.M + ":" + dateObject.S,
        Predictedpv: row[1],
        // Actualpv: row[0],
      };
    });
    // Send the data as JSON response
    res.json(extractedData);
  } catch (error) {
    console.log(error);
    res.status(500).send('Error reading Excel file');
  }
})

// Endpoint to download the Excel file
app.get('/download', (req, res) => {
  const filePath = 'C:\\Users\\Hp\\Downloads\\trial_forecast.xlsx'; // Update with the actual file path

  res.download(filePath, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error downloading file');
    }
  });
});


app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  const isUserExist = User.findOne({ email });
  try {
    if (isUserExist) {
      res.send("user already exists");
    } else {
      const result = await User.create({ username, email, password });
      res.send(result);
    }
  } catch (error) {
    console.log(error);
  }
});

app.get("/dashboard", (req, res) => {
  res.send('hi');
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) {
    res.send("user does not exists");
  }
  res.send(user);
  const token = await user.generateToken();
   
});

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(5000, () => {
  console.log("app listening on port 5000");
});
