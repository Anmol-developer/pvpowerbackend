require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const {User} = require('./schema/UserSchema')

app.use(cors());
app.use(express.json());

const uri = process.env.URI;

mongoose.set("strictQuery", false);
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("connected!");
  });

app.post('/', (req,res)=>{
    const {name, email, password} = req.body;
    User.findOne({email}).then((data)=>{
      if (data) {
        console.log('user already exists');
      } else{
        User.create({name,email,password}).then((data)=>{
          console.log(data);
          console.log(data.id);
      }).catch((err)=>console.log(err))
      }
    }).catch((err)=>{
        console.log(err);
    })
    
})

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(5000, () => {
  console.log("app listening on port 5000");
});
