require("dotenv").config();
const express = require("express");
const { User } = require("./schema/UserSchema");
const router = express.Router();

router.post("/", (req, res) => {
  const isCalcDone = req.body.isCalcDone;
  if (req.cookies.jsonwebtoken) {
    const token = req.cookies.jsonwebtoken;
    verify(token, `${process.env.SECRET}`, async (err, decoded) => {
      if (err) {
        console.log(err);
        res.sendStatus(404);
      } else {
        const userId = decoded.userId;
        const user = await User.findById(userId);
        user.isCalcDone = isCalcDone;
        user.save();
        res.status(200).send(user.isCalcDone);
      }
    });
  } else {
    res.status(409);
  }
});

router.get('/',(req,res)=>{
    if (req.cookies.jsonwebtoken) {
        const token = req.cookies.jsonwebtoken;
        verify(token, `${process.env.SECRET}`, async (err, decoded) => {
          if (err) {
            console.log(err);
            res.sendStatus(404);
          } else {
            const userId = decoded.userId;
            const user = await User.findById(userId);
            res.status(200).send(user.isCalcDone);
          }
        });
      } else {
        res.status(409);
      }
})

module.exports = calc;