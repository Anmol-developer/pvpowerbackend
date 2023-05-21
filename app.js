require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const { User } = require("./schema/UserSchema");
const fs = require("fs");
const XLSX = require("xlsx");

app.use(cors());
app.use(express.json());

const uri = process.env.URI;

mongoose.set("strictQuery", false);
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("connected!");
  });

app.post("/signup", async(req, res) => {
  const { username, email, password } = req.body;
  const isUserExist = User.findOne({ email });
    try {
      if (isUserExist) {
        res.send('user already exists')
      } else {
        const result = await User.create({ username, email, password });
        res.send(result)
      }
    } catch (error) {
      console.log(error);
    }
    
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email,password })
    .then((data) => {
      if (data) {
        res.send(data);
      }else{
        res.send('user does not exists')
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(5000, () => {
  console.log("app listening on port 5000");
});
