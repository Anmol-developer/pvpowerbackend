require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const helmet = require("helmet");
const routes = require('./routes.js');
// const passport = require('passport')
// const GoogleAuth = require('./GoogleAuth.js')
// const cookieSession = require('cookie-session')

// app.use(cookieSession({
//   keys: [`${process.env.SECRET}`],
//   name: "session",
//   maxAge: 24*60*60*100
// }))

// app.use(passport.initialize())
// app.use(passport.session())

app.use(cors({
  // origin:"http://localhost:3000",
  origin:"*",
  credentials:true
}));
app.use(helmet());
app.use(express.json());

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

const uri = process.env.URI;

mongoose.set("strictQuery", false);
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("connected!");
  });

// Use the routes middleware
app.use('/', routes);

app.listen(5000, () => {
  console.log("app listening on port 5000");
});
