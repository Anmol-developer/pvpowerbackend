require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const { User } = require("./schema/UserSchema");
const fs = require("fs");
const XLSX = require("xlsx");
const jwt = require("jsonwebtoken");

app.use(cors());
app.use(express.json());

const uri = process.env.URI;

mongoose.set("strictQuery", false);
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("connected!");
  });

  const authenticate = async(req,res,next)=>{
    try {
      const token = req.cookies.token;
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

app.get("/dashboard", authenticate, (req, res) => {
  res.send(req.user);
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) {
    res.send("user does not exists");
  }
  res.send(user);
  const token = await user.generateToken();
  res.cookie("token", token, {
    httpOnly:true,
    expires : new Date(Date.now() + 86400)
  })
});

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(5000, () => {
  console.log("app listening on port 5000");
});
