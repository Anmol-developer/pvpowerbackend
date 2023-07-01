require("dotenv").config();
const express = require("express");
const router = express.Router();
const { User } = require("./schema/UserSchema");

router.get("/data/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const data = await User.findById(userId);
    res.send(data.PredictedData);
  } catch (error) {
    console.log(error);
  }
}); //ok for

module.exports = router;
