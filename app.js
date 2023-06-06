require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const helmet = require("helmet");
const routes = require('./routes.js');

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(cors({
  origin:"http://localhost:3000",
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
app.use('/', routes);

app.listen(8080, () => {
  console.log("app listening on port 5000");
});
