require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const helmet = require("helmet");
const router = require('./routes.js');
const forecast = require('./forecast.js');
const sendData = require('./SendData.js');
const download = require('./download.js');
const cookieParser = require('cookie-parser')
const calc = require('./Calc.js')

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
app.use(express.json({limit:'1000mb'}));

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
app.use('/download',download)
app.use('/calc-state',calc)
app.use('/set-data',sendData) //saves user's uploaded data to mongodb

app.listen(process.env.PORT, () => {
  console.log("app listening!");
});
