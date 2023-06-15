require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const helmet = require("helmet");
const router = require('./routes.js');
const forecast = require('./forecast.js');
const cookieParser = require('cookie-parser')

app.use(cookieParser());

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(cors({
  origin:`${process.env.CLIENT_URL}`,
  credentials:true
}));
app.use(helmet());
app.use(express.json());

const uri = process.env.URI;

mongoose.set("strictQuery", false);
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("connected!");
  });

// Use the routes middleware
app.use('/', router);
app.use('/forecast', forecast);

app.listen(process.env.PORT, () => {
  console.log("app listening!");
});
