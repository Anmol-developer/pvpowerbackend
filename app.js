require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const { User } = require("./schema/UserSchema");
const xlsx = require("xlsx");
const jwt = require("jsonwebtoken");
// const cookieParser = require('cookie-parser')
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/', limits: { fileSize: 100 * 1024 * 1024 }  });
app.use(cors());
app.use(express.json());
// app.use(cookieParser())

const uri = process.env.URI;

mongoose.set("strictQuery", false);
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("connected!");
  });

  const authenticate = (req,res,next)=>{
    const authHeader = req.headers['auth'];
      const token = authHeader && authHeader.split(' ')[1]
      if(token === null) return res.sendStatus(401);

      jwt.verify(token,process.env.SECRET,(err,userID)=>{
        if(err) return res.sendStatus(403)
        req.userID = userID;
        next()
      })
  }

app.get('/forecast',(req,res)=>{
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

// Endpoint to download the Excel file
app.get('/download', (req, res) => {
  const filePath = 'C:\\Users\\Hp\\Downloads\\test.xlsx'; // Update with the actual file path

  res.download(filePath, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error downloading file');
    }
  });
});


app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      res.send("user already exists");
    } else {
      try{
      const result = await User.create({ username, email, password });
      res.send(result);
    } catch (error) {
      console.log("error");
    }
    }
});

app.get("/dashboard",authenticate, async(req, res) => {
  const userID = req.userID;
  const user = await User.findById(userID)
  res.send(user);
});

app.post("/login",async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
  if (!user) {
    res.send("user does not exists");
  }
  const token = await user.generateToken();
  // res.setHeader('auth', `Bearer ${token}`)
  res.send(user);
  } catch (error) {
    console.log('error');
  }
});

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(5000, () => {
  console.log("app listening on port 5000");
});
