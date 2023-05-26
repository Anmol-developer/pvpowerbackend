require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const { User } = require("./schema/UserSchema");
const xlsx = require("xlsx");
const session = require('express-session')
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:false
  })
)

const uri = process.env.URI;

mongoose.set("strictQuery", false);
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("connected!");
  });

app.get('/logout',(req,res)=>{
  req.session.destroy(()=>{
    res.sendStatus(200)
  })
})

// Endpoint to download the Excel file
app.get("/download", (req, res) => {
  const filePath = "C:\\Users\\Hp\\Downloads\\test.xlsx"; // Update with the actual file path

  res.download(filePath, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error downloading file");
    }
  });
});

app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  const isUserExist = await User.findOne({ email });
  if (isUserExist) {
    res.send("user already exists");
  } else {
    try {
      const result = await User.create({ username, email, password });
      res.send(result);
    } catch (error) {
      console.log("error");
    }
  }
});

app.get("/dashboard",async(req, res) => {
  if(req.session.email !== undefined){
  const email = req.session.email;
  const user = await User.findOne({email})
  res.send(user)}

  else{
    res.sendStatus(401);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) {
      res.send("user does not exists");
    }else{
    // const token = await user.generateToken();
    req.session.email = email;
    res.send(user);}
  } catch (error) {
    console.log("error: ", error);
  }
});

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(5000, () => {
  console.log("app listening on port 5000");
});
